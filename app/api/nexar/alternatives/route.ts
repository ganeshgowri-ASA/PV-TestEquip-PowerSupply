import { NextRequest, NextResponse } from 'next/server';
import {
  createNexarClient,
  DEFAULT_USD_TO_INR,
  INDIAN_VENDOR_KEYWORDS,
  INDIA_ACCESSIBLE_DISTRIBUTORS,
  type AlternativePart,
  type AlternativesResult,
} from '@/lib/nexar-client';

// ─── Request / Response Types ─────────────────────────────────────────────────

interface AlternativesRequestParams {
  /** MPN to find alternatives for */
  mpn: string;
  /** Max number of alternatives to return (default: 8) */
  limit?: string;
  /** USD → INR conversion rate (default: 83.5) */
  usdToInrRate?: string;
  /**
   * Filter mode:
   *   'all'    = all alternatives (default)
   *   'india'  = only alternatives available via Indian or India-accessible vendors
   */
  filter?: 'all' | 'india';
}

interface AlternativePartResponse {
  mpn: string;
  name: string;
  manufacturer: string;
  priceUSD: number | null;
  priceINR: number | null;
  stock: number;
  leadDays: number | null;
  datasheetUrl: string | null;
  indianSellers: string[];
  indiaAccessibleSellers: string[];
  indiaAvailable: boolean;
  source: string;
}

interface OriginalPartResponse {
  mpn: string;
  name: string;
  manufacturer: string;
  priceUSD: number | null;
  priceINR: number | null;
  stock: number;
  leadDays: number | null;
  datasheetUrl: string | null;
  indianSellers: string[];
  indiaAccessibleSellers: string[];
}

interface AlternativesResponse {
  originalMpn: string;
  usdToInrRate: number;
  filter: string;
  originalPart: OriginalPartResponse | null;
  alternatives: AlternativePartResponse[];
  totalAlternatives: number;
  indiaAvailableCount: number;
  // Summary: known Indian distributors checked
  indianVendorKeywords: string[];
  indiaAccessibleDistributors: string[];
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatAlternative(alt: AlternativePart): AlternativePartResponse {
  return {
    mpn: alt.mpn,
    name: alt.name,
    manufacturer: alt.manufacturer,
    priceUSD: alt.priceUSD,
    priceINR: alt.priceINR,
    stock: alt.stock,
    leadDays: alt.leadDays,
    datasheetUrl: alt.datasheetUrl,
    indianSellers: alt.indianSellers,
    indiaAccessibleSellers: alt.indiaAccessibleSellers,
    indiaAvailable:
      alt.indianSellers.length > 0 || alt.indiaAccessibleSellers.length > 0,
    source: alt.source,
  };
}

function formatOriginal(result: AlternativesResult): OriginalPartResponse | null {
  const p = result.originalPart;
  if (!p) return null;
  return {
    mpn: p.mpn,
    name: p.name,
    manufacturer: p.manufacturer.name,
    priceUSD: p.lowestPriceUSD,
    priceINR: p.lowestPriceINR,
    stock: p.totalStock,
    leadDays: p.shortestLeadDays,
    datasheetUrl: p.bestDatasheetUrl,
    indianSellers: p.indianSellers.map((s) => s.company.name),
    indiaAccessibleSellers: p.indiaAccessibleSellers.map((s) => s.company.name),
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const mpn = searchParams.get('mpn');
    const limitStr = searchParams.get('limit') ?? '8';
    const usdToInrRateStr = searchParams.get('usdToInrRate') ?? String(DEFAULT_USD_TO_INR);
    const filter = (searchParams.get('filter') ?? 'all') as AlternativesRequestParams['filter'];

    if (!mpn || mpn.trim() === '') {
      return NextResponse.json(
        { error: 'Query param "mpn" is required. Example: /api/nexar/alternatives?mpn=IRFB4115PBF' },
        { status: 400 },
      );
    }

    const limit = parseInt(limitStr, 10);
    if (isNaN(limit) || limit < 1 || limit > 20) {
      return NextResponse.json(
        { error: '"limit" must be an integer between 1 and 20' },
        { status: 400 },
      );
    }

    const usdToInrRate = parseFloat(usdToInrRateStr);
    if (isNaN(usdToInrRate) || usdToInrRate <= 0) {
      return NextResponse.json(
        { error: '"usdToInrRate" must be a positive number' },
        { status: 400 },
      );
    }

    if (filter !== 'all' && filter !== 'india') {
      return NextResponse.json(
        { error: '"filter" must be "all" or "india"' },
        { status: 400 },
      );
    }

    const apiKey = process.env.NEXAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'NEXAR_API_KEY environment variable is not configured' },
        { status: 500 },
      );
    }

    const nexar = createNexarClient(apiKey, usdToInrRate);
    const result = await nexar.findAlternatives(mpn.trim(), limit);

    let alternatives = result.alternatives.map(formatAlternative);

    // Apply India filter if requested
    if (filter === 'india') {
      alternatives = alternatives.filter((a) => a.indiaAvailable);
    }

    // Sort: India-available first, then by stock descending
    alternatives.sort((a, b) => {
      if (a.indiaAvailable && !b.indiaAvailable) return -1;
      if (!a.indiaAvailable && b.indiaAvailable) return 1;
      return b.stock - a.stock;
    });

    const response: AlternativesResponse = {
      originalMpn: mpn.trim(),
      usdToInrRate,
      filter: filter ?? 'all',
      originalPart: formatOriginal(result),
      alternatives,
      totalAlternatives: alternatives.length,
      indiaAvailableCount: alternatives.filter((a) => a.indiaAvailable).length,
      indianVendorKeywords: INDIAN_VENDOR_KEYWORDS,
      indiaAccessibleDistributors: INDIA_ACCESSIBLE_DISTRIBUTORS,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[nexar/alternatives] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import {
  createNexarClient,
  DEFAULT_USD_TO_INR,
  type NexarPart,
  type NexarSearchResult,
} from '@/lib/nexar-client';

// ─── Request / Response Types ─────────────────────────────────────────────────

interface SearchRequestBody {
  /** MPN string, keyword, or description */
  query: string;
  /** 'mpn' = exact/partial MPN search (default), 'keyword' = general search */
  type?: 'mpn' | 'keyword';
  /** Max results to return (default: 10) */
  limit?: number;
  /** USD → INR conversion rate (default: 83.5) */
  usdToInrRate?: number;
}

interface SellerSummary {
  name: string;
  homepageUrl?: string;
  isIndian: boolean;
  shipsToIndia: boolean;
  stock: number;
  moq: number;
  lowestPriceUSD: number | null;
  lowestPriceINR: number | null;
  leadDays: number | null;
  prices: { quantity: number; priceUSD: number; priceINR: number }[];
}

interface PartSummary {
  mpn: string;
  name: string;
  manufacturer: string;
  manufacturerUrl?: string;
  category: string | null;
  datasheetUrl: string | null;
  totalStock: number;
  lowestPriceUSD: number | null;
  lowestPriceINR: number | null;
  medianPrice1000USD: number | null;
  medianPrice1000INR: number | null;
  shortestLeadDays: number | null;
  sellers: SellerSummary[];
  indianSellers: string[];
  indiaAccessibleSellers: string[];
  specs: { name: string; value: string }[];
}

interface SearchResponse {
  hits: number;
  query: string;
  type: string;
  usdToInrRate: number;
  results: PartSummary[];
}

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatPart(part: NexarPart): PartSummary {
  const sellers: SellerSummary[] = part.sellers.map((s) => ({
    name: s.company.name,
    homepageUrl: s.company.homepageUrl,
    isIndian: s.company.isIndian,
    shipsToIndia: s.company.shipsToIndia,
    stock: s.offers.reduce((sum, o) => sum + o.inventoryLevel, 0),
    moq: s.offers[0]?.moq ?? 1,
    lowestPriceUSD: s.offers[0]?.lowestPriceUSD ?? null,
    lowestPriceINR: s.offers[0]?.lowestPriceINR ?? null,
    leadDays: s.offers[0]?.factoryLeadDays ?? null,
    prices: (s.offers[0]?.prices ?? []).map((p) => ({
      quantity: p.quantity,
      priceUSD: p.price,
      priceINR: p.priceINR,
    })),
  }));

  return {
    mpn: part.mpn,
    name: part.name,
    manufacturer: part.manufacturer.name,
    manufacturerUrl: part.manufacturer.homepageUrl,
    category: part.category?.name ?? null,
    datasheetUrl: part.bestDatasheetUrl,
    totalStock: part.totalStock,
    lowestPriceUSD: part.lowestPriceUSD,
    lowestPriceINR: part.lowestPriceINR,
    medianPrice1000USD: part.medianPrice1000?.price ?? null,
    medianPrice1000INR: part.medianPrice1000INR,
    shortestLeadDays: part.shortestLeadDays,
    sellers,
    indianSellers: part.indianSellers.map((s) => s.company.name),
    indiaAccessibleSellers: part.indiaAccessibleSellers.map((s) => s.company.name),
    specs: part.specs.map((s) => ({
      name: s.attribute.name,
      value: s.displayValue,
    })),
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: SearchRequestBody = await req.json();
    const { query, type = 'mpn', limit = 10, usdToInrRate = DEFAULT_USD_TO_INR } = body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json(
        { error: 'Missing or empty "query" field in request body' },
        { status: 400 },
      );
    }

    const apiKey = process.env.NEXAR_API_KEY;
    if (!apiKey || apiKey === 'placeholder' || apiKey === 'your_nexar_api_key_here') {
      return NextResponse.json(
        {
          error: 'Nexar API credentials not configured. Please set NEXAR_API_KEY=clientId:clientSecret in Vercel environment variables.',
          code: 'NEXAR_NOT_CONFIGURED',
        },
        { status: 503 },
      );
    }

    if (!apiKey.includes(':')) {
      return NextResponse.json(
        {
          error: 'NEXAR_API_KEY must be in the format clientId:clientSecret. Register at nexar.com/api to obtain credentials.',
          code: 'NEXAR_INVALID_FORMAT',
        },
        { status: 503 },
      );
    }

    const nexar = createNexarClient(apiKey, usdToInrRate);

    let rawResult: NexarSearchResult;
    if (type === 'keyword') {
      rawResult = await nexar.searchParts(query.trim(), limit);
    } else {
      rawResult = await nexar.searchByMPN(query.trim(), limit);
    }

    const response: SearchResponse = {
      hits: rawResult.hits,
      query: query.trim(),
      type,
      usdToInrRate,
      results: rawResult.results.map((r) => formatPart(r.part)),
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[nexar/search] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Detect OAuth/token errors and return a friendlier message
    if (message.includes('invalid_client') || message.includes('token exchange failed')) {
      return NextResponse.json(
        {
          error: 'Nexar API authentication failed. The API credentials are invalid. Please verify NEXAR_API_KEY=clientId:clientSecret in your environment variables.',
          code: 'NEXAR_AUTH_FAILED',
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

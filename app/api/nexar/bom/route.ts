import { NextRequest, NextResponse } from 'next/server';
import {
  createNexarClient,
  calculateBomCost,
  DEFAULT_USD_TO_INR,
  type BomLineItem,
  type BomSummary,
  type NexarPart,
} from '@/lib/nexar-client';

// ─── Request / Response Types ─────────────────────────────────────────────────

interface BomRequestBody {
  /**
   * Array of BOM line items to price and source.
   * Example:
   *   [{ mpn: "IRFB4115PBF", quantity: 40, designator: "Q1-Q40", description: "N-Ch MOSFET 150V 104A" }]
   */
  items: BomLineItem[];
  /** USD → INR conversion rate (default: 83.5) */
  usdToInrRate?: number;
}

interface BomLineResponse {
  mpn: string;
  quantity: number;
  designator?: string;
  description?: string;
  found: boolean;
  // Part details (null if not found)
  partName: string | null;
  manufacturer: string | null;
  category: string | null;
  datasheetUrl: string | null;
  // Pricing
  unitPriceUSD: number | null;
  unitPriceINR: number | null;
  extendedPriceUSD: number | null;
  extendedPriceINR: number | null;
  // Availability
  stock: number;
  leadDays: number | null;
  // Indian sourcing
  indianSellers: string[];
  indiaAccessibleSellers: string[];
  // Error / warning
  error?: string;
  warning?: string;
}

interface BomResponse {
  usdToInrRate: number;
  totalItems: number;
  lines: BomLineResponse[];
  // Totals
  totalUSD: number;
  totalINR: number;
  // Sourcing health
  fullySourceable: boolean;
  partsNotFound: string[];
  partsOutOfStock: string[];
  // Per-manufacturer breakdown
  manufacturerBreakdown: { manufacturer: string; totalUSD: number; totalINR: number }[];
  // Best Indian-accessible cost
  indiaAccessibleCount: number;
}

// ─── Formatter ────────────────────────────────────────────────────────────────

function buildBomLineResponse(
  line: BomLineItem,
  part: NexarPart | null,
  result: BomSummary['lines'][number],
): BomLineResponse {
  const warning =
    part && part.totalStock < line.quantity && part.totalStock > 0
      ? `Stock (${part.totalStock}) is less than required quantity (${line.quantity})`
      : undefined;

  return {
    mpn: line.mpn,
    quantity: line.quantity,
    designator: line.designator,
    description: line.description,
    found: result.found,
    partName: part?.name ?? null,
    manufacturer: part?.manufacturer.name ?? null,
    category: part?.category?.name ?? null,
    datasheetUrl: part?.bestDatasheetUrl ?? null,
    unitPriceUSD: result.unitPriceUSD,
    unitPriceINR: result.unitPriceINR,
    extendedPriceUSD: result.extendedPriceUSD,
    extendedPriceINR: result.extendedPriceINR,
    stock: result.stock,
    leadDays: result.leadDays,
    indianSellers: part?.indianSellers.map((s) => s.company.name) ?? [],
    indiaAccessibleSellers:
      part?.indiaAccessibleSellers.map((s) => s.company.name) ?? [],
    error: result.error,
    warning,
  };
}

function buildManufacturerBreakdown(
  lines: BomLineResponse[],
): { manufacturer: string; totalUSD: number; totalINR: number }[] {
  const map = new Map<string, { totalUSD: number; totalINR: number }>();
  for (const line of lines) {
    if (!line.manufacturer || line.extendedPriceUSD === null) continue;
    const existing = map.get(line.manufacturer) ?? { totalUSD: 0, totalINR: 0 };
    existing.totalUSD = Math.round((existing.totalUSD + line.extendedPriceUSD) * 100) / 100;
    existing.totalINR = Math.round((existing.totalINR + (line.extendedPriceINR ?? 0)) * 100) / 100;
    map.set(line.manufacturer, existing);
  }
  return Array.from(map.entries())
    .map(([manufacturer, totals]) => ({ manufacturer, ...totals }))
    .sort((a, b) => b.totalUSD - a.totalUSD);
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: BomRequestBody = await req.json();
    const { items, usdToInrRate = DEFAULT_USD_TO_INR } = body;

    // Validate input
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: '"items" must be a non-empty array of BOM line items' },
        { status: 400 },
      );
    }

    for (const item of items) {
      if (!item.mpn || typeof item.mpn !== 'string') {
        return NextResponse.json(
          { error: 'Each BOM item must have a valid "mpn" string' },
          { status: 400 },
        );
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return NextResponse.json(
          { error: `BOM item "${item.mpn}" must have a positive "quantity"` },
          { status: 400 },
        );
      }
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

    const nexar = createNexarClient(apiKey, usdToInrRate);

    // Deduplicate MPNs before fetching (use first occurrence's quantity for lookup)
    const uniqueMpns = Array.from(new Set(items.map((i) => i.mpn)));
    const partsMap = await nexar.batchLookup(uniqueMpns);

    // Calculate BOM costs
    const summary = calculateBomCost(items, partsMap, usdToInrRate);

    // Build response lines
    const responseLines: BomLineResponse[] = summary.lines.map((result) =>
      buildBomLineResponse(result.lineItem, result.part, result),
    );

    const response: BomResponse = {
      usdToInrRate,
      totalItems: items.length,
      lines: responseLines,
      totalUSD: summary.totalUSD,
      totalINR: summary.totalINR,
      fullySourceable: summary.fullySourceable,
      partsNotFound: summary.partsNotFound,
      partsOutOfStock: summary.partsOutOfStock,
      manufacturerBreakdown: buildManufacturerBreakdown(responseLines),
      indiaAccessibleCount: responseLines.filter(
        (l) => l.indiaAccessibleSellers.length > 0,
      ).length,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error('[nexar/bom] Error:', error);
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

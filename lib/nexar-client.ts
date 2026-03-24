import { GraphQLClient, gql } from 'graphql-request';

const NEXAR_TOKEN_URL = 'https://identity.nexar.com/connect/token';
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getNexarAccessToken(clientId: string, clientSecret: string): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'supply.domain',
  });
  const res = await fetch(NEXAR_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Nexar token exchange failed (${res.status}): ${errText}`);
  }
  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };
  return cachedToken.token;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const NEXAR_API_URL = 'https://api.nexar.com/graphql';
export const DEFAULT_USD_TO_INR = 83.5;

// ─── Indian vendors / distributors ───────────────────────────────────────────
export const INDIAN_VENDOR_KEYWORDS = [
  'robu', 'sunrom', 'evelta', 'sp robotics', 'rhydolabz', 'nex robotics',
  'ktechnics', 'silicon circuits', 'semikart', 'protoview', 'componentsinfo',
  'bme tech', 'electroncomponents', 'controltech', 'ems technologies',
];

// Distributors that ship to India (global but India-accessible)
export const INDIA_ACCESSIBLE_DISTRIBUTORS = [
  'mouser', 'digikey', 'arrow', 'farnell', 'element14', 'rs components',
  'rs online', 'tme', 'avnet', 'future electronics', 'verical',
];

// ─── TypeScript Types ─────────────────────────────────────────────────────────

export interface NexarPrice {
  quantity: number;
  price: number;
  currency: string;
  priceINR: number; // converted price
}

export interface NexarOffer {
  inventoryLevel: number;
  moq: number;
  factoryLeadDays: number | null;
  onOrderQuantity: number;
  prices: NexarPrice[];
  lowestPriceUSD: number | null;
  lowestPriceINR: number | null;
}

export interface NexarSeller {
  company: {
    name: string;
    homepageUrl?: string;
    isIndian: boolean;
    shipsToIndia: boolean;
  };
  offers: NexarOffer[];
}

export interface NexarSpec {
  attribute: { name: string; shortname: string };
  displayValue: string;
}

export interface NexarPart {
  mpn: string;
  name: string;
  manufacturer: { name: string; homepageUrl?: string };
  medianPrice1000: { price: number; currency: string; quantity: number } | null;
  medianPrice1000INR: number | null;
  category: { id: string; name: string } | null;
  bestDatasheetUrl: string | null;
  sellers: NexarSeller[];
  specs: NexarSpec[];
  similarParts: { mpn: string; name: string }[];
  // Computed convenience fields
  totalStock: number;
  lowestPriceUSD: number | null;
  lowestPriceINR: number | null;
  shortestLeadDays: number | null;
  indianSellers: NexarSeller[];
  indiaAccessibleSellers: NexarSeller[];
}

export interface NexarSearchResult {
  hits: number;
  results: { part: NexarPart }[];
}

// ─── Raw GraphQL response shapes (before enrichment) ─────────────────────────

interface RawPrice {
  quantity: number;
  price: number;
  currency: string;
}

interface RawOffer {
  inventoryLevel: number;
  moq: number;
  factoryLeadDays: number | null;
  onOrderQuantity: number;
  prices: RawPrice[];
}

interface RawSeller {
  company: { name: string; homepageUrl?: string };
  offers: RawOffer[];
}

interface RawPart {
  mpn: string;
  name: string;
  manufacturer: { name: string; homepageUrl?: string };
  medianPrice1000: { price: number; currency: string; quantity: number } | null;
  category: { id: string; name: string } | null;
  bestDatasheet: { url: string } | null;
  sellers: RawSeller[];
  specs: NexarSpec[];
  similarParts: { mpn: string; name: string }[];
}

interface RawSearchResult {
  hits: number;
  results: { part: RawPart }[];
}

// ─── BOM Types ────────────────────────────────────────────────────────────────

export interface BomLineItem {
  mpn: string;
  quantity: number;
  description?: string;
  designator?: string;
}

export interface BomResultLine {
  lineItem: BomLineItem;
  part: NexarPart | null;
  unitPriceUSD: number | null;
  unitPriceINR: number | null;
  extendedPriceUSD: number | null;
  extendedPriceINR: number | null;
  stock: number;
  leadDays: number | null;
  found: boolean;
  error?: string;
}

export interface BomSummary {
  lines: BomResultLine[];
  totalUSD: number;
  totalINR: number;
  fullySourceable: boolean;
  partsNotFound: string[];
  partsOutOfStock: string[];
}

// ─── Alternatives Types ───────────────────────────────────────────────────────

export interface AlternativePart {
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
  source: 'similar_part' | 'keyword_search';
}

export interface AlternativesResult {
  originalMpn: string;
  originalPart: NexarPart | null;
  alternatives: AlternativePart[];
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function usdToInr(usd: number, rate = DEFAULT_USD_TO_INR): number {
  return Math.round(usd * rate * 100) / 100;
}

function classifySeller(name: string): { isIndian: boolean; shipsToIndia: boolean } {
  const lower = name.toLowerCase();
  const isIndian = INDIAN_VENDOR_KEYWORDS.some((kw) => lower.includes(kw));
  const shipsToIndia =
    isIndian || INDIA_ACCESSIBLE_DISTRIBUTORS.some((kw) => lower.includes(kw));
  return { isIndian, shipsToIndia };
}

function enrichPart(raw: RawPart, usdRate = DEFAULT_USD_TO_INR): NexarPart {
  const sellers: NexarSeller[] = (raw.sellers ?? []).map((s) => {
    const { isIndian, shipsToIndia } = classifySeller(s.company.name);
    const offers: NexarOffer[] = (s.offers ?? []).map((o) => {
      const prices: NexarPrice[] = (o.prices ?? []).map((p) => ({
        ...p,
        priceINR: usdToInr(p.price, usdRate),
      }));
      const allPrices = prices.map((p) => p.price).filter((p) => p > 0);
      return {
        inventoryLevel: o.inventoryLevel ?? 0,
        moq: o.moq ?? 1,
        factoryLeadDays: o.factoryLeadDays ?? null,
        onOrderQuantity: o.onOrderQuantity ?? 0,
        prices,
        lowestPriceUSD: allPrices.length ? Math.min(...allPrices) : null,
        lowestPriceINR:
          allPrices.length ? usdToInr(Math.min(...allPrices), usdRate) : null,
      };
    });
    return {
      company: { ...s.company, isIndian, shipsToIndia },
      offers,
    };
  });

  // Aggregate convenience fields
  const allLowest = sellers
    .flatMap((s) => s.offers)
    .map((o) => o.lowestPriceUSD)
    .filter((p): p is number => p !== null);

  const totalStock = sellers
    .flatMap((s) => s.offers)
    .reduce((sum, o) => sum + (o.inventoryLevel ?? 0), 0);

  const allLeadDays = sellers
    .flatMap((s) => s.offers)
    .map((o) => o.factoryLeadDays)
    .filter((d): d is number => d !== null);

  const lowestPriceUSD = allLowest.length ? Math.min(...allLowest) : null;

  const medianPrice1000INR =
    raw.medianPrice1000 != null
      ? usdToInr(raw.medianPrice1000.price, usdRate)
      : null;

  return {
    mpn: raw.mpn,
    name: raw.name,
    manufacturer: raw.manufacturer,
    medianPrice1000: raw.medianPrice1000,
    medianPrice1000INR,
    category: raw.category ?? null,
    bestDatasheetUrl: raw.bestDatasheet?.url ?? null,
    sellers,
    specs: raw.specs ?? [],
    similarParts: raw.similarParts ?? [],
    totalStock,
    lowestPriceUSD,
    lowestPriceINR: lowestPriceUSD !== null ? usdToInr(lowestPriceUSD, usdRate) : null,
    shortestLeadDays: allLeadDays.length ? Math.min(...allLeadDays) : null,
    indianSellers: sellers.filter((s) => s.company.isIndian),
    indiaAccessibleSellers: sellers.filter((s) => s.company.shipsToIndia),
  };
}

// ─── GraphQL Fragments ────────────────────────────────────────────────────────

const PART_FIELDS = gql`
  fragment PartFields on SupPart {
    mpn
    name
    manufacturer { name homepageUrl }
    medianPrice1000 { price currency quantity }
    category { id name }
    bestDatasheet { url }
    sellers {
      company { name homepageUrl }
      offers {
        inventoryLevel
        moq
        factoryLeadDays
        onOrderQuantity
        prices { quantity price currency }
      }
    }
    specs {
      attribute { name shortname }
      displayValue
    }
    similarParts { mpn name }
  }
`;

// ─── Nexar Client Factory ─────────────────────────────────────────────────────

export function createNexarClient(
  apiKey: string,
  usdToInrRate = DEFAULT_USD_TO_INR,
) {
  const [clientId, clientSecret] = apiKey.includes(':') ? apiKey.split(':') : [apiKey, ''];
  async function makeClient(): Promise<GraphQLClient> {
    const token = await getNexarAccessToken(clientId, clientSecret);
    return new GraphQLClient(NEXAR_API_URL, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
  /**
   * Search by exact or partial MPN.
   */
  async function searchByMPN(mpn: string, limit = 10): Promise<NexarSearchResult> {
    const query = gql`
      ${PART_FIELDS}
      query SearchMPN($q: String!, $limit: Int!) {
        supSearchMpn(q: $q, limit: $limit) {
          hits
          results { part { ...PartFields } }
        }
      }
    `;
    const data = await (await makeClient()).request<{ supSearchMpn: RawSearchResult }>(query, {
      q: mpn,
      limit,
    });
    return {
      hits: data.supSearchMpn.hits,
      results: data.supSearchMpn.results.map((r: { part: RawPart }) => ({
        part: enrichPart(r.part, usdToInrRate),
      })),
    };
  }

  /**
   * General keyword search (description, specs, etc.).
   */
  async function searchParts(
    queryStr: string,
    limit = 10,
  ): Promise<NexarSearchResult> {
    const query = gql`
      ${PART_FIELDS}
      query SearchParts($q: String!, $limit: Int!) {
        supSearch(q: $q, limit: $limit) {
          hits
          results { part { ...PartFields } }
        }
      }
    `;
    const data = await (await makeClient()).request<{ supSearch: RawSearchResult }>(query, {
      q: queryStr,
      limit,
    });
    return {
      hits: data.supSearch.hits,
      results: data.supSearch.results.map((r: { part: RawPart }) => ({
        part: enrichPart(r.part, usdToInrRate),
      })),
    };
  }

  /**
   * Batch lookup for a list of MPNs. Returns enriched parts keyed by input MPN.
   */
  async function batchLookup(
    mpns: string[],
  ): Promise<Record<string, NexarPart | null>> {
    // Nexar doesn't have a native batch endpoint, so we parallel-fetch.
    const results = await Promise.allSettled(
      mpns.map((mpn) => searchByMPN(mpn, 1)),
    );
    const map: Record<string, NexarPart | null> = {};
    mpns.forEach((mpn, i) => {
      const res = results[i];
      if (res.status === 'fulfilled' && res.value.results.length > 0) {
        map[mpn] = res.value.results[0].part;
      } else {
        map[mpn] = null;
      }
    });
    return map;
  }

  /**
   * Find alternative / substitute parts for a given MPN.
   * Returns enriched parts from the similarParts field + a keyword search.
   */
  async function findAlternatives(
    mpn: string,
    limit = 8,
  ): Promise<AlternativesResult> {
    const searchResult = await searchByMPN(mpn, 1);
    const originalPart =
      searchResult.results.length > 0 ? searchResult.results[0].part : null;

    const seen = new Set<string>();
    const alternatives: AlternativePart[] = [];

    function addPart(p: NexarPart, source: AlternativePart['source']) {
      if (seen.has(p.mpn) || p.mpn === mpn) return;
      seen.add(p.mpn);
      alternatives.push({
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
        source,
      });
    }

    // 1. similarParts from original
    if (originalPart?.similarParts.length) {
      const simMpns = originalPart.similarParts.slice(0, limit).map((s) => s.mpn);
      const simResults = await Promise.allSettled(
        simMpns.map((m) => searchByMPN(m, 1)),
      );
      simResults.forEach((res) => {
        if (res.status === 'fulfilled' && res.value.results.length > 0) {
          addPart(res.value.results[0].part, 'similar_part');
        }
      });
    }

    // 2. Keyword fallback if we still need more alternatives
    if (alternatives.length < 3 && originalPart) {
      const category = originalPart.category?.name ?? originalPart.name;
      const kwResult = await searchParts(category, limit);
      kwResult.results.forEach((r) => addPart(r.part, 'keyword_search'));
    }

    return { originalMpn: mpn, originalPart, alternatives };
  }

  return { searchByMPN, searchParts, batchLookup, findAlternatives };
}

export type NexarClient = ReturnType<typeof createNexarClient>;

// ─── BOM Cost Calculator ──────────────────────────────────────────────────────

export function calculateBomCost(
  lines: BomLineItem[],
  partsMap: Record<string, NexarPart | null>,
  usdToInrRate = DEFAULT_USD_TO_INR,
): BomSummary {
  let totalUSD = 0;
  let totalINR = 0;
  const partsNotFound: string[] = [];
  const partsOutOfStock: string[] = [];

  const resultLines: BomResultLine[] = lines.map((line) => {
    const part = partsMap[line.mpn] ?? null;

    if (!part) {
      partsNotFound.push(line.mpn);
      return {
        lineItem: line,
        part: null,
        unitPriceUSD: null,
        unitPriceINR: null,
        extendedPriceUSD: null,
        extendedPriceINR: null,
        stock: 0,
        leadDays: null,
        found: false,
        error: 'Part not found in Nexar database',
      };
    }

    const unitPriceUSD = part.lowestPriceUSD;
    const unitPriceINR =
      unitPriceUSD !== null ? Math.round(unitPriceUSD * usdToInrRate * 100) / 100 : null;
    const extendedPriceUSD =
      unitPriceUSD !== null ? Math.round(unitPriceUSD * line.quantity * 100) / 100 : null;
    const extendedPriceINR =
      unitPriceINR !== null ? Math.round(unitPriceINR * line.quantity * 100) / 100 : null;

    if (extendedPriceUSD !== null) totalUSD += extendedPriceUSD;
    if (extendedPriceINR !== null) totalINR += extendedPriceINR;

    if (part.totalStock < line.quantity) {
      partsOutOfStock.push(line.mpn);
    }

    return {
      lineItem: line,
      part,
      unitPriceUSD,
      unitPriceINR,
      extendedPriceUSD,
      extendedPriceINR,
      stock: part.totalStock,
      leadDays: part.shortestLeadDays,
      found: true,
    };
  });

  return {
    lines: resultLines,
    totalUSD: Math.round(totalUSD * 100) / 100,
    totalINR: Math.round(totalINR * 100) / 100,
    fullySourceable: partsNotFound.length === 0 && partsOutOfStock.length === 0,
    partsNotFound,
    partsOutOfStock,
  };
}

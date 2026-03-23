import { NextRequest, NextResponse } from 'next/server';

// Multi-marketplace search aggregator
// In production, each marketplace has its own API client.
// For now, this provides a unified search interface with demo fallback.

interface MarketplaceResult {
  marketplace: string;
  mpn: string;
  manufacturer: string;
  description: string;
  unitPrice: number;
  currency: string;
  stock: number;
  moq: number;
  leadDays: number;
}

async function searchMouser(query: string, limit: number): Promise<MarketplaceResult[]> {
  const apiKey = process.env.MOUSER_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(
      `https://api.mouser.com/api/v2/search/keyword?apiKey=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SearchByKeywordRequest: {
            keyword: query,
            records: limit,
            startingRecord: 0,
            searchOptions: '1',
          },
        }),
      }
    );
    const data = await res.json();
    const parts = data?.SearchResults?.Parts || [];
    return parts.map((p: any) => ({
      marketplace: 'Mouser',
      mpn: p.ManufacturerPartNumber || '',
      manufacturer: p.Manufacturer || '',
      description: p.Description || '',
      unitPrice: parseFloat(p.PriceBreaks?.[0]?.Price?.replace(/[^0-9.]/g, '') || '0'),
      currency: 'USD',
      stock: parseInt(p.Availability?.replace(/[^0-9]/g, '') || '0'),
      moq: parseInt(p.Min || '1'),
      leadDays: parseInt(p.LeadTime || '14'),
    }));
  } catch {
    return [];
  }
}

async function searchDigiKey(query: string, limit: number): Promise<MarketplaceResult[]> {
  const clientId = process.env.DIGIKEY_CLIENT_ID;
  const clientSecret = process.env.DIGIKEY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return [];
  // Digi-Key requires OAuth2 token - simplified placeholder
  return [];
}

async function searchElement14(query: string, limit: number): Promise<MarketplaceResult[]> {
  const apiKey = process.env.ELEMENT14_API_KEY;
  if (!apiKey) return [];
  try {
    const res = await fetch(
      `https://api.element14.com/catalog/products?term=any%3A${encodeURIComponent(query)}&storeInfo.id=in.element14.com&resultsSettings.offset=0&resultsSettings.numberOfResults=${limit}&resultsSettings.responseGroup=medium&callInfo.apiKey=${apiKey}&callInfo.responseDataFormat=JSON`
    );
    const data = await res.json();
    const products = data?.manufacturerPartNumberSearchReturn?.products || [];
    return products.map((p: any) => ({
      marketplace: 'Element14',
      mpn: p.translatedManufacturerPartNumber || '',
      manufacturer: p.vendorName || '',
      description: p.displayName || '',
      unitPrice: p.prices?.[0]?.cost || 0,
      currency: 'USD',
      stock: p.stock?.level || 0,
      moq: p.translatedMinimumOrderQuality || 1,
      leadDays: 21,
    }));
  } catch {
    return [];
  }
}

async function searchTME(query: string, limit: number): Promise<MarketplaceResult[]> {
  const apiKey = process.env.TME_API_KEY;
  if (!apiKey) return [];
  // TME uses HMAC-signed requests - simplified placeholder
  return [];
}

export async function POST(req: NextRequest) {
  try {
    const { query, limit = 10 } = await req.json();
    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Search all marketplaces in parallel
    const [mouser, digikey, element14, tme] = await Promise.all([
      searchMouser(query, limit),
      searchDigiKey(query, limit),
      searchElement14(query, limit),
      searchTME(query, limit),
    ]);

    const results = [...mouser, ...digikey, ...element14, ...tme];

    return NextResponse.json({ results, total: results.length });
  } catch (error: any) {
    console.error('Marketplace search error:', error);
    return NextResponse.json({ error: error.message || 'Search failed' }, { status: 500 });
  }
}

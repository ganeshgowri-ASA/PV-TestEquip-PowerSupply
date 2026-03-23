import { NextRequest, NextResponse } from 'next/server';
import { createNexarClient } from '@/lib/nexar-client';

export async function POST(req: NextRequest) {
  try {
    const { query, type = 'mpn', limit = 10 } = await req.json();
    const token = process.env.NEXAR_API_TOKEN;
    if (!token) return NextResponse.json({ error: 'Nexar API token not configured' }, { status: 500 });
    const client = createNexarClient(token);
    let result;
    if (type === 'mpn') {
      result = await client.searchByMPN(query, limit);
    } else if (type === 'general') {
      result = await client.searchParts(query, limit);
    } else if (type === 'alternatives') {
      result = await client.getAlternatives(query, limit);
    } else {
      return NextResponse.json({ error: 'Invalid search type' }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Nexar API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}

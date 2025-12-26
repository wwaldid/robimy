import { NextRequest, NextResponse } from 'next/server';
import { getProductByCatalog } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ catalognr: string }> }
) {
  try {
    const { catalognr } = await params;
    const product = await getProductByCatalog(catalognr);

    if (!product) {
      return NextResponse.json(
        { error: 'Produkt nie został znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

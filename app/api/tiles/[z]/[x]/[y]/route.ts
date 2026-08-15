import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  context: { params: { z: string; x: string; y: string } | Promise<{ z: string; x: string; y: string }> }
) {
  const resolvedParams = await Promise.resolve(context.params);
  const { z, x, y } = resolvedParams;
  const cleanY = y.replace(/\.png$/, '');

  if (!/^\d+$/.test(z) || !/^\d+$/.test(x) || !/^\d+$/.test(cleanY)) {
    return new NextResponse('Invalid tile coordinates', { status: 400 });
  }

  const subdomains = ['a', 'b', 'c'];
  const sub = subdomains[Math.abs(parseInt(cleanY, 10)) % subdomains.length];
  const osmUrl = `https://${sub}.tile.openstreetmap.org/${z}/${x}/${cleanY}.png`;

  try {
    const tileRes = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'OuednaTourismPlatform/1.0 (contact@ouedna.dz)',
      },
    });

    if (!tileRes.ok) {
      return new NextResponse('Tile not found', { status: tileRes.status });
    }

    const buffer = await tileRes.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    console.error('Error proxying tile:', err);
    return new NextResponse('Error fetching tile', { status: 500 });
  }
}

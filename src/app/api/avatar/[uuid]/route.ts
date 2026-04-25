import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await context.params;
  const { searchParams } = new URL(request.url);
  const size = searchParams.get('size') || '64';

  // Try multiple services in sequence
  const services = [
    `https://mc-heads.net/avatar/${uuid}/${size}`,
    `https://minotar.net/avatar/${uuid}/${size}`,
    `https://crafatar.com/avatars/${uuid}?size=${size}&overlay&default=Minecraft`,
  ];

  for (const url of services) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; EchoServerLookup/1.0)',
        },
        redirect: 'follow',
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || 'image/png';

        return new NextResponse(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=86400',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
    } catch (err) {
      continue;
    }
  }

  // All services failed - return SVG fallback
  const isAlex = uuid.endsWith('e') || uuid.endsWith('a');
  const skinColor = isAlex ? '%23A38C7F' : '%23FFDBB5';
  const hairColor = isAlex ? '%23595959' : '%2357271F';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
    <rect fill="${hairColor}" x="16" y="8" width="32" height="12"/>
    <rect fill="${hairColor}" x="12" y="20" width="40" height="8"/>
    <rect fill="${skinColor}" x="16" y="20" width="32" height="24"/>
    <rect fill="#333" x="20" y="24" width="8" height="6"/>
    <rect fill="#333" x="36" y="24" width="8" height="6"/>
    <rect fill="${skinColor}" x="12" y="22" width="4" height="16"/>
    <rect fill="${skinColor}" x="48" y="22" width="4" height="16"/>
  </svg>`;

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

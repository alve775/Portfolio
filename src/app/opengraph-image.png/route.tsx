import { ImageResponse } from 'next/og';

import { site } from '@/lib/site';

const size = { width: 1200, height: 630 };

export const dynamic = 'force-static';

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 84,
        background: '#f5f6f8',
        color: '#14181f',
      }}
    >
      <div style={{ fontSize: 68 }}>{site.name}</div>
      <div style={{ marginTop: 30, maxWidth: 940, fontSize: 34, lineHeight: 1.35 }}>
        {site.positioning}
      </div>
      <div style={{ marginTop: 48, fontSize: 24, color: '#1a3fa0' }}>
        {site.affiliationShort}
      </div>
    </div>,
    size,
  );
}

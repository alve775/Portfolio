import type { Metadata } from 'next';

import { site } from '@/lib/site';

import './globals.css';

// Phase A placeholder. The full metadata export (metadataBase, title template,
// Open Graph), the JSON-LD Person block, the self-hosted fonts, and the
// header/footer land in Phase C.
export const metadata: Metadata = {
  title: site.name,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

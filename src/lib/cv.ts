import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

export const cvPdfPath = process.env.PORTFOLIO_CV_PATH
  ? path.resolve(process.env.PORTFOLIO_CV_PATH)
  : path.join(process.cwd(), 'public', 'cv.pdf');

export function hasCvPdf(): boolean {
  return fs.existsSync(cvPdfPath);
}

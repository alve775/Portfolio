import 'server-only';

import { getPapers } from '@/lib/content';
import { hasCvPdf } from '@/lib/cv';
import { evaluateLaunchReadiness } from '@/lib/readiness-core';
import { productionOrigin, publicEmail, usableProfiles } from '@/lib/site';

export function getLaunchReadiness() {
  const isReady = evaluateLaunchReadiness({
    hasOrigin: productionOrigin !== null,
    hasEmail: publicEmail !== null,
    profileCount: usableProfiles.length,
    paperCount: getPapers().length,
    hasCv: hasCvPdf(),
  });

  return { isReady, origin: productionOrigin };
}

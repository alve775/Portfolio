export type ReadinessInput = {
  hasOrigin: boolean;
  hasEmail: boolean;
  profileCount: number;
  paperCount: number;
  hasCv: boolean;
  isPreview?: boolean;
};

export function evaluateLaunchReadiness(input: ReadinessInput): boolean {
  return (
    !input.isPreview &&
    input.hasOrigin &&
    input.hasEmail &&
    input.profileCount > 0 &&
    input.paperCount > 0 &&
    input.hasCv
  );
}

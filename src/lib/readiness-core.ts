export type ReadinessInput = {
  hasOrigin: boolean;
  hasEmail: boolean;
  profileCount: number;
  paperCount: number;
  hasCv: boolean;
};

export function evaluateLaunchReadiness(input: ReadinessInput): boolean {
  return (
    input.hasOrigin &&
    input.hasEmail &&
    input.profileCount === 5 &&
    input.paperCount > 0 &&
    input.hasCv
  );
}

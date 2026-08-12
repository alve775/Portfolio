/**
 * `{{TODO}}` tokens are supposed to fail visibly, but they must never become a
 * live `href` — a link to `mailto:{{TODO: ...}}` is worse than no link at all.
 * Components use this to render the token as inert text until the owner
 * supplies the real value.
 */
export function isTodo(value: string | undefined | null): boolean {
  return !value || value.includes('{{TODO');
}

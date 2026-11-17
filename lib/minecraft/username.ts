export const USERNAME_PATTERN = /^[A-Za-z0-9_]{3,16}$/;

export function isValidUsername(value: unknown): value is string {
  return typeof value === "string" && USERNAME_PATTERN.test(value);
}

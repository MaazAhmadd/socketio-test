export function isValidJwt(jwt: string) {
  const parts = jwt.split(".");
  return parts.length === 3;
}

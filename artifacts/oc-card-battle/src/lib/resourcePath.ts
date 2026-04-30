export function resolvePublicAsset(path: string | undefined): string {
  if (!path) return "";
  if (/^(data:|blob:|https?:)/.test(path)) return path;
  if (path.startsWith(import.meta.env.BASE_URL)) return path;
  if (path.startsWith("/")) return path;
  return `${import.meta.env.BASE_URL}${path}`;
}

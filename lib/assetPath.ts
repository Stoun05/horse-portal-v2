const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(source?: string): string {
  if (!source) return "";
  if (
    source.startsWith("data:") ||
    source.startsWith("blob:") ||
    source.startsWith("http://") ||
    source.startsWith("https://")
  ) {
    return source;
  }

  const normalized = source.startsWith("/") ? source : `/${source}`;
  return `${BASE_PATH}${normalized}`;
}

export function horsePassportHref(horseId: string) {
  return `/atlar/pasport/?horse=${encodeURIComponent(horseId)}`;
}

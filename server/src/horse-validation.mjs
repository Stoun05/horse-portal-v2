export function parseHorseInput(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const code = typeof value.code === "string" ? value.code.trim() : "";
  const breed = typeof value.breed === "string" ? value.breed.trim() : "";
  const sex = typeof value.sex === "string" ? value.sex.trim() : "";
  const year = value.year;
  if (!name || name.length > 150 || !code || code.length > 64) return null;
  if (breed.length > 100 || sex.length > 40) return null;
  if (year !== undefined && (!Number.isInteger(year) || year < 1800 || year > 2200)) return null;
  return { name, code, breed: breed || null, sex: sex || null, year: year ?? null };
}

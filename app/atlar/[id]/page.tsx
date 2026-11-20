import HorsePassportPage from "../../../components/HorsePassportPage";
import { initialHorses } from "../../../lib/horses";

// Pre-render the original horse passports on static GitHub Pages.
// The server-hosted deployment can also resolve newly added IDs at runtime.
export function generateStaticParams() {
  return initialHorses.map((horse) => ({ id: horse.id }));
}

export default async function AtProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <HorsePassportPage horseId={id} />;
}

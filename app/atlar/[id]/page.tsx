"use client";

import { useParams } from "next/navigation";
import HorsePassportPage from "../../../components/HorsePassportPage";

// Keep the existing horse URL and render only the expanded passport UI.
export default function AtProfilePage() {
  const { id } = useParams<{ id: string }>();
  return <HorsePassportPage horseId={id} />;
}

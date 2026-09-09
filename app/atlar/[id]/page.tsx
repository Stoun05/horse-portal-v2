"use client";

import { useParams } from "next/navigation";
import HorsePassportPage from "../../../components/HorsePassportPage";

export default function AtProfilePage() {
  const params = useParams<{ id: string }>();
  return <HorsePassportPage horseId={params.id} />;
}

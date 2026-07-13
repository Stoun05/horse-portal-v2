import type { ReactNode } from "react";
import { initialHorses } from "../../../lib/horses";

export function generateStaticParams() {
  return initialHorses.map((horse) => ({ id: horse.id }));
}

export default function HorsePassportLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return children;
}

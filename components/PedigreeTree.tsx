"use client";

import { Shield } from "lucide-react";

export default function PedigreeTree() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 overflow-x-auto">
      <h2 className="text-2xl font-bold text-[#0b2f24] mb-10">
        Nesil agajy
      </h2>

      <div className="relative min-w-[900px] h-[520px]">
        {/* çyzyklar */}
        <div className="absolute left-[450px] top-[120px] w-[2px] h-[120px] bg-gray-400" />
        <div className="absolute left-[270px] top-[240px] w-[360px] h-[2px] bg-gray-400" />
        <div className="absolute left-[270px] top-[240px] w-[2px] h-[70px] bg-gray-400" />
        <div className="absolute left-[630px] top-[240px] w-[2px] h-[70px] bg-gray-400" />
        <div className="absolute left-[450px] top-[240px] w-[2px] h-[70px] bg-gray-400" />

        <div className="absolute left-[370px] top-[0px]">
          <Card name="Arslan" type="Kakasy" />
        </div>

        <div className="absolute left-[190px] top-[300px]">
          <Card name="Melek" type="Ejesi" />
        </div>

        <div className="absolute left-[550px] top-[300px]">
          <Card name="Aýnur" type="Mama" />
        </div>

        <div className="absolute left-[370px] top-[300px]">
          <Card name="Gyrat" type="AT" active />
        </div>

        <div className="absolute left-[20px] top-[300px]">
          <Card name="Galkan" type="Baba" />
        </div>

        <div className="absolute left-[730px] top-[300px]">
          <Card name="Garagöz" type="Ene" />
        </div>
      </div>
    </div>
  );
}

function Card({
  name,
  type,
  active = false,
}: {
  name: string;
  type: string;
  active?: boolean;
}) {
  return (
    <div
      className={`w-36 h-32 rounded-2xl border shadow-md flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        active
          ? "bg-[#0b5e3c] text-white border-[#0b5e3c]"
          : "bg-white text-[#0b2f24] border-gray-200"
      }`}
    >
      <div
        className={`text-3xl mb-2 ${
            active ? "text-white" : "text-[#0b2f24]"
        }`}
        >
        🐎
        </div>

      <p className={active ? "text-green-100 text-sm" : "text-gray-600 text-sm"}>
        {type}
      </p>

      <h3 className="text-xl font-bold mt-1">{name}</h3>
    </div>
  );
}
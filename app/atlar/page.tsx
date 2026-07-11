"use client";

import { useState } from "react";
import Link from "next/link";

import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";

const horses = [
  { id: 1, name: "Galkynyş", breed: "Ahal-teke", gender: "Doru", year: 2018, code: "AT-2018-045", image: "/horses/galkynys.png", champion: true },
  { id: 2, name: "Serdar", breed: "Ahal-teke", gender: "Doru", year: 2010, code: "AT-2010-031", image: "/horses/serdar.png" },
  { id: 3, name: "Mähri", breed: "Ahal-teke", gender: "Al", year: 2011, code: "AT-2011-021", image: "/horses/mahri.png" },
  { id: 4, name: "Garassyz", breed: "Ahal-teke", gender: "Doru", year: 2019, code: "AT-2019-012", image: "/horses/garassyz.png", champion: true },
  { id: 5, name: "Gözel", breed: "Ahal-teke", gender: "Doru", year: 2020, code: "AT-2020-014", image: "/horses/gozel.png" },
  { id: 6, name: "Batyr", breed: "Ahal-teke", gender: "Al", year: 2021, code: "AT-2021-017", image: "/horses/batyr.png", champion: true },
  { id: 7, name: "Günnur", breed: "Ahal-teke", gender: "Doru", year: 2022, code: "AT-2022-016", image: "/horses/gunnur.png" },
  { id: 8, name: "Pyrtykal", breed: "Ahal-teke", gender: "Gar", year: 2017, code: "AT-2017-019", image: "/horses/Galkan.png" },
];

export default function AtlarPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      {/* Sidebar */}
      <Sidebar open={open} setOpen={setOpen} />

      {/* Main */}
      <div className="flex-1 border-x-0 sm:border-x-4 lg:border-x-[15px] border-[#93c5fd]">
        
        {/* Topbar */}
        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-[#0b2f24]">
                Atlar katalogy
              </h1>
              <p className="text-gray-500 mt-2">
                Jemi atlar: <b className="text-[#0b5e3c]">1,248</b>
              </p>
            </div>

            <button className="bg-[#0b5e3c] text-white px-5 py-3 rounded-xl hover:bg-[#08462d] w-fit">
              + Täze at goş
            </button>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
            
            {/* FILTER */}
            <aside className="bg-white rounded-2xl shadow p-6 h-fit">
              <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
                Filtrler
              </h2>

              <div className="space-y-5">
                <FilterSelect label="Tohum / Nesil" options={["Ähli tohumlar", "Ahal-teke", "Ýomut"]} />
                <FilterSelect label="Jyns" options={["Ähli jynslar", "Aýgyr", "Baýtal"]} />
                <FilterSelect label="Reňk" options={["Ähli reňkler", "Doru", "Al", "Gar"]} />

                <button className="w-full bg-[#0b5e3c] text-white py-3 rounded-xl font-semibold">
                  Gözle
                </button>

                <button className="w-full border border-[#b58b2a] text-[#b58b2a] py-3 rounded-xl font-semibold">
                  Täzeden başla
                </button>
              </div>
            </aside>

            {/* CARDS */}
            <section>
              <div className="flex flex-col md:flex-row gap-3 md:justify-between md:items-center mb-6">
                <input
                  placeholder="At gözle..."
                  className="w-full md:w-[420px] bg-white border border-gray-300 rounded-xl px-5 py-3"
                />

                <select className="bg-white border border-gray-300 rounded-xl px-5 py-3">
                  <option>Ady boýunça (A–Ý)</option>
                  <option>Ýyly boýunça</option>
                  <option>Tohumy boýunça</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {horses.map((horse) => (
                  <div
                    key={horse.id}
                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition"
                  >
                    <img
                      src={horse.image}
                      alt={horse.name}
                      className="h-56 w-full object-cover"
                    />

                    <div className="p-5">
                      <h3 className="text-xl font-bold text-[#0b2f24]">
                        {horse.name}
                      </h3>

                      <p className="text-green-700">{horse.breed}</p>

                      <div className="flex justify-between mt-2 text-gray-600 text-sm">
                        <span>{horse.gender}</span>
                        <span>{horse.year}</span>
                      </div>

                      <p className="text-gray-500 mt-2 text-sm">
                        ID: {horse.code}
                      </p>

                      <div className="grid grid-cols-3 gap-2 mt-5">
                        <Link
                          href={`/atlar/${horse.id}`}
                          className="border rounded-lg py-2 text-center"
                        >
                          👁
                        </Link>

                        <Link
                          href="/nesil"
                          className="border rounded-lg py-2 text-center"
                        >
                          🌳
                        </Link>

                        <button className="border rounded-lg py-2 text-center">
                          ⋮
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

function FilterSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>

      <select className="w-full border rounded-xl px-4 py-3">
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
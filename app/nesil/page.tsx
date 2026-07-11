"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";

export default function NesilPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1 border-x-0 sm:border-x-4 lg:border-x-[15px] border-[#93c5fd]">
        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#0b2f24]">
              Nesil daragty
            </h1>

            <button className="bg-[#0b5e3c] text-white px-5 py-3 rounded-xl w-fit hover:bg-[#08462d]">
              PDF eksport
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-6 lg:items-center">
              <img
                src="/horses/galkynys.png"
                alt="Galkynyş"
                className="w-32 h-32 lg:w-40 lg:h-40 rounded-full object-cover"
              />

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#0b2f24]">
                    Galkynyş
                  </h2>
                  <span className="bg-[#0b5e3c] text-white px-4 py-2 rounded-lg text-sm">
                    Ahal-teke
                  </span>
                </div>

                <div className="mt-4 space-y-1 text-gray-800 text-sm lg:text-base">
                  <p>♂ Doru Erkek</p>
                  <p>Doglan ýyly: 2018</p>
                  <p>ID: AT-2018-045</p>
                  <p>Reňk: dor</p>
                  <p>Tohumy: Ahal-teke</p>
                </div>
              </div>

              <div className="lg:ml-auto bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-center">
                <p className="text-[#0b2f24] font-semibold">
                  Halkara derejeli çempion
                </p>
                <p className="mt-2 text-gray-700">Reýting: 9.6 / 10</p>
                <p className="text-yellow-500 text-2xl mt-2">★★★★★</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 overflow-x-auto">
            <div className="min-w-[1200px]">
              <div className="grid grid-cols-5 text-center font-bold text-[#0b2f24] mb-8">
                <p>1-nji nesil</p>
                <p>2-nji nesil</p>
                <p>3-nji nesil</p>
                <p>4-nji nesil</p>
                <p>5-nji nesil</p>
              </div>

              <div className="grid grid-cols-5 gap-6 items-start">
                <Link
                  href="/atlar/1"
                  className="bg-[#064b34] text-white rounded-2xl p-5 min-h-[260px] shadow cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02]"
                >
                  <img
                    src="/horses/galkynys.png"
                    alt="Galkynyş"
                    className="w-24 h-24 rounded-full object-cover mb-4 transition-transform duration-300 hover:scale-110"
                  />
                  <h3 className="text-2xl font-bold">Galkynyş</h3>
                  <p>Ahal-teke</p>
                  <p className="mt-2">♂ 2018 | dor</p>
                  <p>ID: AT-2018-045</p>
                </Link>

                <div className="space-y-6">
                  <HorseBox id={2} name="Serdar" image="/horses/serdar.png" />
                  <HorseBox id={3} name="Mähri" image="/horses/mahri.png" />
                </div>

                <div className="space-y-4">
                  <HorseBox id={4} name="Separ" image="/horses/serdar.png" />
                  <HorseBox id={5} name="Şaýane" image="/horses/mahri.png" />
                  <HorseBox id={6} name="Myrat" image="/horses/batyr.png" />
                  <HorseBox id={7} name="Gülşirin" image="/horses/gozel.png" />
                </div>

                <div className="space-y-3">
                  <SmallBox id={8} name="Palwan" />
                  <SmallBox id={9} name="Gozel" />
                  <SmallBox id={10} name="Ýagşygeldi" />
                  <SmallBox id={11} name="Lale" />
                  <SmallBox id={12} name="Dostluk" />
                </div>

                <div className="space-y-2">
                  {[
                    ["13", "Pälwanbaşy"],
                    ["14", "Güneşli"],
                    ["15", "Garagum"],
                    ["16", "Gülbahar"],
                  ].map(([id, name]) => (
                    <SmallBox key={id} id={Number(id)} name={name} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function HorseBox({
  id,
  name,
  image,
}: {
  id: number;
  name: string;
  image: string;
}) {
  return (
    <Link
      href={`/atlar/${id}`}
      className="block bg-white border border-gray-200 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-green-400 hover:bg-green-50"
    >
      <div className="flex items-center gap-4">
        <img
          src={image}
          alt={name}
          className="w-16 h-16 rounded-full object-cover transition-transform duration-300 hover:scale-110"
        />

        <div>
          <h3 className="font-bold text-[#0b2f24]">{name}</h3>
          <p className="text-sm text-gray-600">Ahal-teke</p>
          <p className="text-xs text-gray-500">Pasporta geç</p>
        </div>
      </div>
    </Link>
  );
}

function SmallBox({ id, name }: { id: number; name: string }) {
  return (
    <Link
      href={`/atlar/${id}`}
      className="block border border-gray-200 bg-white rounded-xl px-4 py-3 cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover:bg-green-50 hover:border-green-300"
    >
      <p className="font-medium text-[#0b2f24]">{name}</p>
    </Link>
  );
}
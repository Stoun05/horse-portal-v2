"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import HeroSection from "../components/HeroSection";
import Breadcrumb from "../components/Breadcrumb";

export default function Home() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1 border-x-0 sm:border-x-4 lg:border-x-[15px] border-[#93c5fd]">
        <Topbar setOpen={setOpen} />

        <main className="px-3 py-4 sm:px-5 md:px-6 lg:p-8">
          <Breadcrumb />

          <HeroSection />

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 mt-6 md:mt-8">
            <div className="xl:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-5 md:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0b2f24] mb-5">
                Soňky hereketler
              </h2>

              <div className="space-y-4">
                {[
                  ["🐎", "Galkynyş atly täze at goşuldy", "Şu gün, 10:25", "bg-green-100"],
                  ["🌳", "Nesil daragty täzelendi", "Düýn, 18:40", "bg-blue-100"],
                  ["🏆", "Çempionlyk maglumatlary girizildi", "2 gün öň", "bg-yellow-100"],
                  ["📄", "PDF hasabat döredildi", "3 gün öň", "bg-purple-100"],
                ].map(([icon, title, time, bg], index) => (
                  <div
                    key={title}
                    className={`flex items-start sm:items-center gap-3 sm:gap-4 ${
                      index !== 3 ? "border-b pb-3" : ""
                    }`}
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}
                    >
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#0b2f24] text-sm sm:text-base break-words">
                        {title}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">{time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow p-4 sm:p-5 md:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-[#0b2f24] mb-5">
                Çalt hereketler
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                <a href="/atlar" className="block bg-[#0b5e3c] text-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl font-semibold hover:bg-[#08462d]">
                  ➕ Täze at goş
                </a>

                <a href="/nesil" className="block bg-blue-50 text-[#0b2f24] px-4 sm:px-5 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-100">
                  🌳 Nesil daragty
                </a>

                <a href="/seljerme" className="block bg-yellow-50 text-[#0b2f24] px-4 sm:px-5 py-3 sm:py-4 rounded-xl font-semibold hover:bg-yellow-100">
                  📊 Tohumçylyk seljermesi
                </a>

                <a href="/hasabatlar" className="block bg-gray-100 text-[#0b2f24] px-4 sm:px-5 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-200">
                  📄 Hasabatlar
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  Shield,
  Network,
  Trophy,
  Dna,
  PieChart,
  HeartPulse,
  Download,
} from "lucide-react";

import PedigreeTree from "../../components/PedigreeTree";
import HorseTable from "../../components/analytics/HorseTable";
import ChampionStats from "../../components/analytics/ChampionStats";
import InbreedingBarChart from "../../components/analytics/InbreedingBarChart";
import TopHorses from "../../components/analytics/TopHorses";
import GenderPieChart from "../../components/analytics/GenderPieChart";
import BirthLineChart from "../../components/analytics/BirthLineChart";
import BreedPieChart from "../../components/analytics/BreedPieChart";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import StatCard from "../../components/analytics/StatCard";

export default function SeljermePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">

      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1 border-x-0 sm:border-x-4 lg:border-x-[15px] border-[#93c5fd]">

        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">

          <Breadcrumb />


          {/* HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">

            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0b2f24]">
                Tohumçylyk seljermesi
              </h1>

              <p className="text-sm text-gray-500 mt-2">
                01.01.2018 - 31.12.2023 aralygyndaky maglumatlar
              </p>
            </div>


            <button className="flex items-center gap-2 bg-[#0b5e3c] text-white px-5 py-3 rounded-xl hover:bg-[#08462d]">
              <Download size={18}/>
              Hasabat eksport
            </button>

          </div>



          {/* STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4">


            <StatCard
              title="Jemi atlar"
              value="1,248"
              change="28 (2.3%)"
              icon={<Shield size={28} className="text-green-700" />}
              color="#dcfce7"
            />


            <StatCard
              title="Jemi nesil baglanyşyk"
              value="5,731"
              change="112 (2.0%)"
              icon={<Network size={28} className="text-green-700" />}
              color="#dcfce7"
            />


            <StatCard
              title="Çempion atlar"
              value="87"
              change="5 (6.1%)"
              icon={<Trophy size={28} className="text-yellow-600" />}
              color="#fef3c7"
            />


            <StatCard
              title="Genetiki dürlülik indeksi"
              value="0.87"
              change="0.05 (6.1%)"
              icon={<Dna size={28} className="text-purple-600" />}
              color="#f3e8ff"
            />


            <StatCard
              title="Öndürijilik indeksi"
              value="78.4"
              change="4.8 (6.5%)"
              icon={<PieChart size={28} className="text-blue-600" />}
              color="#dbeafe"
            />


            <StatCard
              title="Ortaça saglyk baly"
              value="92%"
              change="3%"
              icon={<HeartPulse size={28} className="text-rose-600" />}
              color="#ffe4e6"
            />

          </div>

          {/* CHARTS */}
          <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8 items-stretch">

            <div className="w-full">
              <BreedPieChart />
            </div>

            <div className="w-full">
              <BirthLineChart />
            </div>

            <div className="w-full">
              <GenderPieChart />
            </div>

            <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
              <ChampionStats />
              <InbreedingBarChart />
            </div>

            <div className="mt-8">
              <HorseTable />
            </div>
            
            <div className="mt-10">
              <PedigreeTree />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
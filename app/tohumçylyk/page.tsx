"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";

import StatCard from "../../components/analytics/StatCard";
import BreedPieChart from "../../components/analytics/BreedPieChart";
import BirthLineChart from "../../components/analytics/BirthLineChart";
import InbreedingBarChart from "../../components/analytics/InbreedingBarChart";
import ChampionStats from "../../components/analytics/ChampionStats";

export default function SeljermePage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1">
        <Topbar setOpen={setOpen} />

        <main className="p-8">
          <h1 className="text-4xl font-bold text-[#0b2f24] mb-8">
            Tohumçylyk seljermesi
          </h1>

          <div className="bg-white rounded-2xl shadow p-6">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3">At</th>
                  <th className="text-left py-3">Tohum</th>
                  <th className="text-left py-3">Kakasy</th>
                  <th className="text-left py-3">Enesi</th>
                  <th className="text-left py-3">Gan gatnaşygy</th>
                </tr>
              </thead>

              <tbody>
                <tr className="border-b">
                  <td className="py-3">Gyrat</td>
                  <td>Ahal-teke</td>
                  <td>Arslan</td>
                  <td>Melek</td>
                  <td className="text-green-600 font-semibold">
                    3.2%
                  </td>
                </tr>

                <tr>
                  <td className="py-3">Garaguş</td>
                  <td>Ýomut</td>
                  <td>Galkan</td>
                  <td>Aýnur</td>
                  <td className="text-yellow-600 font-semibold">
                    6.8%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}
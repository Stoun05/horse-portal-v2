"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { HeartPulse, Syringe, FileText, AlertTriangle } from "lucide-react";

export default function SaglykPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1 border-x-0 sm:border-x-4 lg:border-x-[15px] border-[#93c5fd]">
        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0b2f24]">
                Saglyk taryhy
              </h1>
              <p className="text-gray-600 mt-2">
                Atlaryň weterinar gözegçiligi, waksina we saglyk ýazgylary
              </p>
            </div>

            <button className="bg-[#0b5e3c] text-white px-5 py-3 rounded-xl hover:bg-[#08462d]">
              + Täze ýazgy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <HealthCard icon={<HeartPulse />} title="Sag atlar" value="1,182" />
            <HealthCard icon={<Syringe />} title="Waksina edilen" value="967" />
            <HealthCard icon={<FileText />} title="Weterinar ýazgylar" value="342" />
            <HealthCard icon={<AlertTriangle />} title="Gözegçilikde" value="18" />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
              Soňky saglyk ýazgylary
            </h2>

            <table className="w-full min-w-[900px] text-gray-900">
              <thead>
                <tr className="border-b text-gray-700">
                  <th className="text-left py-3">At</th>
                  <th className="text-left py-3">Bejergi / Waksina</th>
                  <th className="text-left py-3">Sene</th>
                  <th className="text-left py-3">Weterinar</th>
                  <th className="text-left py-3">Ýagdaýy</th>
                  <th className="text-left py-3">Bellik</th>
                </tr>
              </thead>

              <tbody>
                {[
                  ["Galkynyş", "Tetanos waksinasy", "12.03.2025", "A. Meredow", "Tamamlandy", "Saglyk ýagdaýy gowy"],
                  ["Batyr", "Dümew waksinasy", "20.05.2025", "S. Amanow", "Tamamlandy", "Gaýtadan barlag gerek däl"],
                  ["Serdar", "Umumy barlag", "02.06.2025", "M. Orazow", "Gözegçilikde", "Temperatura ýokary"],
                  ["Mähri", "Gan analizi", "11.06.2025", "A. Meredow", "Tamamlandy", "Netije kadaly"],
                ].map((row) => (
                  <tr key={row[0]} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-bold text-[#0b2f24]">{row[0]}</td>
                    <td>{row[1]}</td>
                    <td>{row[2]}</td>
                    <td>{row[3]}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          row[4] === "Tamamlandy"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {row[4]}
                      </span>
                    </td>
                    <td>{row[5]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

function HealthCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow p-5 hover:-translate-y-1 hover:shadow-lg transition">
      <div className="w-12 h-12 rounded-xl bg-green-100 text-[#0b5e3c] flex items-center justify-center mb-4">
        {icon}
      </div>

      <p className="text-gray-600">{title}</p>
      <h3 className="text-3xl font-bold text-[#0b2f24] mt-1">{value}</h3>
    </div>
  );
}
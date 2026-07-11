"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import {
  FileText,
  Download,
  Table,
  CalendarDays,
  Printer,
  Eye,
  BarChart3,
  HeartPulse,
  Trophy,
  Dna,
} from "lucide-react";

const reportTypes = [
  {
    title: "Atlaryň hasabaty",
    desc: "Ähli atlaryň sanawy, pasport maglumatlary we ID boýunça hasabat.",
    icon: "🐎",
  },
  {
    title: "Tohumçylyk hasabaty",
    desc: "Nesil baglanyşyklary, tohum paýlanyşy we genetiki seljerme.",
    icon: "🌳",
  },
  {
    title: "Saglyk hasabaty",
    desc: "Waksina, bejergi, weterinar ýazgylary we gözegçilik maglumatlary.",
    icon: "❤️",
  },
  {
    title: "Ýaryş hasabaty",
    desc: "Ýaryş netijeleri, çempionlar we reýting görkezijileri.",
    icon: "🏆",
  },
  {
    title: "Genetiki analiz",
    desc: "Inbreeding, genetiki dürlülik we nesil töwekgelçiligi.",
    icon: "🧬",
  },
];

const reports = [
  ["Atlaryň umumy hasabaty", "Atlar", "07.07.2026", "PDF"],
  ["Saglyk taryhy hasabaty", "Saglyk", "06.07.2026", "XLSX"],
  ["Tohumçylyk seljermesi", "Tohumçylyk", "05.07.2026", "PDF"],
  ["Çempion atlar sanawy", "Ýaryş", "04.07.2026", "PDF"],
];

export default function HasabatlarPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 lg:flex">
      <Sidebar open={open} setOpen={setOpen} />

      <div className="flex-1 border-x-0 sm:border-x-4 lg:border-x-[15px] border-[#93c5fd]">
        <Topbar setOpen={setOpen} />

        <main className="p-4 sm:p-6 lg:p-8">
          <Breadcrumb />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-[#0b2f24]">
                Hasabatlar
              </h1>
              <p className="text-gray-600 mt-2">
                PDF, Excel we çap etmek üçin hasabatlary döretmek we dolandyrmak
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="flex items-center gap-2 bg-white border px-5 py-3 rounded-xl hover:bg-gray-50 text-[#0b2f24]">
                <Printer size={18} />
                Print
              </button>

              <button className="flex items-center gap-2 bg-[#0b5e3c] text-white px-5 py-3 rounded-xl hover:bg-[#08462d]">
                <Download size={18} />
                Hasabat eksport
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <Stat icon={<FileText />} title="Jemi hasabatlar" value="148" />
            <Stat icon={<Download />} title="PDF eksport" value="96" />
            <Stat icon={<Table />} title="Excel eksport" value="52" />
            <Stat icon={<CalendarDays />} title="Şu aýda" value="15" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-5 mb-8">
            {reportTypes.map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-2xl shadow-lg p-6 hover:-translate-y-1 hover:shadow-xl transition"
              >
                <div className="text-4xl mb-4">{item.icon}</div>

                <h3 className="text-xl font-bold text-[#0b2f24]">
                  {item.title}
                </h3>

                <p className="text-gray-600 mt-3 text-sm min-h-[70px]">
                  {item.desc}
                </p>

                <button className="mt-5 w-full bg-[#0b5e3c] text-white py-3 rounded-xl hover:bg-[#08462d]">
                  Hasabat döret
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <SmallPanel
              icon={<BarChart3 />}
              title="Tohumçylyk seljermesi"
              value="78.4%"
              desc="Öndürijilik görkezijisi"
            />

            <SmallPanel
              icon={<HeartPulse />}
              title="Saglyk derejesi"
              value="92%"
              desc="Ortaça saglyk baly"
            />

            <SmallPanel
              icon={<Trophy />}
              title="Çempionlyk"
              value="87"
              desc="Hasaba alnan çempion atlar"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
              <h2 className="text-2xl font-bold text-[#0b2f24]">
                Soňky döredilen hasabatlar
              </h2>

              <div className="flex gap-3">
                <select className="border rounded-xl px-4 py-2 text-gray-900">
                  <option>Ähli bölümler</option>
                  <option>Atlar</option>
                  <option>Saglyk</option>
                  <option>Tohumçylyk</option>
                  <option>Ýaryş</option>
                </select>

                <select className="border rounded-xl px-4 py-2 text-gray-900">
                  <option>Ähli formatlar</option>
                  <option>PDF</option>
                  <option>XLSX</option>
                </select>
              </div>
            </div>

            <table className="w-full min-w-[850px] text-gray-900">
              <thead>
                <tr className="border-b text-gray-700">
                  <th className="text-left py-3">Hasabat ady</th>
                  <th className="text-left py-3">Bölüm</th>
                  <th className="text-left py-3">Döredilen güni</th>
                  <th className="text-left py-3">Format</th>
                  <th className="text-left py-3">Hereket</th>
                </tr>
              </thead>

              <tbody>
                {reports.map((r) => (
                  <tr key={r[0]} className="border-b hover:bg-gray-50">
                    <td className="py-4 font-bold text-[#0b2f24]">{r[0]}</td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          r[3] === "PDF"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {r[3]}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                          <Eye size={17} />
                        </button>
                        <button className="p-2 rounded-lg bg-[#0b5e3c] text-white hover:bg-[#08462d]">
                          <Download size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-5 text-[#0b2f24]">
            <div className="flex items-center gap-3">
              <Dna size={22} />
              <p className="font-semibold">
                Hasabatlar ulgamdaky at, saglyk, nesil we ýaryş maglumatlarynyň
                esasynda taýýarlanýar.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function Stat({
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

function SmallPanel({
  icon,
  title,
  value,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  desc: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-xl bg-green-100 text-[#0b5e3c] flex items-center justify-center">
          {icon}
        </div>

        <div>
          <p className="text-gray-600">{title}</p>
          <h3 className="text-3xl font-bold text-[#0b2f24]">{value}</h3>
          <p className="text-sm text-gray-500">{desc}</p>
        </div>
      </div>
    </div>
  );
}
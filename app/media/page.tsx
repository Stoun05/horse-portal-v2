"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { Image, Video, Upload, Search } from "lucide-react";

const photos = [
  "/horses/batyr.png",
  "/horses/galkynys.png",
  "/horses/serdar.png",
  "/horses/mahri.png",
  "/horses/gozel.png",
  "/horses/garassyz.png",
];

export default function MediaPage() {
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
                Wideo / Suratlar
              </h1>
              <p className="text-gray-600 mt-2">
                Atlaryň suratlaryny, wideo ýazgylaryny we media arhiwini dolandyrmak
              </p>
            </div>

            <button className="flex items-center gap-2 bg-[#0b5e3c] text-white px-5 py-3 rounded-xl hover:bg-[#08462d]">
              <Upload size={18} />
              Media goş
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <Stat icon={<Image />} title="Suratlar" value="248" />
            <Stat icon={<Video />} title="Wideolar" value="36" />
            <Stat icon={<Upload />} title="Ýüklenen faýllar" value="284" />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 mb-8">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
              <Search size={20} className="text-gray-500" />
              <input
                placeholder="Surat ýa-da wideo gözle..."
                className="bg-transparent outline-none w-full text-gray-900 placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
                Surat galereýasy
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {photos.map((photo, index) => (
                  <div
                    key={photo}
                    className="group rounded-2xl overflow-hidden shadow border bg-gray-50 hover:-translate-y-1 hover:shadow-xl transition"
                  >
                    <img
                      src={photo}
                      alt="At suraty"
                      className="w-full h-56 object-cover group-hover:scale-105 transition duration-500"
                    />

                    <div className="p-4">
                      <h3 className="font-bold text-[#0b2f24]">
                        At suraty #{index + 1}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Ahal-teke arhiwi
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
                Wideo ýazgylar
              </h2>

              <div className="space-y-5">
                <VideoCard title="Galkynyş — türgenleşik" time="02:45" />
                <VideoCard title="Batyr — ýaryş pursady" time="04:12" />
                <VideoCard title="Ahal-teke görkezilişi" time="03:30" />
              </div>
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

function VideoCard({ title, time }: { title: string; time: string }) {
  return (
    <div className="border rounded-2xl p-4 hover:bg-gray-50 transition">
      <div className="h-36 rounded-xl bg-gray-900 flex items-center justify-center text-white text-4xl mb-4">
        ▶
      </div>

      <h3 className="font-bold text-[#0b2f24]">{title}</h3>
      <p className="text-sm text-gray-600 mt-1">{time}</p>
    </div>
  );
}
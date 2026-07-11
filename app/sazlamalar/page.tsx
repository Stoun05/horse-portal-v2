"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import {
  Settings,
  Users,
  Database,
  Globe,
  Save,
  Upload,
  ShieldCheck,
  Bell,
  Lock,
  RefreshCcw,
} from "lucide-react";

const roles = [
  ["Admin", "✅", "✅", "✅", "✅"],
  ["Operator", "✅", "✅", "❌", "✅"],
  ["Weterinar", "✅", "✅", "❌", "❌"],
  ["Gözegçi", "✅", "❌", "❌", "❌"],
];

export default function SazlamalarPage() {
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
                Sazlamalar
              </h1>
              <p className="text-gray-600 mt-2">
                Ulgamyň umumy sazlamalary, rugsatlar, howpsuzlyk we backup dolandyryşy
              </p>
            </div>

            <button className="flex items-center gap-2 bg-[#0b5e3c] text-white px-5 py-3 rounded-xl hover:bg-[#08462d]">
              <Save size={18} />
              Üýtgeşmeleri sakla
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <Stat icon={<Settings />} title="Ulgam sazlamalary" value="24" />
            <Stat icon={<Users />} title="Rollar" value="4" />
            <Stat icon={<Database />} title="Backup sany" value="36" />
            <Stat icon={<Globe />} title="Dil" value="TM" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
                Umumy sazlamalar
              </h2>

              <div className="space-y-5">
                <Field label="Portal ady" value="Atçylyk portaly" />
                <Field label="Gurama" value="Atçylyk Akademiýasy" />
                <Field label="Admin email" value="admin@atcylyk.tm" />

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Logo
                  </label>
                  <button className="flex items-center gap-2 border rounded-xl px-4 py-3 hover:bg-gray-50 text-[#0b2f24]">
                    <Upload size={18} />
                    Logo ýükle
                  </button>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Esasy reňk
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-[#0b5e3c] border shadow" />
                    <span className="font-semibold text-[#0b2f24]">#0b5e3c</span>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
                Howpsuzlyk
              </h2>

              <div className="space-y-4">
                <Toggle icon={<ShieldCheck />} title="Iki faktorly gorag (2FA)" desc="Admin girişlerinde goşmaça gorag." />
                <Toggle icon={<Lock />} title="Güýçli parol syýasaty" desc="Parol uzynlygy we nyşan talaplary." />
                <Toggle icon={<RefreshCcw />} title="Session wagty" desc="30 minut hereketsizlikden soň çykmak." />
                <Toggle icon={<Bell />} title="Login duýduryşlary" desc="Täze giriş bolanda admina habar bermek." />
              </div>
            </section>
          </div>

          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
              Ulanyjy rugsatlary
            </h2>

            <table className="w-full min-w-[750px] text-gray-900">
              <thead>
                <tr className="border-b text-gray-700">
                  <th className="text-left py-3">Rol</th>
                  <th className="text-left py-3">Atlary görmek</th>
                  <th className="text-left py-3">Üýtgetmek</th>
                  <th className="text-left py-3">Pozmak</th>
                  <th className="text-left py-3">Hasabat</th>
                </tr>
              </thead>

              <tbody>
                {roles.map((role) => (
                  <tr key={role[0]} className="border-b hover:bg-gray-50">
                    {role.map((item, index) => (
                      <td
                        key={index}
                        className={`py-4 ${
                          index === 0 ? "font-bold text-[#0b2f24]" : ""
                        }`}
                      >
                        {item}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-8">
            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
                Backup
              </h2>

              <div className="bg-green-50 rounded-xl p-5 border border-green-200 mb-5">
                <p className="text-gray-600">Soňky backup</p>
                <h3 className="text-2xl font-bold text-[#0b2f24] mt-1">
                  07.07.2026 14:35
                </h3>
              </div>

              <div className="space-y-3">
                <button className="w-full bg-[#0b5e3c] text-white py-3 rounded-xl hover:bg-[#08462d]">
                  Backup döret
                </button>
                <button className="w-full border py-3 rounded-xl hover:bg-gray-50 text-[#0b2f24]">
                  Dikelt
                </button>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
                Dil
              </h2>

              <div className="space-y-3 text-gray-900">
                <Radio checked label="🇹🇲 Türkmençe" />
                <Radio label="🇷🇺 Русский" />
                <Radio label="🇬🇧 English" />
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
                Bildirişler
              </h2>

              <div className="space-y-4">
                <Toggle title="Email bildirişleri" desc="Hasabat we ulgam habarlary." />
                <Toggle title="Waksina ýatlatma" desc="Waksina senesi ýetende habar bermek." />
                <Toggle title="Saglyk duýduryşy" desc="Gözegçilikdäki atlar barada habar." />
              </div>
            </section>
          </div>

          <button className="mt-8 w-full flex items-center justify-center gap-2 bg-[#0b5e3c] text-white py-4 rounded-2xl text-lg font-bold hover:bg-[#08462d]">
            <Save size={22} />
            Üýtgeşmeleri sakla
          </button>
        </main>
      </div>
    </div>
  );
}

function Stat({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) {
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-gray-700 font-semibold mb-2">{label}</label>
      <input
        defaultValue={value}
        className="w-full border rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0b5e3c]"
      />
    </div>
  );
}

function Toggle({
  icon,
  title,
  desc,
}: {
  icon?: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border rounded-xl p-4">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-green-100 text-[#0b5e3c] flex items-center justify-center">
            {icon}
          </div>
        )}

        <div>
          <p className="font-bold text-[#0b2f24]">{title}</p>
          <p className="text-sm text-gray-600">{desc}</p>
        </div>
      </div>

      <button className="w-12 h-7 rounded-full bg-[#0b5e3c] relative shrink-0">
        <span className="absolute right-1 top-1 w-5 h-5 rounded-full bg-white" />
      </button>
    </div>
  );
}

function Radio({ label, checked = false }: { label: string; checked?: boolean }) {
  return (
    <div className="flex items-center gap-3 border rounded-xl p-4">
      <span
        className={`w-5 h-5 rounded-full border flex items-center justify-center ${
          checked ? "border-[#0b5e3c]" : "border-gray-400"
        }`}
      >
        {checked && <span className="w-3 h-3 rounded-full bg-[#0b5e3c]" />}
      </span>

      <span className="font-semibold">{label}</span>
    </div>
  );
}
"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { Users, UserCheck, ShieldCheck, UserPlus, Search, Eye, Pencil, Trash2 } from "lucide-react";

const users = [
  ["U. Gurbanmyradowa", "Admin", "admin@atcylyk.tm", "Işjeň", "07.07.2026"],
  ["I. Şamuhammedow", "Operator", "operator@atcylyk.tm", "Işjeň", "06.07.2026"],
  ["A. Meredow", "Weterinar", "veterinar@atcylyk.tm", "Işjeň", "05.07.2026"],
  ["M. Orazow", "Gözegçi", "gozegci@atcylyk.tm", "Passiw", "01.07.2026"],
];

export default function UlanyjylarPage() {
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
                Ulanyjylar
              </h1>
              <p className="text-gray-600 mt-2">
                Ulgamdaky admin, operator, weterinar we gözegçi ulanyjylary dolandyrmak
              </p>
            </div>

            <button className="flex items-center gap-2 bg-[#0b5e3c] text-white px-5 py-3 rounded-xl hover:bg-[#08462d]">
              <UserPlus size={18} />
              Täze ulanyjy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <Stat icon={<Users />} title="Jemi ulanyjy" value="24" />
            <Stat icon={<UserCheck />} title="Işjeň ulanyjy" value="21" />
            <Stat icon={<ShieldCheck />} title="Adminler" value="3" />
            <Stat icon={<Users />} title="Operatorlar" value="8" />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-5 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px_220px] gap-4">
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-4 py-3">
                <Search size={20} className="text-gray-500" />
                <input
                  placeholder="Ulanyjy gözle..."
                  className="bg-transparent outline-none w-full text-gray-900 placeholder:text-gray-500"
                />
              </div>

              <select className="border rounded-xl px-4 py-3 text-gray-900">
                <option>Ähli rollar</option>
                <option>Admin</option>
                <option>Operator</option>
                <option>Weterinar</option>
                <option>Gözegçi</option>
              </select>

              <select className="border rounded-xl px-4 py-3 text-gray-900">
                <option>Ähli ýagdaýlar</option>
                <option>Işjeň</option>
                <option>Passiw</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 overflow-x-auto">
            <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
              Ulanyjy sanawy
            </h2>

            <table className="w-full min-w-[900px] text-gray-900">
              <thead>
                <tr className="border-b text-gray-700">
                  <th className="text-left py-3">Ulanyjy</th>
                  <th className="text-left py-3">Rol</th>
                  <th className="text-left py-3">Email</th>
                  <th className="text-left py-3">Ýagdaýy</th>
                  <th className="text-left py-3">Soňky giriş</th>
                  <th className="text-left py-3">Hereket</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user[2]} className="border-b hover:bg-gray-50">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-[#0b5e3c] text-white flex items-center justify-center font-bold">
                          {user[0][0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#0b2f24]">{user[0]}</p>
                          <p className="text-sm text-gray-500">Atçylyk portaly</p>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold">
                        {user[1]}
                      </span>
                    </td>

                    <td>{user[2]}</td>

                    <td>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          user[3] === "Işjeň"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {user[3]}
                      </span>
                    </td>

                    <td>{user[4]}</td>

                    <td>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200">
                          <Eye size={17} />
                        </button>
                        <button className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                          <Pencil size={17} />
                        </button>
                        <button className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200">
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <RoleCard title="Admin" desc="Ähli maglumatlary dolandyrmak, ulanyjy goşmak we hasabat almak." count="3" />
            <RoleCard title="Operator" desc="At maglumatlaryny girizmek, täzeläp saklamak we media goşmak." count="8" />
            <RoleCard title="Weterinar" desc="Saglyk taryhy, waksina we bejergi ýazgylaryny ýöretmek." count="5" />
          </div>
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

function RoleCard({ title, desc, count }: { title: string; desc: string; count: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-[#0b5e3c]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold text-[#0b2f24]">{title}</h3>
          <p className="text-gray-600 mt-2">{desc}</p>
        </div>

        <span className="text-3xl font-bold text-[#0b5e3c]">{count}</span>
      </div>
    </div>
  );
}
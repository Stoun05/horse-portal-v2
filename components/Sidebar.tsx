"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortalSettings } from "../lib/usePortalSettings";
import { assetPath } from "../lib/assetPath";
import {
  Home,
  Badge,
  Network,
  BarChart3,
  HeartPulse,
  Image,
  FileText,
  X,
} from "lucide-react";

type SidebarProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const pathname = usePathname();
  const { settings } = usePortalSettings();

  const menuItems = [
    { name: "Baş sahypa", icon: Home, href: "/" },
    { name: "Atlar katalogy", icon: Badge, href: "/atlar" },
    { name: "Nesil daragty", icon: Network, href: "/nesil" },
    { name: "Tohumçylyk seljermesi", icon: BarChart3, href: "/seljerme" },
    { name: "Saglyk taryhy", icon: HeartPulse, href: "/saglyk" },
    { name: "Wideo / Suratlar", icon: Image, href: "/media" },
    { name: "Hasabatlar", icon: FileText, href: "/hasabatlar" },
  ];

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-slate-950/65 backdrop-blur-[3px] z-40"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 w-80 max-w-[90vw] h-screen bg-gradient-to-b from-[#072c23] via-[#063b2e] to-[#041d19] text-white p-5 overflow-y-auto shadow-2xl border-r border-white/10
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 rounded-xl bg-white/10 p-2 text-white/80 transition hover:bg-white/20 hover:text-white" aria-label="Menýuny ýap"
        >
          <X size={26} />
        </button>

        <div className="mb-7 flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-6">
          <img
            src={assetPath("/sidebar-emblem.svg")}
            alt="Atçylyk Akademiýasy"
            className="h-24 w-24 rounded-full border border-amber-200/20 object-contain drop-shadow-lg"
          />
          <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-amber-200">ATÇYLYK PORTAL</p>
        </div>

        <p className="mb-3 px-3 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-200/60">Portal bölümleri</p>
        <nav className="space-y-1.5">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href + "/"));

            return (
              <Link
                key={index}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
                  active ? "border-amber-300/30 bg-white/15 text-amber-100 shadow-inner" : "border-transparent text-emerald-50/80 hover:border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={19} className={active ? "text-amber-300" : "text-emerald-200/70 transition-colors group-hover:text-amber-200"} />
                <span className="flex-1 text-[13px] font-semibold leading-snug">{item.name}</span>{active && <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />}
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-center">
          <p className="text-xs text-yellow-300">{settings.organization}</p>

          <p className="text-sm text-white font-semibold mt-2">
            U. Gurbanmyradowa
          </p>

          <p className="text-sm text-white font-semibold">
            I. Şamuhammedow
          </p>
        </div>
      </aside>
    </>
  );
}
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePortalSettings } from "../lib/usePortalSettings";
import {
  Home,
  Badge,
  Award,
  Landmark,
  Network,
  BarChart3,
  HeartPulse,
  Image,
  FileText,
  Users,
  Settings,
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
    { name: "Gözellik bäsleşiginiň ýeňijileri", icon: Award, href: "/yenijiler" },
    { name: "Arkadag şäheriniň 24 aty", icon: Landmark, href: "/arkadag-atlary" },
    { name: "Nesil daragty", icon: Network, href: "/nesil" },
    { name: "Tohumçylyk seljermesi", icon: BarChart3, href: "/seljerme" },
    { name: "Saglyk taryhy", icon: HeartPulse, href: "/saglyk" },
    { name: "Wideo / Suratlar", icon: Image, href: "/media" },
    { name: "Hasabatlar", icon: FileText, href: "/hasabatlar" },
    { name: "Ulanyjylar", icon: Users, href: "/ulanyjylar" },
    { name: "Sazlamalar", icon: Settings, href: "/sazlamalar" },
  ];

  return (
    <>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 bg-black/40 z-40"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 w-72 h-screen bg-[#052b1f] text-white p-6 overflow-y-auto
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4"
        >
          <X size={26} />
        </button>

        <div className="mb-8 flex justify-center">
          <img
            src="/logo.png"
            alt="Atçylyk Akademiýasy"
            className="w-44 mx-auto"
          />
        </div>

        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const active = pathname === item.href;

            return (
              <Link
                key={index}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active ? "bg-green-800" : "hover:bg-green-900"
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-10 pt-6 border-t border-green-900 text-center">
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
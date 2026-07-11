"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ChevronRight } from "lucide-react";

export default function Breadcrumb() {
  const pathname = usePathname();

  let currentPage = "Baş sahypa";

  if (pathname.startsWith("/atlar")) {
    currentPage = "Atlar katalogy";
  } else if (pathname.startsWith("/nesil")) {
    currentPage = "Nesil daragty";
  } else if (pathname.startsWith("/tohumcylyk")) {
    currentPage = "Tohumçylyk seljermesi";
  } else if (pathname.startsWith("/saglyk")) {
    currentPage = "Saglyk taryhy";
  } else if (pathname.startsWith("/media")) {
    currentPage = "Wideo / Suratlar";
  } else if (pathname.startsWith("/hasabatlar")) {
    currentPage = "Hasabatlar";
  } else if (pathname.startsWith("/ulanyjylar")) {
    currentPage = "Ulanyjylar";
  } else if (pathname.startsWith("/sazlamalar")) {
    currentPage = "Sazlamalar";
  }

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm mb-6">
      <Link
        href="/"
        className="flex items-center gap-2 text-gray-500 hover:text-[#0b5e3c] transition"
      >
        <Home size={18} />
        <span>Baş sahypa</span>
      </Link>

      {pathname !== "/" && (
        <>
          <ChevronRight size={18} className="text-gray-400" />

          <span className="font-semibold text-[#0b2f24]">
            {currentPage}
          </span>
        </>
      )}
    </div>
  );
}
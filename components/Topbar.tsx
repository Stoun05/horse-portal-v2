"use client";

import { Menu } from "lucide-react";

type TopbarProps = {
  setOpen: (open: boolean) => void;
};

export default function Topbar({ setOpen }: TopbarProps) {
  return (
    <header className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          className="w-10 h-10 rounded-xl bg-[#0b5e3c] text-white flex items-center justify-center hover:bg-[#08462d]"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-xs text-gray-500">Baş sahypa</p>
          <h1 className="font-bold text-[#0b2f24]">Atçylyk portaly</h1>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-3">
        <input
          type="text"
          placeholder="At gözle..."
          className="border rounded-lg px-4 py-2 text-sm"
        />

        <div className="w-9 h-9 rounded-full bg-[#052b1f] text-white flex items-center justify-center text-sm font-bold">
          A
        </div>
      </div>
    </header>
  );
}
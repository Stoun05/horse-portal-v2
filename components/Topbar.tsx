"use client";

import { Menu } from "lucide-react";
import { usePortalSettings } from "../lib/usePortalSettings";
import { assetPath } from "../lib/assetPath";

type TopbarProps = {
  setOpen: (open: boolean) => void;
};

export default function Topbar({ setOpen }: TopbarProps) {
  const { settings } = usePortalSettings();

  return (
    <header className="flex items-center justify-between border-b bg-white px-4 py-3 sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOpen(true)}
          style={{ backgroundColor: settings.primaryColor }}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white brightness-100 hover:brightness-90"
          aria-label="Menýuny aç"
        >
          <Menu size={22} />
        </button>
        {settings.logo && (
          <img src={assetPath(settings.logo)} alt="" className="hidden h-10 w-10 rounded-lg object-contain sm:block" />
        )}
        <div>
          <p className="text-xs text-gray-500">{settings.organization}</p>
          <h1 className="font-bold text-[#0b2f24]">{settings.portalName}</h1>
        </div>
      </div>

    </header>
  );
}

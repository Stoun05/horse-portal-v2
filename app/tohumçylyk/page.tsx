"use client";

import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import Breadcrumb from "../../components/Breadcrumb";
import { useHorseCatalog } from "../../lib/useHorseCatalog";

export default function TohumcylykPage(){const[open,setOpen]=useState(false);const{horses}=useHorseCatalog();return <div className="min-h-screen bg-gray-100 lg:flex"><Sidebar open={open} setOpen={setOpen}/><div className="min-w-0 flex-1 border-[#93c5fd] sm:border-x-4 lg:border-x-[15px]"><Topbar setOpen={setOpen}/><main className="p-4 sm:p-6 lg:p-8"><Breadcrumb/><h1 className="mb-2 text-4xl font-bold text-[#0b2f24]">Tohumçylyk maglumatlary</h1><p className="mb-6 text-gray-500">Jemi {horses.length} at — tablisa katalog bilen bilelikde täzelenýär.</p><div className="overflow-x-auto rounded-2xl bg-white p-4 shadow"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b text-gray-500"><th className="p-3">At</th><th>ID</th><th>Nesil ugry</th><th>Atasy</th><th>Enesi</th><th>Tohumçylyk gymmaty</th></tr></thead><tbody>{horses.map(h=><tr key={h.id} className="border-b align-top hover:bg-emerald-50"><td className="p-3 font-bold"><a href={`/atlar/${h.id}`}>{h.name}</a></td><td>{h.code}</td><td>{h.lineage||"—"}</td><td className="max-w-xs p-2">{h.father||"—"}</td><td className="max-w-xs p-2">{h.mother||"—"}</td><td>{h.breedingValue||"—"}</td></tr>)}</tbody></table></div></main></div></div>}

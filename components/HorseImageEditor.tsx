"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw, RotateCw, Upload, X } from "lucide-react";
import { assetPath } from "../lib/assetPath";

type Props = {
  source?: string;
  onSave: (image: string, original: string) => boolean | Promise<boolean>;
  onClose: () => void;
};

function draw(canvas: HTMLCanvasElement, image: HTMLImageElement, zoom: number, x: number, y: number, rotation: number) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw Error("Canvas is not supported");
  const w = canvas.width, h = canvas.height;
  const radians = rotation * Math.PI / 180;
  const rotatedW = Math.abs(image.naturalWidth * Math.cos(radians)) + Math.abs(image.naturalHeight * Math.sin(radians));
  const rotatedH = Math.abs(image.naturalWidth * Math.sin(radians)) + Math.abs(image.naturalHeight * Math.cos(radians));
  const scale = Math.max(w / rotatedW, h / rotatedH) * zoom;
  const width = rotatedW * scale, height = rotatedH * scale;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#092d23";
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.translate(w / 2 + (x / 100) * Math.max(0, width - w) / 2, h / 2 + (y / 100) * Math.max(0, height - h) / 2);
  ctx.rotate(radians);
  ctx.drawImage(image, -image.naturalWidth * scale / 2, -image.naturalHeight * scale / 2, image.naturalWidth * scale, image.naturalHeight * scale);
  ctx.restore();
}

async function readAndCompress(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type) || file.size > 12 * 1024 * 1024) {
    throw Error("Diňe JPG, PNG, WebP ýa-da AVIF surat (iň köp 12 MB).");
  }
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(Error("Surat açylmady."));
      el.src = url;
    });
    const canvas = document.createElement("canvas");
    const factor = Math.min(1, 1440 / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * factor));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * factor));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw Error("Surat işlenip bilinmedi.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    let data = canvas.toDataURL("image/webp", 0.75);
    if (!data.startsWith("data:image/webp")) data = canvas.toDataURL("image/jpeg", 0.75);
    if (data.length > 650_000) throw Error("Surat gaty uly. Has kiçi surat saýlaň.");
    return data;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function HorseImageEditor({ source, onSave, onClose }: Props) {
  const preview = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [original, setOriginal] = useState(source ?? "");
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!original) { imageRef.current = null; return; }
    let cancelled = false;
    const image = new window.Image();
    // Local images, data URLs and same-origin repository assets are supported.
    if (/^https?:/.test(original)) image.crossOrigin = "anonymous";
    image.onload = () => { if (!cancelled) { imageRef.current = image; if (preview.current) draw(preview.current, image, zoom, x, y, rotation); } };
    image.onerror = () => { if (!cancelled) setError("Suraty açyp bolmady. Täze surat saýlaň."); };
    image.src = assetPath(original);
    return () => { cancelled = true; };
  // Reload only when source changes; all other changes redraw below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [original]);

  useEffect(() => {
    if (preview.current && imageRef.current) draw(preview.current, imageRef.current, zoom, x, y, rotation);
  }, [zoom, x, y, rotation, original]);

  async function selectFile(file?: File) {
    if (!file) return;
    setBusy(true); setError("");
    try {
      const prepared = await readAndCompress(file);
      imageRef.current = null;
      setOriginal(prepared);
      setZoom(1); setX(0); setY(0); setRotation(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Surat saýlamak başartmady.");
    } finally { setBusy(false); }
  }

  async function save() {
    if (!imageRef.current || !original || busy) return;
    setBusy(true); setError("");
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 960; canvas.height = 540;
      draw(canvas, imageRef.current, zoom, x, y, rotation);
      let output = canvas.toDataURL("image/webp", 0.72);
      if (!output.startsWith("data:image/webp")) output = canvas.toDataURL("image/jpeg", 0.72);
      if (output.length > 260_000) throw Error("Surat gaty uly. Başga surat saýlap görüň.");
      const ok = await onSave(output, original);
      if (ok) onClose();
      else setError("Suraty ýatda saklamak başartmady.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Surat ýatda saklanmady.");
    } finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 p-3 print:hidden" role="presentation" onMouseDown={event => event.stopPropagation()}>
      <div role="dialog" aria-modal="true" aria-label="Atyň suratyny sazla" className="max-h-[95vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-[#0b2f24]">Atyň suratyny sazla</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Ýap"><X size={22}/></button>
        </div>
        <canvas ref={preview} width={960} height={540} className="aspect-video w-full rounded-xl bg-emerald-950 object-contain" aria-label="Suratyň öňünden görnüşi"/>
        <p className="mt-2 text-xs text-slate-600">16:9 görnüşinde görkeziler. Sazlamalary üýtgedip, soň saklaň.</p>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#0b5e3c] px-4 py-3 font-bold text-white">
          <Upload size={18}/> Surat saýla / çalyş
          <input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={busy} onChange={e => { void selectFile(e.target.files?.[0]); e.target.value = ""; }}/>
        </label>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Control label="Ulalt / kiçelt" value={zoom} min={1} max={3} step={0.05} onChange={setZoom}/>
          <Control label="Çep / saga süýşür" value={x} min={-100} max={100} step={1} onChange={setX}/>
          <Control label="Ýokary / aşak süýşür" value={y} min={-100} max={100} step={1} onChange={setY}/>
          <div className="flex flex-col justify-end gap-2">
            <span className="text-sm font-bold text-[#0b2f24]">Suraty aýla ({rotation}°)</span>
            <Control label="Egriligini düzelt (gradus)" value={rotation} min={-180} max={180} step={1} onChange={setRotation}/>
            <div className="flex gap-2">
              <button type="button" onClick={()=>setRotation(r=>r-90 < -180 ? r+270 : r-90)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border p-2 text-slate-800"><RotateCcw size={17}/> -90°</button>
              <button type="button" onClick={()=>setRotation(r=>r+90 > 180 ? r-270 : r+90)} className="flex flex-1 items-center justify-center gap-2 rounded-lg border p-2 text-slate-800"><RotateCw size={17}/> +90°</button>
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button type="button" onClick={()=>{setZoom(1);setX(0);setY(0);setRotation(0);}} className="rounded-lg border px-4 py-2 text-sm font-bold text-slate-800">Başlangyç ýagdaýa getir</button>
          {error && <p role="alert" className="text-sm font-bold text-red-700">{error}</p>}
          <button type="button" disabled={busy || !imageRef.current} onClick={()=>void save()} className="rounded-xl bg-[#0b5e3c] px-6 py-3 font-bold text-white disabled:opacity-50">{busy?"Taýýarlanýar...":"Suraty ýatda sakla"}</button>
        </div>
      </div>
    </div>
  );
}

function Control({label,value,min,max,step,onChange}:{label:string;value:number;min:number;max:number;step:number;onChange:(value:number)=>void}) {
  return <label className="block text-sm font-bold text-[#0b2f24]">{label}: {step < 1 ? value.toFixed(2) : value}
    <input type="range" className="mt-2 block w-full accent-[#0b5e3c]" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}/>
  </label>;
}

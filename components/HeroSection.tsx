
import Link from "next/link";
import { ArrowRight, Trophy, FileText, Network } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl min-h-[720px] md:min-h-[850px] shadow-2xl">

      {/* Background */}
      <img
        src="/horse-hero.png"
        alt="Horse"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between h-full min-h-[720px] md:min-h-[850px] p-6 md:p-16">

        <div>
          <p className="text-yellow-300 font-semibold tracking-wider uppercase mb-6">
            SANLY ATÇYLYK — GELJEGIŇ UGURY
          </p>

          <h1 className="text-4xl md:text-6xl xl:text-7xl font-extrabold leading-tight text-white max-w-5xl">
            ATLARYŇ NESIL
            <br />
            MAGLUMATLARYNY
            <br />
            SANLY DOLANDYRYŞ
            <br />
            ULGAMY
          </h1>

          <p className="text-white/90 text-base md:text-xl mt-6 md:mt-8 max-w-2xl leading-7 md:leading-9">
            Atlaryň nesil şejeresini öwrenmek, maglumatlary saklamak,
            seljermek we sanly dolandyryş üçin döredilen häzirki zaman
            platformasy.
          </p>

          <Link
            href="/atlar"
            className="inline-flex items-center gap-3 mt-10 bg-[#0b5d3d] hover:bg-[#084a31] text-white px-8 py-4 rounded-xl font-semibold transition duration-300 shadow-lg"
          >
            ATLARYŇ KATALOGYNA GIRIŇ
            <ArrowRight size={22} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6 mt-8">

          <StatCard
            icon={"🐎"}
            title="Jemi atlar"
            value="1,456"
          />

          <StatCard
            icon={<Network size={34} />}
            title="Nesil baglanyşyklary"
            value="5,000"
          />

          <StatCard
            icon={<Trophy size={34} />}
            title="Çempion atlar"
            value="87"
          />

          <StatCard
            icon={<FileText size={34} />}
            title="Hasabatlar"
            value="12"
          />

        </div>

      </div>
    </section>
  );
}

function StatCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl hover:-translate-y-2 hover:shadow-2xl transition duration-300">

      <div className="w-14 h-14 rounded-full bg-[#0b5d3d] text-white flex items-center justify-center mb-4">
        {icon}
      </div>

      <p className="text-gray-500 text-sm">{title}</p>

      <h3 className="text-4xl font-bold text-[#0b2f24] mt-2">
        {value}
      </h3>
    </div>
  );
}
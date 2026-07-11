"use client";

const data = [
  { year: 2018, value: 120 },
  { year: 2019, value: 156 },
  { year: 2020, value: 190 },
  { year: 2021, value: 165 },
  { year: 2022, value: 198 },
  { year: 2023, value: 220 },
  { year: 2024, value: 249 },
];

export default function BirthLineChart() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 h-[430px]">
      <h2 className="text-2xl font-bold text-[#0b2f24] mb-8">
        Ýyllar boýunça doglan atlar
      </h2>

      <svg
        viewBox="0 0 700 280"
        className="w-full h-[280px]"
      >
        {/* Grid */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="60"
            x2="660"
            y1={40 + i * 50}
            y2={40 + i * 50}
            stroke="#e5e7eb"
          />
        ))}

        {/* Axis */}
        <line x1="60" y1="20" x2="60" y2="240" stroke="#999" />
        <line x1="60" y1="240" x2="660" y2="240" stroke="#999" />

        {/* Line */}
        <polyline
          fill="none"
          stroke="#0b5e3c"
          strokeWidth="4"
          points="
          60,180
          160,150
          260,110
          360,140
          460,100
          560,75
          660,45"
        />

        {/* Points */}
        {[
          [60,180],
          [160,150],
          [260,110],
          [360,140],
          [460,100],
          [560,75],
          [660,45],
        ].map(([x,y],i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r="6" fill="#0b5e3c"/>
            <text
              x={x}
              y={y-12}
              textAnchor="middle"
              fontSize="12"
              fill="#0b2f24"
              fontWeight="600"
            >
              {data[i].value}
            </text>
          </g>
        ))}

        {/* Years */}
        {data.map((d,i)=>(
          <text
            key={d.year}
            x={60+i*100}
            y="265"
            textAnchor="middle"
            fontSize="12"
            fill="#555"
          >
            {d.year}
          </text>
        ))}
      </svg>
    </div>
  );
}
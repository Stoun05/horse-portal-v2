"use client";

export default function BreedPieChart() {
  const items = [
    { name: "Ahal-teke", percent: 72, count: 898, color: "#0b5e3c" },
    { name: "Ýomut", percent: 15, count: 187, color: "#3b82f6" },
    { name: "Budennow", percent: 8, count: 99, color: "#eab308" },
    { name: "Beýylis", percent: 5, count: 64, color: "#8b5cf6" },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[430px] w-full overflow-hidden">
      <h2 className="text-2xl font-bold text-[#0b2f24] mb-8">
        Tohumlar boýunça paýlanyş
      </h2>

      <div className="flex items-center gap-8">
        <div className="shrink-0">
          <div
            className="relative w-64 h-64 rounded-full"
            style={{
              background:
                "conic-gradient(#0b5e3c 0% 72%, #3b82f6 72% 87%, #eab308 87% 95%, #8b5cf6 95% 100%)",
            }}
          >
            <div className="absolute inset-16 bg-white rounded-full shadow flex flex-col items-center justify-center">
              <span className="text-sm text-gray-500">Jemi</span>
              <b className="text-3xl text-[#0b2f24]">1,248</b>
              <span className="text-sm text-gray-500">at</span>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-[180px] space-y-5">
          {items.map((item) => (
            <div key={item.name}>
              <div className="flex justify-between gap-3 text-sm mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-semibold text-[#0b2f24]">
                    {item.name}
                  </span>
                </div>

                <span className="text-gray-600 font-medium whitespace-nowrap">
                  {item.percent}% ({item.count})
                </span>
              </div>

              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${item.percent}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}

          <p className="text-right text-gray-600 pt-4">
            Jemi: <b>1,248</b> at
          </p>
        </div>
      </div>
    </div>
  );
}
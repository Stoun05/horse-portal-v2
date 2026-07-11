"use client";

export default function InbreedingBarChart() {
  const data = [
    {
      name: "Gyrat",
      breed: "Ahal-teke",
      value: 3.2,
      color: "bg-green-700",
    },
    {
      name: "Garaguş",
      breed: "Ýomut",
      value: 6.8,
      color: "bg-yellow-500",
    },
    {
      name: "Serdar",
      breed: "Ahal-teke",
      value: 4.5,
      color: "bg-blue-500",
    },
    {
      name: "Batyry",
      breed: "Ahal-teke",
      value: 2.1,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 min-h-[430px] w-full">
      <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
        Genetiki ýakynlyk (Inbreeding) analizi
      </h2>

      <div className="space-y-6">
        {data.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-semibold text-[#0b2f24]">
                  {item.name}
                </p>
                <span className="text-sm text-gray-500">
                  {item.breed}
                </span>
              </div>

              <span className="font-bold text-gray-700">
                {item.value}%
              </span>
            </div>

            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.color} rounded-full`}
                style={{
                  width: `${item.value * 10}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-green-50 rounded-xl p-4">
        <p className="text-sm text-gray-600">
          Ortaça genetiki dürlülik görkezijisi:
        </p>
        <p className="text-3xl font-bold text-[#0b5e3c]">
          0.87
        </p>
      </div>
    </div>
  );
}
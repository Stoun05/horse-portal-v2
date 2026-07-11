"use client";

export default function ChampionStats() {
  const champions = [
    {
      name: "Galkynyş",
      breed: "Ahal-teke",
      score: "96.3",
      medal: "🥇",
    },
    {
      name: "Serdar",
      breed: "Ahal-teke",
      score: "94.1",
      medal: "🥈",
    },
    {
      name: "Batyr",
      breed: "Ahal-teke",
      score: "93.7",
      medal: "🥉",
    },
    {
      name: "Mähri",
      breed: "Ahal-teke",
      score: "92.8",
      medal: "🏅",
    },
    {
      name: "Garagöz",
      breed: "Ahal-teke",
      score: "91.6",
      medal: "🏅",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full min-h-[360px]">

      <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
        Iň gowy öndürijilik görkezijileri
      </h2>

      <div className="space-y-4">

        {champions.map((horse, index) => (
          <div
            key={horse.name}
            className="flex items-center justify-between border-b pb-3"
          >

            <div className="flex items-center gap-3">

              <span className="text-xl">
                {horse.medal}
              </span>

              <div>
                <p className="font-semibold text-[#0b2f24]">
                  {horse.name}
                </p>

                <p className="text-sm text-gray-500">
                  {horse.breed}
                </p>
              </div>

            </div>


            <div className="text-right">

              <p className="font-bold text-[#0b5e3c]">
                {horse.score}
              </p>

              <div className="text-yellow-500">
                ★★★★★
              </div>

            </div>

          </div>
        ))}

      </div>


      <button className="mt-5 w-full border rounded-xl py-2 text-gray-400 hover:bg-gray-50">
        Hemmesini görmek →
      </button>

    </div>
  );
}
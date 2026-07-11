"use client";

export default function TopHorses() {

  const horses = [
    {
      rank: "🥇",
      name: "Galkynyş",
      breed: "Ahal-teke",
      score: "96.3",
    },
    {
      rank: "🥈",
      name: "Serdar",
      breed: "Ahal-teke",
      score: "94.1",
    },
    {
      rank: "🥉",
      name: "Batyr",
      breed: "Ahal-teke",
      score: "93.7",
    },
    {
      rank: "4",
      name: "Mähri",
      breed: "Ahal-teke",
      score: "92.8",
    },
    {
      rank: "5",
      name: "Garassyz",
      breed: "Ahal-teke",
      score: "91.6",
    },
  ];


  return (

    <div className="bg-white rounded-2xl shadow-lg p-6 w-full">

      <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
        Iň gowy öndürijilik görkezijileri
      </h2>


      <div className="space-y-4">


        {horses.map((horse) => (

          <div
            key={horse.name}
            className="flex items-center justify-between border-b pb-3"
          >


            <div className="flex items-center gap-4">


              <span className="text-xl w-8">
                {horse.rank}
              </span>


              <div>

                <p className="font-bold text-[#0b2f24]">
                  {horse.name}
                </p>

                <p className="text-sm text-gray-500">
                  {horse.breed}
                </p>

              </div>


            </div>



            <div className="flex items-center gap-3">

              <span className="font-bold text-[#0b2f24]">
                {horse.score}
              </span>


              <span className="text-yellow-500">
                ⭐⭐⭐⭐⭐
              </span>


            </div>


          </div>

        ))}


      </div>


      <button className="mt-6 border rounded-xl px-5 py-2 w-full hover:bg-gray-50">
        Hemmesini görmek →
      </button>


    </div>

  );
}
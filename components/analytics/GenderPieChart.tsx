"use client";

export default function GenderPieChart() {

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[360px]">

      <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
        Jyns boýunça paýlanyş
      </h2>


      <div className="flex items-center justify-center gap-10">


        {/* DONUT */}
        <div className="relative w-52 h-52 rounded-full 
          bg-[conic-gradient(#3b82f6_0_61%,#ec4899_61%_100%)]">

          <div className="absolute inset-12 bg-white rounded-full 
            flex flex-col items-center justify-center">

            <span className="text-gray-500 text-sm">
              Jemi
            </span>

            <b className="text-3xl text-[#0b2f24]">
              1,248
            </b>

            <span className="text-gray-500 text-sm">
              at
            </span>

          </div>

        </div>



        {/* INFO */}
        <div className="space-y-5">


          <div className="flex items-center gap-3">

            <span className="w-4 h-4 rounded-full bg-blue-500"></span>

            <div>
              <p className="font-semibold">
                Aýgyr
              </p>

              <p className="text-gray-500">
                61% (761)
              </p>
            </div>

          </div>



          <div className="flex items-center gap-3">

            <span className="w-4 h-4 rounded-full bg-pink-500"></span>

            <div>
              <p className="font-semibold">
                Kobyla
              </p>

              <p className="text-gray-500">
                39% (487)
              </p>
            </div>

          </div>


        </div>


      </div>


      <p className="text-right text-sm text-gray-500 mt-6">
        Jemi: 1,248 at
      </p>


    </div>
  );
}
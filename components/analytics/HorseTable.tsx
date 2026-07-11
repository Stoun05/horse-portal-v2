"use client";

const horses = [
  {
    name: "Batyr",
    breed: "Ahalteke",
    year: "2020",
    father: "Galkynyş",
    mother: "Aýnur",
    health: "95%",
    genetics: "0.91",
  },
  {
    name: "Serdar",
    breed: "Ahalteke",
    year: "2019",
    father: "Türkmen",
    mother: "Mähri",
    health: "93%",
    genetics: "0.89",
  },
  {
    name: "Galkynyş",
    breed: "Ahalteke",
    year: "2018",
    father: "Ýyldyz",
    mother: "Gül",
    health: "96%",
    genetics: "0.94",
  },
  {
    name: "Mähri",
    breed: "Ahalteke",
    year: "2021",
    father: "Batyr",
    mother: "Aýna",
    health: "92%",
    genetics: "0.87",
  },
];

export default function HorseTable() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 w-full">

      <h2 className="text-2xl font-bold text-[#0b2f24] mb-6">
        Atlaryň maglumat bazasy
      </h2>

      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead>
            <tr className="border-b text-gray-500">
              <th className="py-3">At</th>
              <th className="py-3">Tohum</th>
              <th className="py-3">Doglan ýyly</th>
              <th className="py-3">Kakasy</th>
              <th className="py-3">Enesi</th>
              <th className="py-3">Saglyk</th>
              <th className="py-3">Genetika</th>
              <th className="py-3"></th>
            </tr>
          </thead>


          <tbody>

            {horses.map((horse, index) => (

              <tr 
                key={index}
                className="border-b hover:bg-gray-50"
              >

                <td className="py-4 font-semibold text-[#0b2f24]">
                  {horse.name}
                </td>

                <td className="py-4">
                  {horse.breed}
                </td>

                <td className="py-4">
                  {horse.year}
                </td>

                <td className="py-4">
                  {horse.father}
                </td>

                <td className="py-4">
                  {horse.mother}
                </td>

                <td className="py-4 text-green-600 font-bold">
                  {horse.health}
                </td>

                <td className="py-4">
                  {horse.genetics}
                </td>

                <td className="py-4">
                  <button
                    className="
                    bg-[#0b5e3c]
                    text-white
                    px-4
                    py-2
                    rounded-lg
                    text-sm
                    hover:bg-[#08462d]
                    "
                  >
                    Görmek
                  </button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}
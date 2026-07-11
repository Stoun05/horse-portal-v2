"use client";

import { useState } from "react";
import Sidebar from "../../../components/Sidebar";
import Topbar from "../../../components/Topbar";
import Breadcrumb from "../../../components/Breadcrumb";


const horses = {
  batyr: {
    name: "Batyr",
    gender: "Aýgyr",
    year: "2020",
    breed: "Ahal-teke",
    father: "Arslan",
    mother: "Melek",
    image: "/horses/batyr.png",
  },

  gyrat: {
    name: "Gyrat",
    gender: "Aýgyr",
    year: "2019",
    breed: "Ahal-teke",
    father: "Galkan",
    mother: "Aýnur",
    image: "/horses/gyrat.png",
  },
};


export default function AtProfilePage({
  params,
}: {
  params: { id: string };
}) {

  const [open, setOpen] = useState(false);


  const horse =
    horses[params.id as keyof typeof horses] || horses.batyr;



  return (

    <div className="min-h-screen bg-gray-100 lg:flex">

      <Sidebar 
        open={open}
        setOpen={setOpen}
      />


      <div className="flex-1">

        <Topbar setOpen={setOpen}/>


        <main className="p-4 sm:p-6 lg:p-8">

          <Breadcrumb />


          <div className="flex justify-between items-center mb-6">

            <h1 className="text-3xl lg:text-4xl font-bold text-[#0b2f24]">
              At pasporty
            </h1>


            <button className="
            bg-[#0b5e3c]
            text-white
            px-5
            py-3
            rounded-xl
            ">
              PDF eksport
            </button>

          </div>




          <div className="
          bg-white
          rounded-2xl
          shadow-lg
          p-6
          ">



            <div className="
            grid
            grid-cols-1
            xl:grid-cols-[360px_1fr]
            gap-10
            ">



              <img

                src={horse.image}

                alt={horse.name}

                className="
                w-full
                h-[360px]
                object-cover
                rounded-2xl
                shadow
                "

              />




              <div>


                <div className="flex items-center gap-4 mb-6">


                  <h2 className="
                  text-4xl
                  font-bold
                  text-[#0b2f24]
                  ">
                    {horse.name}
                  </h2>



                  <span className="
                  bg-[#0b5e3c]
                  text-white
                  px-4
                  py-2
                  rounded-xl
                  ">
                    {horse.breed}
                  </span>


                </div>



                <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-4
                ">


                  <Info label="ID" value={params.id}/>

                  <Info label="Jynsy" value={horse.gender}/>

                  <Info label="Doglan ýyly" value={horse.year}/>

                  <Info label="Tohumy" value={horse.breed}/>

                  <Info label="Kakasy" value={horse.father}/>

                  <Info label="Ejesi" value={horse.mother}/>


                </div>


              </div>



            </div>





            <Section title="Nesil maglumatlary">

              <div className="
              grid
              md:grid-cols-4
              gap-4
              ">

                <Info label="Ata" value={horse.father}/>

                <Info label="Ene" value={horse.mother}/>

                <Info label="Baba" value="Galkan"/>

                <Info label="Mama" value="Aýnur"/>

              </div>

            </Section>





            <Section title="Waksina taryhy">

              <div className="
              bg-gray-50
              rounded-xl
              p-5
              border
              space-y-2
              text-gray-900
              font-medium
              ">

                <p>Tetanos — 12.03.2025</p>

                <p>Dümew — 20.05.2025</p>


              </div>


            </Section>






            <Section title="Resminamalar">

              <div className="
                bg-gray-50
                rounded-xl
                p-5
                border
                text-gray-900
                font-medium
                ">


                <ul className="space-y-2">

                  <li>📄 Pasport.pdf</li>

                  <li>📄 Weterinar şahadatnamasy.pdf</li>

                  <li>📄 Gan analizleri.pdf</li>


                </ul>


              </div>


            </Section>







            <Section title="Ýaryş netijeleri">


              <div className="
              bg-gray-50
              rounded-xl
              p-5
              border
              ">


                <table className="w-full text-gray-900">


                  <thead>

                    <tr className="border-b">

                      <th className="text-left py-3">
                        Ýaryş
                      </th>


                      <th className="text-left py-3">
                        Ýyl
                      </th>


                      <th className="text-left py-3">
                        Orun
                      </th>


                    </tr>


                  </thead>



                  <tbody>


                    <tr className="border-b">

                      <td className="py-3">
                        Aşgabat Kubogy
                      </td>

                      <td>
                        2024
                      </td>

                      <td>
                        1-nji orun
                      </td>


                    </tr>



                    <tr>

                      <td className="py-3">
                        Türkmenistan Çempionaty
                      </td>

                      <td>
                        2025
                      </td>

                      <td>
                        2-nji orun
                      </td>


                    </tr>


                  </tbody>


                </table>



              </div>



            </Section>




          </div>


        </main>


      </div>


    </div>

  );

}




function Info({
  label,
  value,
}:{
  label:string;
  value:string;
}){

  return(

    <div className="
    bg-gray-100
    rounded-xl
    p-4
    border
    ">

      <p className="text-sm text-gray-700 font-medium">
        {label}
      </p>

      <p className="
        font-bold
        text-gray-900
        mt-1
        ">
        {value}
      </p>


    </div>

  );

}




function Section({
 title,
 children,
}:{
 title:string;
 children:React.ReactNode;
}){


 return(

  <div className="mt-10">


    <h3 className="
    text-2xl
    font-bold
    mb-4
    text-gray-900
    ">
      {title}
    </h3>


    {children}


  </div>


 );


}
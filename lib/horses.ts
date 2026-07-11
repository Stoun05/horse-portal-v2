export type Horse = {
  id: string;
  name: string;
  breed: string;
  sex: "Aýgyr" | "Baýtal";
  color: "Doru" | "Al" | "Gar";
  year: number;
  code: string;
  image: string;
  champion: boolean;
  father?: string;
  mother?: string;
  microchip?: string;
  birthPlace?: string;
};

export type HorseForm = Omit<Horse, "id">;

export const HORSE_STORAGE_KEY = "horse-portal-v2-horses";

export const initialHorses: Horse[] = [
  { id: "1", name: "Galkynyş", breed: "Ahal-teke", sex: "Aýgyr", color: "Doru", year: 2018, code: "AT-2018-045", image: "/horses/galkynys.png", champion: true, father: "Galkan", mother: "Aýnur", microchip: "795010000018045", birthPlace: "Aşgabat" },
  { id: "2", name: "Serdar", breed: "Ahal-teke", sex: "Aýgyr", color: "Doru", year: 2010, code: "AT-2010-031", image: "/horses/serdar.png", champion: false, father: "Arslan", mother: "Melek", microchip: "795010000010031", birthPlace: "Ahal welaýaty" },
  { id: "3", name: "Mähri", breed: "Ahal-teke", sex: "Baýtal", color: "Al", year: 2011, code: "AT-2011-021", image: "/horses/mahri.png", champion: false, father: "Ýalkym", mother: "Näzli", microchip: "795010000011021", birthPlace: "Ahal welaýaty" },
  { id: "4", name: "Garassyz", breed: "Ahal-teke", sex: "Aýgyr", color: "Doru", year: 2019, code: "AT-2019-012", image: "/horses/garassyz.png", champion: true, father: "Gyrat", mother: "Gözel", microchip: "795010000019012", birthPlace: "Aşgabat" },
  { id: "5", name: "Gözel", breed: "Ahal-teke", sex: "Baýtal", color: "Doru", year: 2020, code: "AT-2020-014", image: "/horses/gozel.png", champion: false, father: "Batyr", mother: "Mähri", microchip: "795010000020014", birthPlace: "Mary welaýaty" },
  { id: "6", name: "Batyr", breed: "Ahal-teke", sex: "Aýgyr", color: "Al", year: 2021, code: "AT-2021-017", image: "/horses/batyr.png", champion: true, father: "Arslan", mother: "Melek", microchip: "795010000021017", birthPlace: "Aşgabat" },
  { id: "7", name: "Günnur", breed: "Ahal-teke", sex: "Baýtal", color: "Doru", year: 2022, code: "AT-2022-016", image: "/horses/gunnur.png", champion: false, father: "Galkan", mother: "Näzli", microchip: "795010000022016", birthPlace: "Balkan welaýaty" },
  { id: "8", name: "Pyrtykal", breed: "Ýomut", sex: "Aýgyr", color: "Gar", year: 2017, code: "AT-2017-019", image: "/horses/Galkan.png", champion: false, father: "Miras", mother: "Altyn", microchip: "795010000017019", birthPlace: "Daşoguz welaýaty" },
];

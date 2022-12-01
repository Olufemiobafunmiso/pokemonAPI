import { Species } from "./Species";
import { Stat } from "./Stat";
import { ITypes } from "./Types";

export interface IPokemonWithStats {
  name: string;
  height: number;
  base_experience: number;
  averageBaseExperience: number;
  id: number;
  sprite_img: string;
  species: Species;
  url: string;
  stats: Array<Stat>;
  types: Array<ITypes>;
  moves: IMove[];
  errorCode?:number;
  errMsg?:string;
}
interface IMove {
  [key: string]: string;
}

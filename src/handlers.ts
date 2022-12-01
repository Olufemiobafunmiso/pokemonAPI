import { FastifyRequest, FastifyReply } from "fastify";
import { IOptions } from "models/RequestOptions";
import { IPokemonWithStats } from "models/PokemonWithStats";
import { SuccessResponseObject } from "./common/http";

import { BadRequestError, CustomError, NotFoundError } from "./common/error";

export async function getPokemonByName(request: FastifyRequest, reply: FastifyReply) {

    const name = request.params["name"] as string;
    reply.headers["Accept"] = "application/json";

    const isNameNotNumericOrEmpty = name && isNaN(request.params["name"]);

    if (!isNameNotNumericOrEmpty) {
      throw new BadRequestError('name is required and cannot be a number')
    }

    const getUrl = getPokemonUrl(name);

    const options: IOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json;charset=UTF-8",
        Accept: "application/json",
      },
      keepAlive: true,
    };

    const response = (await makeApiCall(getUrl, options)) as IPokemonWithStats;
    // No need to do error check here since error check has been implemented in the makeApiCall function


    await computeResponse(response);

    return reply
      .status(200)
      .send(
        new SuccessResponseObject(
          "Pokemon successfully fetched by name 😎",
          response
        )
      );

    
  } 


export const computeResponse = async (response: unknown): Promise<Partial<IPokemonWithStats> | void> => {

    const resp = response as IPokemonWithStats;
  
    const { types, stats } = resp;

    const typesUrls = types.map((type) => type.type).map((type) => type.url);
    const pokemonTypes: IPokemonWithStats[] = [];

    if (!typesUrls.length) {
      throw new NotFoundError('Types URLS not found')
    }

    await Promise.all(
      typesUrls.map(async (url) => {
        const data = await makeApiCall(url) as IPokemonWithStats
        pokemonTypes.push(data);
      })
    );

    if (!pokemonTypes.length) {
      throw new NotFoundError('Types not found')
    }
    // Create hashMap
    const statNames = new Map();

    pokemonTypes.forEach((element) => {
      if (element?.stats) {
        element.stats.map((stats) => {
          // populate hashmap
          statNames.set(`${stats.stat.name}`, stats)
        })
      }
    })


    // use foreach to mutate the response.
    stats.forEach((element) => {
      const stats: number[] = [];


      //JS is case sensitive 'a' !== 'A'
      const isStatExist =
        statNames[element.stat.name] &&
        `${statNames[element.stat.name].stat.name}`.toUpperCase() === `${element.stat.name}`.toUpperCase();

      if (isStatExist) {
        const base_stat = statNames[element.stat.name].base_stat;
        stats.push(base_stat);
      }

      const avg = stats.length ? stats.reduce((a, b) => a + b) / stats.length : 0;
      element.averageStat = avg;
    });


    return response as IPokemonWithStats; // For test sake

};

export const getPokemonUrl = (name = ""): string => {
  const paramsName = name.trim();
  return `https://pokeapi.co/api/v2/pokemon/${paramsName}?offset=20&limit=20`;
};

export const makeApiCall = async (url: string, options?: Partial<IOptions>): Promise<unknown> => {

  const response = await fetch(url, options)

    if (!response.ok && response.status===404) {
      throw new NotFoundError(response.statusText)
    }
    if(!response.ok){
      throw new CustomError()
    }
    return response.json()


};





import { FastifyInstance, FastifySchema } from "fastify";
import { getPokemonByName } from "./handlers";

const schema: FastifySchema = {
  params: {
    type: "object",
    additionalProperties: false,
    required: ["name"],
    properties: {
      name: { type: 'string' }
    }
  },
};

export default function router(fastify: FastifyInstance, _, next) {
  fastify.get("/poke/:name", { schema }, getPokemonByName);
  next();
}

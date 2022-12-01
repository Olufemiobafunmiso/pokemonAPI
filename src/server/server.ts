import app from "../app";

const FASTIFY_PORT = Number(process.env.FASTIFY_PORT) || 3000;

app.listen(FASTIFY_PORT).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
console.log(`🚀  Fastify server running on port ${FASTIFY_PORT}`);

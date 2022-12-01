import { CustomError } from "./common/error";
import { ErrorResponseObject } from "./common/http";
import { logger } from "./common/logger";
import fastify, {
  FastifyServerOptions,
  FastifyLoggerInstance,
  FastifyInstance,
} from "fastify";
import { Server, IncomingMessage, ServerResponse } from "http";
import router from "./router";

const serverOptions: FastifyServerOptions<Server, FastifyLoggerInstance> = {
  // Logger only for production
  logger: !!(process.env.NODE_ENV !== "development"),
};

const app: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(
  serverOptions
);



// Middleware: Router
app.register(router)
app.setErrorHandler(async (error, _request, reply) => {
  let customError = error;

  //log error for internal investigation
  logger.error(error);

  if (!(error instanceof CustomError)) {

    customError = new CustomError(
      //Use this generic error message so users wont see error messages like "undefined" or DB error
      "An error occurred, admin fixing 🛠"
    );
  }

  reply.status(customError.statusCode).send(new ErrorResponseObject(`${customError.message}`));
})
export default app;

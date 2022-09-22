import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageProductionDefault,
} from "apollo-server-core";

import { resolvers } from "./resolvers";
import { connectToMongo } from "./utils/mongo";
import { verifyJwt } from "./utils/jwt";
import { User } from "./schemas/user.schema";
import Context from "./types/context";
import authChecker from "./utils/authChecker";

async function bootstrap() {
  // build the schema
  const schema = await buildSchema({
    resolvers,
    authChecker
  });

  // init express
  const app = express();

  app.use(cookieParser());

  const server = new ApolloServer({
    schema,
    context: (ctx: Context) => {
      const token = ctx.req.headers.authorization || '';

      const user = verifyJwt<User>(token);

      ctx.user = user;
      return ctx;
    },
    plugins: [
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageProductionDefault()
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  })

  // start server
  await server.start()

  // apply middleware to server
  server.applyMiddleware({app});

  // start express server
  app.listen({port:4000}, () => {
    console.log("4000");
  });
  connectToMongo();
}

bootstrap();

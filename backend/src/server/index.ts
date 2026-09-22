import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import "dotenv/config";

import { checkDatabase } from "../database";
import { patientsRoutes } from "../api/patients";
import { consultationRoutes } from "../api/consultations";
import { knowledgeGraphRoutes } from "../api/knowledgeGraph";
import { authRoutes } from "../api/auth";
import { adminRoutes } from "../api/admin";
const app = Fastify({
  logger: true,
});

async function start() {
  await app.register(cors, {
    origin: true,
  });

  await app.register(cookie);

  console.log(
    "PTALK SERVER: registering patientsRoutes"
  );

  await app.register(patientsRoutes);

  console.log(
    "PTALK SERVER: registering consultationRoutes"
  );

  await app.register(consultationRoutes);

  console.log(
    "PTALK SERVER: registering knowledgeGraphRoutes"
  );

  await app.register(knowledgeGraphRoutes);

  console.log(
    "PTALK SERVER: registering authRoutes"
  );

  await app.register(authRoutes);
  console.log(
    "PTALK REGISTERED ROUTES:"
  );
  await app.register(adminRoutes);

  console.log(
    app.printRoutes()
  );
  app.get("/health", async () => {
    try {
      const database = await checkDatabase();

      return {
        status: "ok",
        service: "ptalk-backend",
        database: "connected",
        database_time: database.now,
      };
    } catch (error) {
      app.log.error(error);

      return {
        status: "error",
        service: "ptalk-backend",
        database: "disconnected",
      };
    }
  });

  /*
   * Debug route:
   * Shows whether Fastify actually registered
   * the patient profile PUT route.
   */
  app.get("/debug/routes", async () => {
    return app.printRoutes();
  });

  const port = Number(
    process.env.PORT || 4000
  );

  try {
    await app.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(
      `PTalk backend running on port ${port}`
    );

    console.log(
      "PTALK SERVER: registered routes:"
    );

    console.log(
      app.printRoutes()
    );
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
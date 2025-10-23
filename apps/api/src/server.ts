import { createServer, IncomingMessage, ServerResponse } from "node:http";
import process from "node:process";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const host = process.env.API_HOST ?? "0.0.0.0";
const port = Number.parseInt(process.env.API_PORT ?? "4000", 10);

async function ensureDatabaseConnection() {
  await prisma.$connect();
  await prisma.$queryRawUnsafe("SELECT 1");
}

async function handleHealthz(res: ServerResponse) {
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        database: "connected",
        uptime: Math.round(process.uptime()),
      }),
    );
  } catch (error) {
    res.writeHead(503, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        status: "unavailable",
        database: "error",
        message: error instanceof Error ? error.message : "unknown error",
      }),
    );
  }
}

async function handleRequest(req: IncomingMessage, res: ServerResponse) {
  const method = req.method ?? "GET";
  const url = new URL(req.url ?? "/", `http://${req.headers.host ?? `${host}:${port}`}`);

  if (method === "GET" && url.pathname === "/healthz") {
    await handleHealthz(res);
    return;
  }

  if (method === "GET" && url.pathname === "/") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        message: "API service is running",
      }),
    );
    return;
  }

  res.writeHead(404, { "content-type": "application/json" });
  res.end(JSON.stringify({ status: 404, message: "Not found" }));
}

async function start() {
  try {
    await ensureDatabaseConnection();
    console.log("[api] Database connection established");
  } catch (error) {
    console.error("[api] Unable to connect to the database", error);
    process.exit(1);
  }

  const server = createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error("[api] request handler error", error);
      if (!res.headersSent) {
        res.writeHead(500, { "content-type": "application/json" });
      }
      if (!res.writableEnded) {
        res.end(JSON.stringify({ status: 500, message: "Internal Server Error" }));
      }
    });
  });

  server.listen(port, host, () => {
    console.log(`[api] running at http://${host}:${port}`);
  });

  const shutdown = async (signal: NodeJS.Signals) => {
    console.log(`[api] received ${signal}, shutting down`);
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

void start();

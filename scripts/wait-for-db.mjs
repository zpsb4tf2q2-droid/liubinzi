#!/usr/bin/env node

import net from "node:net";
import process from "node:process";

const host = process.argv[2] ?? process.env.POSTGRES_HOST ?? "localhost";
const port = Number.parseInt(process.argv[3] ?? process.env.POSTGRES_PORT ?? "5432", 10);

const timeoutSeconds = Number.parseInt(process.env.WAIT_FOR_DB_TIMEOUT ?? "60", 10);
const retryIntervalMs = Number.parseInt(process.env.WAIT_FOR_DB_RETRY ?? "1000", 10);

function waitForPort(targetHost, targetPort) {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host: targetHost, port: targetPort }, () => {
      socket.end();
      resolve(undefined);
    });

    socket.on("error", (error) => {
      socket.destroy();
      reject(error);
    });
  });
}

await (async () => {
  const deadline = Date.now() + timeoutSeconds * 1000;

  while (Date.now() <= deadline) {
    try {
      await waitForPort(host, port);
      console.log(`[wait-for-db] ${host}:${port} is ready`);
      return;
    } catch (error) {
      const message = error.code ? `${error.code}` : error.message;
      console.log(`[wait-for-db] waiting for ${host}:${port} (${message})`);
      await new Promise((resolve) => setTimeout(resolve, retryIntervalMs));
    }
  }

  console.error(`[wait-for-db] timed out after ${timeoutSeconds}s waiting for ${host}:${port}`);
  process.exit(1);
})();

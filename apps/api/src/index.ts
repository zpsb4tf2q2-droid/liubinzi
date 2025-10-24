import { createHealthPayload, createServiceResponse } from "@project/shared";

export function getHealthCheck() {
  const health = createHealthPayload();

  return createServiceResponse(health);
}

export type ApiHealthResponse = ReturnType<typeof getHealthCheck>;

import type { HealthPayload, HealthStatus, ServiceResponse } from "./types/index.js";

export type { HealthPayload, HealthStatus, ServiceResponse } from "./types/index.js";

export function createHealthPayload(status: HealthStatus = "ok"): HealthPayload {
  return {
    status,
    timestamp: Date.now()
  };
}

export function createServiceResponse<T>(data: T, status = 200, meta?: Record<string, unknown>): ServiceResponse<T> {
  return {
    status,
    data,
    meta
  };
}

export type HealthStatus = "ok" | "degraded";

export interface HealthPayload {
  status: HealthStatus;
  timestamp: number;
}

export interface ServiceResponse<T> {
  status: number;
  data: T;
  meta?: Record<string, unknown>;
}

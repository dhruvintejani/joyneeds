export type HealthStatus = {
  status: "ok";
  service: "joyneeds-api";
  timestamp: string;
};

export function getHealthStatus(): HealthStatus {
  return {
    status: "ok",
    service: "joyneeds-api",
    timestamp: new Date().toISOString(),
  };
}

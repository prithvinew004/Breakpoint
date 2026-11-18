import { apiEnvironmentSchema, parseEnvironment } from "@repo/shared";

export function parseApiEnvironment(input: unknown) {
  return parseEnvironment(apiEnvironmentSchema, input);
}

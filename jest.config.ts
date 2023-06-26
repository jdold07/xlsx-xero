import type { Config } from "jest"

export const config: Config = {
  verbose: true,
  preset: "ts-jest",
  testMatch: ["**/tests/**/*.[Tt]est.[jt]s?(x)"],
}

export default config

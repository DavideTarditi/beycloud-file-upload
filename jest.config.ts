/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type { Config } from "jest"
import { config as dotenvConfig } from "dotenv"

dotenvConfig()

const config: Config = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: { "^.+\\.tsx?$": "ts-jest" },
    moduleFileExtensions: ["ts", "tsx", "js"],
    clearMocks: true,
    coverageProvider: "v8",
    verbose: true
}

export default config

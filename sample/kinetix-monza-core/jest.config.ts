import type { Config } from "jest";
import BaseConfig from "../../jest.config.base";

const config: Config = {
  ...BaseConfig,
  testMatch: ["<rootDir>/src/**/*.test.{js,jsx,ts,tsx}"],
};

export default config;

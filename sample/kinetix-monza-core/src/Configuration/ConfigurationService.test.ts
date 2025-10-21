// reflect-metadata is required for IOC
import "reflect-metadata";
import { api } from "../Utils/api";
import { ConfigurationService } from ".";
import { ConfigurationItem } from "@kinetix/core";

// Mock api calls
jest.mock("../Utils/api");

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let configService: ConfigurationService;
  let configItem: ConfigurationItem<string>;
  const resp = "success";

  // Execute once before all tests
  // To create single module for all tests
  beforeAll(() => {
    configService = new ConfigurationService();
    configItem = new ConfigurationItem<string>();
    configItem.application = "monza";
    configItem.item = "unittest";
    configItem.category = "test";
    configItem.section = "progress";
    configItem.value = "dummy";
  });

  // Execute before each tests
  beforeEach(() => {
    (api as jest.Mock).mockReturnValue(resp);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("Configuration Service", () => {
    // TEST:  Kinetix Monza Core > Configuration Service > should not throw error on config save
    it("should save the config with given details", async () => {
      let mockModule = jest.spyOn(configService as any, "getItemKey");
      console.debug = jest.fn();
      await configService.saveConfiguration(configItem);
      expect(configService).not.toBeNull();
      expect(mockModule).toBeCalledTimes(1);
      expect(api).toBeCalledTimes(1);
      expect(console.debug).toHaveBeenCalledWith(
        "Config saved successfully.RESPONSE",
        "success"
      );
    });

    // TEST:  Kinetix Monza Core > Configuration Service > should get undefined config for invalid response
    it("should get undefined config for invalid response", async () => {
      let mockModule = jest.spyOn(configService as any, "getItemKey");
      console.debug = jest.fn();
      let res = await configService.getConfiguration(configItem);
      expect(mockModule).toBeCalledTimes(1);
      expect(api).toBeCalledTimes(1);
      expect(res).toBe(undefined);
    });
  });
});

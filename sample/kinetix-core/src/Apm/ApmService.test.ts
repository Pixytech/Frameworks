// reflect-metadata is required for IOC
import "reflect-metadata";
import { ApmType, IContainer, MessageBoxViewModel, TagManagerType } from "@kinetix/core";
import { ApmService } from "./ApmService";
import { createMock } from "ts-auto-mock";
import { arrange } from "../../../../testing/core";
import { IApmAdapter, IApmAdapterType } from "./IApmAdapter";

const dummyTagManagerConfig = 'eyJndG1fYXV0aCI6IllYVjBhQ0k2SWs1RVIiLCJndG1fcHJldmlldyI6ImVudi1UZXN0IiwiZ3RtSWQiOiJHVE0tMTIzNDU2In0='

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: ApmService;
  let mockContainer: IContainer;

  // Execute once before each tests
  // To create single module for each tests
  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    sut = new ApmService(mockContainer);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("ApmService", () => {
    // TEST:  Kinetix Core > ViewMapProvider > should map MessageBoxViewModel
    it("initialize with no apm type", async () => {
      arrange(mockContainer).stubMethod(
        "buildAll",
        () => {
          return [];
        },
        [IApmAdapterType]
      );

      await sut.initialize("some", {
        apmServiceType: ApmType.None,
        buildId: "buildId",
        environmentName: "envName",
        version: "appVersion",
        apmServiceName: "",
        tagManagerType: TagManagerType.Google,
        tagManagerConfigs: dummyTagManagerConfig,
      });

      expect(sut.Apm.name).toBe("none");
    });

    it("initialize with adapter not implemented", async () => {
      const mockApmAdapter: IApmAdapter = createMock<IApmAdapter>();
      arrange(mockApmAdapter).stubProperty("name", () => "testAdapter");

      arrange(mockContainer).stubMethod(
        "buildAll",
        () => {
          return [mockApmAdapter];
        },
        [IApmAdapterType]
      );

      await sut.initialize("some", {
        apmServiceType: ApmType.Elastic,
        buildId: "buildId",
        environmentName: "envName",
        version: "appVersion",
        apmServiceName: "",
        tagManagerType: TagManagerType.Google,
        tagManagerConfigs: dummyTagManagerConfig,
      });

      expect(sut.Apm.name).toBe("none");
    });

    it("initialize with elastix adapter", async () => {
      const mockApmAdapter: IApmAdapter = createMock<IApmAdapter>();
      arrange(mockApmAdapter).stubProperty("name", () => "elastic");

      arrange(mockContainer).stubMethod(
        "buildAll",
        () => {
          return [mockApmAdapter];
        },
        [IApmAdapterType]
      );

      await sut.initialize("some", {
        apmServiceType: ApmType.Elastic,
        buildId: "buildId",
        environmentName: "envName",
        version: "appVersion",
        apmServiceName: "serviceName",
        tagManagerType: TagManagerType.Google,
        tagManagerConfigs: dummyTagManagerConfig,
      });

      expect(sut.Apm.name).toBe("elastic");
      expect(sut.Apm.initialize).toBeCalledTimes(1);
    });
  });
});

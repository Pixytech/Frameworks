import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { ApmType, GoogleTagAdapter, IAuthenticationService, ITagAdapter, TagManagerType } from "@kinetix/core";
import TagManager from "react-gtm-module";
import { array } from "prop-types";

const dummyTagManagerConfig = "eyJndG1fYXV0aCI6IllYVjBhQ0k2SWs1RVIiLCJndG1fcHJldmlldyI6ImVudi1UZXN0IiwiZ3RtSWQiOiJHVE0tMTIzNDU2In0=";

// Base Package
describe("Kinetix Core", () => {
  let sut: ITagAdapter;
  let mockAuthentication: IAuthenticationService;

  const dummyBuildManifest = {
    buildId: "test-buildId",
    version: "test-version",
    environmentName: "test-env",
    apmServiceName: "",
    apmServiceType: ApmType.None,
    tagManagerType: TagManagerType.Google,
    tagManagerConfigs: dummyTagManagerConfig,
  };

  beforeEach(async () => {
    mockAuthentication = createMock<IAuthenticationService>();
    sut = new GoogleTagAdapter(mockAuthentication);

    sut.initialize(TagManagerType.Google, dummyBuildManifest);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("GoogleTagAdapter", () => {
    it("should initialize GoogleTagAdapter", () => {
      expect(sut).not.toBeNull();
      expect(sut.name).toBe("google");
    });

    it("checking createEvent method", () => {
      const mockTagManagerModule = jest.spyOn(TagManager, "dataLayer");
      const mockEventName = "test:test";
      const mockEventData = {context:{ name: "test", time: new Date().toDateString() }};

      sut.createEvent(mockEventName, mockEventData);
      expect(mockTagManagerModule).toBeCalledWith({
        dataLayer: {
          event: mockEventName,
          ...mockEventData,
        },
      });
    });
  });
});

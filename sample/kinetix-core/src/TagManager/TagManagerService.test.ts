import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { ApmType, DefaultTagAdapter, IAuthenticationService, IContainer, ITagAdapter, ITagManagerService, TagManagerService, TagManagerType } from "@kinetix/core";
import {arrange} from '../../../../testing'
import { waitFor } from "@testing-library/react";

const dummyTagManagerConfig = "eyJndG1fYXV0aCI6IllYVjBhQ0k2SWs1RVIiLCJndG1fcHJldmlldyI6ImVudi1UZXN0IiwiZ3RtSWQiOiJHVE0tMTIzNDU2In0=";

// Base Package
describe("Kinetix Core", () => {
  let sut: ITagManagerService;
  let mockContainer: IContainer;
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
    mockContainer = createMock<IContainer>();
    mockAuthentication = createMock<IAuthenticationService>();
    sut = new TagManagerService(mockContainer, mockAuthentication);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("TagManagerService", () => {
    it("should initialize TagManagerService", async() => {
      const mockCreateEvent = jest.spyOn(sut.Tag, 'createEvent')   
      let adapter = createMock<ITagAdapter>(new DefaultTagAdapter(mockAuthentication))
      
      arrange(mockContainer).stubMethod('buildAll', () =>[adapter])
      
      sut.initialize(TagManagerType.Google, dummyBuildManifest);
      expect(sut).not.toBeNull()
      await waitFor(() =>{
        expect(mockCreateEvent).toBeCalled()
      })
    });
  });
});

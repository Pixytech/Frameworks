// reflect-metadata is required for IOC
import "reflect-metadata";

import { IDialogContext, IDialogService, IRestClient, ProfileType } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { ExternalAppLauncher } from "./ExternalAppLauncher";
import { arrange } from "../../../../../../testing";
import { of } from "rxjs";

// Base Package
describe("Kinetix Monza Shell", () => {
  // Scoped sut
  let sut: ExternalAppLauncher;
  let mockDialogService: IDialogService;
  let mockIRestClient: IRestClient;

  // Execute once before each tests
  // To create single sut for each tests
  beforeEach(() => {
    mockDialogService = createMock<IDialogService>();
    mockIRestClient = createMock<IRestClient>();
    sut = new ExternalAppLauncher(mockDialogService, mockIRestClient);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("ExternalAppLauncher", () => {
    it("should launch via custom protocol", async () => {
      arrange(window).stubProperty("location", () => createMock<Location>({hostname:"localhost"}));

      arrange(mockIRestClient).stubMethod("get", () => of({ code: "some", exists: true }));

      sut.setClickOnce({
        description: "test",
        displayName: "test",
        hidden: false,
        name: "profileName",
        roles: [],
        users:[],
        type: ProfileType.External,
        modules: ["/externalUrl"],
      });
      await sut.initialize();

      expect(sut.model.frameSrc).toBe(`kd://localhost/externalUrl&code=${sut.launchCode}`);
    });

    it("should download click once if custom protocol not launched", async () => {
      const mockLocation = createMock<Location>({ href: "initial" });
      arrange(window).stubProperty("location", () => mockLocation);
      sut.maxTimesCheck = 1;
      arrange(mockIRestClient).stubMethod("get", () => of({ code: "some", exists: false }));

      sut.setClickOnce({
        description: "test",
        displayName: "test",
        hidden: false,
        name: "profileName",
        roles: [],
        users:[],
        type: ProfileType.External,
        modules: ["/externalUrl"],
      });
      await sut.initialize();

      //expect(mockLocation.href).toBe("/externalUrl");
    });
    it("should Configure window size", async () => {
      const mockLocation = createMock<Location>({ href: "initial" });
      arrange(window).stubProperty("location", () => mockLocation);
      sut.maxTimesCheck = 1;
      const mockIDialogContext = createMock<IDialogContext>();
      sut.OnDialogCreated(mockIDialogContext);

      expect(mockIDialogContext.initialHeight).toBe(200);
      expect(mockIDialogContext.initialHeight).toBe(200);
    });
  });
});

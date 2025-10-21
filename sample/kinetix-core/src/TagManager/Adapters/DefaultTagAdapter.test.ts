import { DefaultTagAdapter } from "./DefaultTagAdapter";
import { IAuthenticationService } from "../../Auth";
import { createMock } from "ts-auto-mock";

describe("TagManager", () => {
  let defaultTagAdapter: DefaultTagAdapter;
  let mockAuthenticationService: IAuthenticationService;
  let mockProfile: any;

  beforeEach(() => {
    mockAuthenticationService = createMock<IAuthenticationService>();
    defaultTagAdapter = new DefaultTagAdapter(mockAuthenticationService);
    mockProfile = "profile1";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("DefaultTagAdapter", () => {
    it("should create an event with the correct data", () => {
      const consoleDebugSpy = jest.spyOn(console, "debug").mockImplementation();

      const eventName = "system.app-started";
      const eventData = {
        buildId: "build-123",
        version: "1.0.0",
        app: mockProfile,
        environmentName: "production",
      };

      defaultTagAdapter.createEvent(eventName, eventData);

      expect(consoleDebugSpy).toHaveBeenCalledWith(`Tag:${eventName}`, eventData);

      consoleDebugSpy.mockRestore();
    });
  });
});

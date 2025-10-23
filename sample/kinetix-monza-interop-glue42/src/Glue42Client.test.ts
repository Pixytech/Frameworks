import "reflect-metadata";
import { Glue42Client } from "./Glue42Client";
import { IAuthenticationService, IContainer, INotificationServiceType, IntentContext, ObjectLifecycle } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { arrange } from "../../../testing";
import { GlueNotificationService } from "./GlueNotificationService";
import { Glue42 } from "@glue42/desktop";
import * as glueDesktop from "@glue42/desktop";

jest.mock("@glue42/desktop");
describe("Kinetix Trading Interop Glue42", () => {
  describe("Glue42Client", () => {
    let sut: Glue42Client;
    let mockAuthService: IAuthenticationService;
    let mockContainer: IContainer;
    let mockGlue: Glue42.Glue;

    beforeEach(async () => {
      mockAuthService = createMock<IAuthenticationService>();
      mockContainer = createMock<IContainer>();
      mockGlue = createMock<Glue42.Glue>({
        intents: createMock<Glue42.Intents.API>(),
        windows: createMock<Glue42.Windows.API>(),
      });

      jest.spyOn(glueDesktop, "default").mockImplementation((options) => Promise.resolve(mockGlue));

      sut = new Glue42Client(mockAuthService, mockContainer);
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should be initilized without glue", async () => {
      arrange(mockGlue).stubProperty("info", () => {
        return undefined as unknown as object;
      });
      expect(await sut.initialize()).toBe(false);
    });

    it("should be initilized with glue", async () => {
      arrange(mockGlue).stubProperty("info", () => {
        return {};
      });

      expect(await sut.initialize()).toBe(true);
      expect(mockContainer.deregister).toBeCalledWith(INotificationServiceType);
      expect(mockContainer.register).toBeCalledWith(INotificationServiceType, GlueNotificationService, ObjectLifecycle.Singleton);
    });

    it("should return platform name", async () => {
      sut.isPlatformInstalled = true;
      expect(sut.PlatformMessage).toBe("Use Glue42 launcher");
      sut.isPlatformInstalled = false;
      expect(sut.PlatformMessage).toBe("Use Glue42 launcher");
    });

    it("should launchPlatform", async () => {
      arrange(window).stubMethod("open", () => {});
      await sut.launchPlatform();
      expect(window.open).toBeCalled();
    });

    it("should install Platfrom", async () => {
      arrange(window).stubMethod("open", () => {});
      await sut.installPlatform();
      expect(window.open).toBeCalled();
    });

    it("should raise intent", async () => {
      arrange(mockGlue).stubProperty("info", () => {
        return {};
      });
      expect(await sut.initialize()).toBe(true);

      const intent = createMock<IntentContext>({
        data: { some: "some" },
      });

      arrange(mockAuthService).stubMethod("GetParsedToken", () => {
        return {
          preferred_username: "TEST-USER",
        };
      });
      await sut.raiseIntent("TEST-INTENT", intent);

      expect(mockGlue.intents.raise).toBeCalled();
    });

    it("should registerIntentHandler", async () => {
      arrange(mockGlue).stubProperty("info", () => {
        return {};
      });

      const intentRegisterSubscription = {
        unsubscribe: jest.fn(),
      };

      let registerdHandler: ((context: IntentContext) => any) | undefined = undefined;

      arrange(mockGlue.intents).stubMethod("addIntentListener", (intent, handler) => {
        registerdHandler = handler;
        return intentRegisterSubscription;
      });

      const handler: (name: string, context: IntentContext) => Promise<void> = (name: string, context: IntentContext) => Promise.resolve();

      expect(await sut.initialize()).toBe(true);
      const subscription = await sut.registerIntentHandler("TEST-INTENT", handler);

      expect(mockGlue.intents.addIntentListener).toBeCalled();

      subscription.dispose();

      expect(intentRegisterSubscription.unsubscribe).toBeCalled();

      if (registerdHandler) {
        const handler = registerdHandler as (context: IntentContext) => any;

        handler({
          name: "TEST-INTENT",
          data: { "test-id": "data" },
          type: "test-type",
        });
      }
    });

    it("should update window", async () => {
      arrange(mockGlue).stubProperty("info", () => {
        return {};
      });

      const mockWindow = {
        resizeTo: jest.fn(),
        center: jest.fn(),
      };

      arrange(mockGlue.windows).stubMethod("my", () => mockWindow);

      expect(await sut.initialize()).toBe(true);

      await sut.updateHost({ title: "TEST-TITLE", initialHeight: 100, initialWidth: 200 });

      expect(document.title).toBe("TEST-TITLE");
      expect(mockWindow.resizeTo).toBeCalledWith(200, 100);
      expect(mockWindow.center).toBeCalled();
    });

    it("should update window action", async () => {
      arrange(mockGlue).stubProperty("info", () => {
        return {};
      });

      const mockWindow = {
        resizeTo: jest.fn(),
        center: jest.fn(),
        close: jest.fn(),
        minimize: jest.fn(),
        restore: jest.fn(),
        maximize: jest.fn(),
        state: "",
      };

      arrange(mockGlue.windows).stubMethod("my", () => mockWindow);

      expect(await sut.initialize()).toBe(true);

      await sut.updateHost({ windowAction: "CLOSE" });
      expect(mockWindow.close).toBeCalled();

      await sut.updateHost({ windowAction: "MINIMIZE" });
      expect(mockWindow.minimize).toBeCalled();

      arrange(mockWindow).stubProperty("state", () => "maximized");
      await sut.updateHost({ windowAction: "RESTORE" });
      expect(mockWindow.restore).toBeCalled();

      arrange(mockWindow).stubProperty("state", () => "normal");
      await sut.updateHost({ windowAction: "RESTORE" });
      expect(mockWindow.maximize).toBeCalled();
    });
  });
});

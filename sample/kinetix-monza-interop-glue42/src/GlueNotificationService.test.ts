import "reflect-metadata";
import { ApplicationModel, IApplication, IApplicationCache, IConfigurationService, IEventAggregator, INotificationFilter, INotificationStream, NotificationSeverity } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { GlueNotificationService } from "./GlueNotificationService";
import { createMockEventAggregator, arrange } from "../../../testing";

import { Glue42 } from "@glue42/desktop";
import * as glueDesktop from "@glue42/desktop";

jest.mock("@glue42/desktop");

describe("Kinetix Trading Interop Glue42", () => {
  describe("GlueNotificationService", () => {
    let sut: GlueNotificationService;
    let mockEventAggregator: IEventAggregator;
    let mockApplication: IApplication;
    let mockGlue: Glue42.Glue;
    let mockConfigurationService: IConfigurationService;
    let mockNotificationFilter: INotificationFilter;
    beforeEach(async () => {
      mockGlue = createMock<Glue42.Glue>({
        intents: createMock<Glue42.Intents.API>(),
        windows: createMock<Glue42.Windows.API>(),
        notifications: createMock<Glue42.Notifications.API>(),
      });
      jest.spyOn(glueDesktop, "default").mockImplementation((options) => Promise.resolve(mockGlue));
      arrange(mockGlue).stubProperty("info", () => {
        return {};
      });
      arrange(mockGlue.notifications).stubProperty("panel", () => {
        return createMock<Glue42.Notifications.NotificationPanelAPI>();
      });

      mockEventAggregator = createMockEventAggregator();
      mockConfigurationService = createMock<IConfigurationService>();
      mockApplication = createMock<IApplication>({ model: new ApplicationModel() });
      mockNotificationFilter = createMock<INotificationFilter>();
      sut = new GlueNotificationService(mockEventAggregator, mockApplication, mockNotificationFilter);
      arrange(mockNotificationFilter).stubMethod("canNotify", () => true);
      await sut.initialize();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("init should load", async () => {
      expect(mockNotificationFilter.initialize).toBeCalled();
      expect(sut.model.isLoaded).toBe(true);
    });

    it("get applicationId", async () => {
      arrange(mockApplication).stubProperty("cache", () => createMock<IApplicationCache>({appState: {"app.name": "test"}}));
      
      expect(sut.getApplicationId()).toBe("test");
    });

    it("clear all notifications", async () => {
      await sut.clearAll();
      expect(mockGlue.notifications.clearAll).toBeCalled();
    });

    it("show notification center", async () => {
      await sut.show();
      expect(mockGlue.notifications.panel.show).toBeCalled();
    });

    it("hide notification center", async () => {
      await sut.hide();
      expect(mockGlue.notifications.panel.hide).toBeCalled();
    });

    it("update notification", async () => {
      await sut.hide();
      expect(mockGlue.notifications.panel.hide).toBeCalled();
    });

    it("clear notification", async () => {
      await sut.clear("someID");
      expect(mockGlue.notifications.clear).toBeCalledWith("someID");
    });

    it("raise notification", async () => {
      const reminderDate = new Date();
      reminderDate.setMilliseconds(reminderDate.getMilliseconds() + 10);

      const notification = await sut.raise(
        {
          title: "Some title",
        },
        { reminderDate: reminderDate }
      );

      expect(mockGlue.notifications.raise).toBeCalled();
    });

    it("should not raise notification for disabled category", async () => {
      arrange(mockNotificationFilter).stubMethod("canNotify", () => false);
      const reminderDate = new Date();
      reminderDate.setMilliseconds(reminderDate.getMilliseconds() + 10);

      const notification = await sut.raise(
        {
          title: "Some title",
        },
        { reminderDate: reminderDate }
      );

      expect(notification).toBe(null);
      expect(mockGlue.notifications.raise).not.toBeCalled();
    });

    it("update notification", async () => {
      const reminderDate = new Date();
      reminderDate.setMilliseconds(reminderDate.getMilliseconds() + 10);

      /* (update as jest.Mock).mockImplementation(() => createMock<Notification>({ id: "test" }));

      const notification = await sut.update("test-id", {
        title: "Some title",
      });
      expect(update).toBeCalled(); */
    });

    it("get notification", async () => {
      const reminderDate = new Date();
      reminderDate.setMilliseconds(reminderDate.getMilliseconds() + 10);

      arrange(mockGlue.notifications).stubMethod("list", () => Promise.resolve([createMock<Glue42.Notifications.NotificationData>(), createMock<Glue42.Notifications.NotificationData>()]));

      const notification = await sut.getNotifications();
      expect(mockGlue.notifications.list).toBeCalled();
      expect(notification.length).toBe(2);
    });

    it("Should register streams", async () => {
      sut.registerStream(createMock<INotificationStream>({ application: "app1" }));
      sut.registerStream(createMock<INotificationStream>({ application: "app2" }));
      expect((await sut.getStreams()).length).toBe(2);
    });

    it("Should map NotificationSeverity", async () => {
      expect(sut.toKinetixSeverity("Low")).toBe(NotificationSeverity.Low);
      expect(sut.toKinetixSeverity("Medium")).toBe(NotificationSeverity.Medium);
      expect(sut.toKinetixSeverity("High")).toBe(NotificationSeverity.High);
      expect(sut.toKinetixSeverity("Critical")).toBe(NotificationSeverity.Critical);

      expect(sut.toGlueSeverity(NotificationSeverity.Low)).toBe("Low");
      expect(sut.toGlueSeverity(NotificationSeverity.Medium)).toBe("Medium");
      expect(sut.toGlueSeverity(NotificationSeverity.High)).toBe("High");
      expect(sut.toGlueSeverity(NotificationSeverity.Critical)).toBe("Critical");
    });
  });
});

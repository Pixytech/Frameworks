// reflect-metadata is required for IOC
import "reflect-metadata";
import { NotificationService } from "./NotificationService";

import { arrange, createMockEventAggregator, delay } from "../../../../../testing";
import { waitFor } from "@testing-library/react";
import { IEventAggregator } from "../../Messaging";
import { NotificationActionTrigger } from "./NotificationActionTrigger";
import { NotificationEvent } from "./NotificationEvent";
import { NotificationSeverity } from "./NotificationSeverity";
import { NotificationToast } from "./NotificationToast";
import { createMock } from "ts-auto-mock";

import { INotification, INotificationOption } from "./INotificationOption";
import { INotificationStream } from "./INotificationStream";
import { ApplicationModel, IApplication } from "../../IApplication";
import { IConfigurationService } from "../../Configuration";
import { INotificationSettings } from "../NavigationService";
import { NotificationFilter } from "./INotificationFilter";
import { IContainer } from "../../IoC";
import { IRestClient, IRestClientType } from "../../Web";
import { of } from "rxjs";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: NotificationService;
  let mockEventAggregator: IEventAggregator;
  let mockApplication: IApplication;
  let mockConfigurationService: IConfigurationService;
  let mockNotificationSettings: INotificationSettings;
  let mockContainer: IContainer;
  let mockRestApi: IRestClient;
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    mockEventAggregator = createMockEventAggregator();
    mockApplication = createMock<IApplication>({ model: new ApplicationModel() });
    mockConfigurationService = createMock<IConfigurationService>();
    mockContainer = createMock<IContainer>();
    mockRestApi = createMock<IRestClient>();

    sut = new NotificationService(mockEventAggregator, mockApplication, new NotificationFilter(mockConfigurationService), mockContainer);
    mockNotificationSettings = {
      categoryFilter: [],
    };
    arrange(mockConfigurationService).stubMethod("getConfiguration", (request) => {
      return {
        ...request,
        value: mockNotificationSettings,
      };
    });
    arrange(mockContainer).stubMethod("build", () => mockRestApi, [IRestClientType]);
    arrange(mockRestApi).stubMethod("get", () => of([
        { title: "title 1", body: "test 1" },
        { title: "title 2", body: "test 2", timestamp: "2024-05-10 10:10:10" }
      ]
    ) );

    await sut.initialize();
  });

  describe("NotificationService", () => {
    it("Should create new notification with default options", async () => {
      await sut.clearAll();

      const notification = await sut.raise({
        title: "Some title",
      });

      expect((await sut.getNotifications()).length).toBe(1);
      expect(notification?.id).toBeDefined();
      expect(notification?.toast).toBe(NotificationToast.None);
      expect(notification?.severity).toBe(NotificationSeverity.Low);
      expect(notification?.indicator).toBe(null);
    });

    it("Should not create disabled notification", async () => {
      await sut.clearAll();

      mockNotificationSettings.categoryFilter.push({
        category: "catDisabled",
        enabled: false,
      });

      const notification = await sut.raise({
        title: "Some title",
        stream: {
          category: "catDisabled",
          type: "Custom",
          application: "app",
        },
      });

      expect((await sut.getNotifications()).length).toBe(0);
      expect(notification).toBe(null);
    });

    it("Should create future notification", async () => {
      await sut.clearAll();

      const reminderDate = new Date();
      reminderDate.setMilliseconds(reminderDate.getMilliseconds() + 10);
      const notification = await sut.raise(
        {
          title: "Some title",
        },
        { reminderDate: reminderDate }
      );

      expect((await sut.getNotifications()).length).toBe(0);
      expect(notification?.id).toBeDefined();

      await waitFor(async () => {
        const notifications = await sut.getNotifications();
        expect(notifications.length).toBe(1);
      }, {});
    });

    it("action data selection should return right data", async () => {
      const notification = createMock<INotification<INotificationOption>>({
        onExpire: { action: "expire" },
        onClose: { action: "close" },
        onSelect: { action: "select" },
      });

      let result = sut.getActionData(NotificationActionTrigger.Close, notification, { action: "button" });

      expect(result?.action).toBe("close");

      result = sut.getActionData(NotificationActionTrigger.Expire, notification, { action: "button" });

      expect(result?.action).toBe("expire");

      result = sut.getActionData(NotificationActionTrigger.Select, notification, { action: "button" });

      expect(result?.action).toBe("select");

      result = sut.getActionData(NotificationActionTrigger.Control, notification, { action: "button" });

      expect(result?.action).toBe("button");

      result = sut.getActionData(NotificationActionTrigger.Manual, notification, { action: "button" });

      expect(result).toBe(null);
    });

    it("action data selection should return null", async () => {
      const notification = createMock<INotification<INotificationOption>>({});

      let result = sut.getActionData(NotificationActionTrigger.Close, notification, { action: "button" });

      expect(result).toBe(null);

      result = sut.getActionData(NotificationActionTrigger.Expire, notification, { action: "button" });

      expect(result).toBe(null);

      result = sut.getActionData(NotificationActionTrigger.Select, notification, { action: "button" });

      expect(result).toBe(null);

      result = sut.getActionData(NotificationActionTrigger.Control, notification, undefined);

      expect(result).toBe(null);

      result = sut.getActionData(NotificationActionTrigger.Manual, notification, { action: "button" });

      expect(result).toBe(null);
    });

    it("Should remove toaster notifications", async () => {
      await sut.clearAll();

      const expiryDate = new Date();
      expiryDate.setMilliseconds(expiryDate.getMilliseconds() + 10);
      const expiredData = { expiredTest: "OK" };
      const notification = await sut.raise({
        title: "Some title",
        toast: NotificationToast.Transient,
        expires: expiryDate,
        onExpire: expiredData,
      });

      const stickyNotification = await sut.raise({
        title: "Some title",
        toast: NotificationToast.Sticky,
      });

      expect((await sut.getNotifications()).length).toBe(2);
      expect(notification?.id).toBeDefined();
      expect(notification?.toast).toBe(NotificationToast.Transient);
      expect(notification?.severity).toBe(NotificationSeverity.Low);
      await delay(15);
      await waitFor(async () => {
        const notification = await sut.getNotifications();
        expect(notification.length).toBe(1);
        expect(mockEventAggregator.getEvent<NotificationEvent>(NotificationEvent, NotificationEvent.Type).publish).toBeCalledWith(
          expect.objectContaining({
            actionTrigger: NotificationActionTrigger.Expire,
            actionData: expiredData,
          })
        );
      });
    });

    it("Should close notifications", async () => {
      await sut.clearAll();

      const closeData = { expiredTest: "OK" };
      const notification = await sut.raise({
        title: "Some title",
        toast: NotificationToast.Sticky,
        onClose: closeData,
      });

      expect((await sut.getNotifications()).length).toBe(1);
      expect(notification?.id).toBeDefined();
      expect(notification?.toast).toBe(NotificationToast.Sticky);
      expect(notification?.severity).toBe(NotificationSeverity.Low);

      if (notification) {
        await sut.clear(notification.id);
      }

      await waitFor(async () => {
        expect((await sut.getNotifications()).length).toBe(0);
        expect(mockEventAggregator.getEvent<NotificationEvent>(NotificationEvent, NotificationEvent.Type).publish).toBeCalledWith(
          expect.objectContaining({
            actionTrigger: NotificationActionTrigger.Manual,
            actionData: null,
          })
        );
      });
    });

    it("Should close command notifications", async () => {
      await sut.clearAll();

      const closeData = { expiredTest: "OK" };
      const notification = await sut.raise({
        title: "Some title",
        toast: NotificationToast.Sticky,
      });

      expect((await sut.getNotifications()).length).toBe(1);
      expect(notification?.id).toBeDefined();
      expect(notification?.toast).toBe(NotificationToast.Sticky);
      expect(notification?.severity).toBe(NotificationSeverity.Low);

      if (notification) {
        await sut.onCommandClick(notification, closeData);
      }

      await waitFor(async () => {
        expect((await sut.getNotifications()).length).toBe(0);
        expect(mockEventAggregator.getEvent<NotificationEvent>(NotificationEvent, NotificationEvent.Type).publish).toBeCalledWith(
          expect.objectContaining({
            actionTrigger: NotificationActionTrigger.Control,
            actionData: closeData,
          })
        );
      });
    });

    it("Should clear notifications", async () => {
      await sut.clearAll();
      
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + 1);
      const closeData = { expiredTest: "OK" };
      const notification = await sut.raise({
        title: "Some title",
        toast: NotificationToast.Sticky,
        onClose: closeData,
      });

      expect((await sut.getNotifications()).length).toBe(1);
      expect(notification?.id).toBeDefined();
      expect(notification?.toast).toBe(NotificationToast.Sticky);
      expect(notification?.severity).toBe(NotificationSeverity.Low);

      await sut.clearAll();

      await waitFor(async () => {
        expect((await sut.getNotifications()).length).toBe(0);
      });
    });

    it("Should hide notification panel", async () => {
      sut.model.panelHidden = false;
      await sut.hide();
      expect(sut.model.panelHidden).toBe(true);
      expect(sut.isPanelVisible).toBe(false);
    });

    it("Should show notification panel", async () => {
      sut.model.panelHidden = true;
      sut.show();
      expect(sut.model.panelHidden).toBe(false);
      expect(sut.isPanelVisible).toBe(true);
    });

    it("Should autohide notification panel", async () => {
      sut.setAutoHide(true);
      expect(sut.model.autoHide).toBe(true);
    });

    it("Should update notifications", async () => {
      await sut.clearAll();
      const notification = await sut.raise({
        title: "Some title",
      });

      expect((await sut.getNotifications()).length).toBe(1);
      expect(notification?.id).toBeDefined();
      expect(notification?.title).toBe("Some title");
      expect(notification?.toast).toBe(NotificationToast.None);
      expect(notification?.severity).toBe(NotificationSeverity.Low);
      if (notification) {
        const updatedNotification = await sut.update(notification.id, { title: "TEST" });
        if (updatedNotification) {
          expect(updatedNotification.title).toBe("TEST");
        }
      }

      const invalidNotification = await sut.update("SomeRandom", { title: "TEST" });
      expect(invalidNotification).toBe(undefined);
    });

    it("Should register streams", async () => {
      sut.registerStream(createMock<INotificationStream>({ application: "app1" }));
      sut.registerStream(createMock<INotificationStream>({ application: "app2" }));

      expect((await sut.getStreams()).length).toBe(2);
    });
  });
});

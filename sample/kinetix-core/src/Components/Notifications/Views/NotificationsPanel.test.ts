// reflect-metadata is required for IOC
import "reflect-metadata";

import { createMockEventAggregator, delay } from "../../../../../../testing";
import { waitFor } from "@testing-library/react";
import { IEventAggregator } from "../../../Messaging";
import { createMock } from "ts-auto-mock";
import { NotificationsPanel } from "./NotificationsPanel";
import { INotificationService } from "../INotificationService";
import { NotificationModel } from "../NotificationModel";
import { INotification, INotificationOption } from "../INotificationOption";
import { Subject } from "rxjs";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: NotificationsPanel;
  let mockNotificationService: INotificationService;
  let notificationModelsubject: Subject<NotificationModel>;
  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    notificationModelsubject = new Subject<NotificationModel>();
    mockNotificationService = createMock<INotificationService>({ model: new NotificationModel(), onModelChanged: notificationModelsubject });
    sut = new NotificationsPanel(mockNotificationService);
  });

  describe("NotificationsPanel", () => {
    it("Should build notifications on model change", async () => {
      mockNotificationService.model.notifications = {
        key1: createMock<INotification<INotificationOption>>({
          id: "key1",
          timestamp: new Date(),
        }),
        key2: createMock<INotification<INotificationOption>>({
          id: "key2",
          timestamp: new Date(),
        }),
      };

      await sut.initialize();

      mockNotificationService.model.notifications = {
        key1: createMock<INotification<INotificationOption>>({
          id: "key1",
          timestamp: new Date(),
        }),
      };

      notificationModelsubject.next(mockNotificationService.model);

      expect(sut.model.allNotifications.length).toBe(1);
    });

    it("Should clear notifications", async () => {
      sut.clearNotifications([
        createMock<INotification<INotificationOption>>({
          id: "key1",
          timestamp: new Date(),
        }),
        createMock<INotification<INotificationOption>>({
          id: "key2",
          timestamp: new Date(),
        }),
      ]);

      expect(mockNotificationService.clear).toBeCalledTimes(2);
      expect(mockNotificationService.notifyModelChanged).toBeCalled();
    });

    it("Should clear notifications", async () => {
      sut.onCommandClick(
        createMock<INotification<INotificationOption>>({
          id: "key1",
          timestamp: new Date(),
        }),
        {}
      );
      expect(mockNotificationService.onCommandClick).toBeCalledTimes(1);
    });
  });
});

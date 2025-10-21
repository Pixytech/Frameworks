// reflect-metadata is required for IOC
import "reflect-metadata";

import { createMock } from "ts-auto-mock";
import { INotification, INotificationOption } from "../INotificationOption";
import { NotificationsPanelItem } from "./NotificationPanelItem";
import { INotificationsPanel } from "./INotificationsPanel";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: NotificationsPanelItem;
  let mockNotificationsPanel: INotificationsPanel;

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(() => {
    mockNotificationsPanel = createMock<INotificationsPanel>();
    sut = new NotificationsPanelItem(createMock<Required<INotificationOption>>({ timestamp: new Date() }), mockNotificationsPanel);
  });

  describe("NotificationPanelItem", () => {
    it("Should clear notifications", async () => {
      await sut.onCommandClick(
        createMock<INotification<INotificationOption>>({
          id: "key1",
        })
      );
      expect(mockNotificationsPanel.onCommandClick).toBeCalledTimes(1);
    });

    it("Should close notifications", async () => {
      await sut.close();
      expect(mockNotificationsPanel.clearNotifications).toBeCalledTimes(1);
    });

    it("Should toggleHover notifications", async () => {
      sut.toggleHover(true);
      expect(sut.model.isHovered).toBe(true);

      sut.toggleHover(false);
      expect(sut.model.isHovered).toBe(false);
    });

    it("Should get time", async () => {
      let result = sut.getTime();
      expect(result).toBe("now");

      sut.notification.timestamp.setMinutes(sut.notification.timestamp.getMinutes() - 10);
      result = sut.getTime();
      expect(result).toContain("min ago");

      sut.notification.timestamp.setHours(sut.notification.timestamp.getHours() - 2);
      result = sut.getTime();
      expect(result).not.toContain("min");
    });

    it("Should get date", async () => {
      let result = sut.getDateText();
      expect(result).toBe("Today");

      sut.notification.timestamp.setDate(sut.notification.timestamp.getDate() - 1);
      result = sut.getDateText();
      expect(result).toContain("Yesterday");

      sut.notification.timestamp.setDate(sut.notification.timestamp.getDate() - 2);
      result = sut.getDateText();
      expect(result).toContain("Last");

      sut.notification.timestamp.setDate(sut.notification.timestamp.getDate() - 8);
      result = sut.getDateText();
      expect(result).not.toContain("Last");
    });
  });
});

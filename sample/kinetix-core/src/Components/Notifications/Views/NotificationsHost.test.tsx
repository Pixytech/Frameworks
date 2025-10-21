// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Button } from "@progress/kendo-react-buttons";
import { arrange, hostComponent } from "../../../../../../testing";
import { NotificationsHost } from "./NotificationsHost";
import { INotificationService, INotificationServiceType } from "../INotificationService";
import { IContainer } from "../../../IoC";
import { createMock, createMockList } from "ts-auto-mock";
import { NotificationModel } from "../NotificationModel";
import { INotificationOption } from "../INotificationOption";
import { INotificationButton } from "../INotificationButton";
import { NotificationSeverity } from "../NotificationSeverity";
import { IndicatorColor } from "../INotificationIndicator";
import { NotificationToast } from "../NotificationToast";
import { IViewResolver } from "../../../Mvvm";
import { CoreTypes } from "../../../CoreTypes";
import { GroupedNotifications, INotificationsPanel, INotificationsPanelType, NotificationsPanelModel } from "./INotificationsPanel";
import { NotificationsPanelView } from "./NotificationsPanelView";
import { INotificationsPanelItem } from "./INotificationsPanelItem";
import { NotificationsPanelItem } from "./NotificationPanelItem";
import { groupBy } from "../../../Utils/groupBy";
import { NotificationsBadge } from "./NotificationsBadge";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let mockNotificationService: INotificationService;
  let mockContainer: IContainer;
  let mockNotificationPanel: INotificationsPanel;
  beforeEach(() => {
    mockNotificationService = createMock<INotificationService>({ model: new NotificationModel() });
    mockNotificationService.model.isLoaded = true;
    mockNotificationPanel = createMock<INotificationsPanel>({ model: new NotificationsPanelModel() });
    mockContainer = createMock<IContainer>();
    mockNotificationService.model.notifications = {
      key1: createMock<Required<INotificationOption>>({
        id: "key1",
        title: "test-title1",
        body: "test-body1",
        icon: "test-icon1",
        severity: NotificationSeverity.Critical,
        indicator: { text: "test-indicator1", color: IndicatorColor.Red },
        toast: NotificationToast.Sticky,
        timestamp: new Date(),
        stream: {
          application: "test-application",
          category: "test-category",
          type: "Custom",
        },
      }),
      key2: createMock<Required<INotificationOption>>({
        id: "key2",
        title: "test-title2",
        body: "test-body2",
        icon: "test-icon2",
        severity: NotificationSeverity.Critical,
        indicator: { text: "test-indicator2", color: IndicatorColor.Red },
        toast: NotificationToast.Transient,
        timestamp: new Date(),
        stream: {
          application: "test-application",
          category: "test-category",
          type: "Custom",
        },
      }),
    };

    const result: INotificationsPanelItem[] = [];
    Object.keys(mockNotificationService.model.notifications).forEach((key) => {
      const item = mockNotificationService.model.notifications[key];
      const panelItem = new NotificationsPanelItem(item, mockNotificationPanel);
      result.push(panelItem);
    });

    const groupedResult: GroupedNotifications[] = [];
    const groupedData = groupBy(result, (item) => item.getDateText());

    Object.keys(groupedData).forEach((key) => {
      const item = groupedData[`${key}`];
      groupedResult.push({ key: `${key}`, notifications: item });
    });

    mockNotificationPanel.model.groupNotifications = groupedResult;
    mockNotificationPanel.model.allNotifications = result;

    const mockViewResolved = createMock<IViewResolver>();

    arrange(mockViewResolved).stubMethod("renderToken", () => <NotificationsPanelView dataContext={mockNotificationPanel} />);
    arrange(mockContainer).stubMethod("build", () => mockViewResolved, [CoreTypes.IViewResolver]);
    arrange(mockContainer).stubMethod("build", () => mockNotificationPanel, [INotificationsPanelType]);
    arrange(mockContainer).stubMethod("build", () => mockNotificationService, [INotificationServiceType]);
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Testing Component
  describe("Frame", () => {
    it("show notifications", async () => {
      arrange(mockNotificationService).stubProperty("allowNotifications", () => true);
      arrange(mockNotificationService).stubProperty("isPanelVisible", () => true);
      let sut = hostComponent(<NotificationsHost dataContext={mockNotificationService} />, mockContainer);
      const view = render(sut);
      expect(screen.getByText("Notifications")).toBeInTheDocument();
      expect(screen.getAllByText("test-title2").length).toBeGreaterThan(0);
    });

    it("show toaster notifications", async () => {
      arrange(mockNotificationService).stubProperty("allowNotifications", () => true);
      arrange(mockNotificationService).stubProperty("isPanelVisible", () => false);
      let sut = hostComponent(
        <div
          style={{
            display: "flex",
            flex: 1,
            position: "relative",
            height: "100%",
            width: "100%",
          }}
        >
          <NotificationsHost dataContext={mockNotificationService} />
        </div>,
        mockContainer
      );
      const view = render(sut);
      expect(screen.getAllByText("test-title2").length).toBeGreaterThan(0);
    });

    it("clear all notifications", async () => {
      arrange(mockNotificationService).stubProperty("allowNotifications", () => true);
      arrange(mockNotificationService).stubProperty("isPanelVisible", () => true);
      let sut = hostComponent(<NotificationsHost dataContext={mockNotificationService} />, mockContainer);
      const view = render(sut);
      fireEvent.click(screen.getByText("Clear all"));
      expect(mockNotificationService.clearAll).toBeCalled();
    });

    it("clear grouped notifications", async () => {
      arrange(mockNotificationService).stubProperty("allowNotifications", () => true);
      arrange(mockNotificationService).stubProperty("isPanelVisible", () => true);

      let sut = hostComponent(<NotificationsHost dataContext={mockNotificationService} />, mockContainer);
      const view = render(sut);
      fireEvent.click(screen.getAllByText("Clear")[0]);
      expect(mockNotificationPanel.clearNotifications).toBeCalled();
    });

    it("close single notification", async () => {
      arrange(mockNotificationService).stubProperty("allowNotifications", () => true);
      arrange(mockNotificationService).stubProperty("isPanelVisible", () => true);
      mockNotificationPanel.model.allNotifications[0].model.isHovered = true;
      let sut = hostComponent(<NotificationsHost dataContext={mockNotificationService} />, mockContainer);
      const view = render(sut);
      fireEvent.click(screen.getByTestId("closeButton"));
      expect(mockNotificationPanel.clearNotifications).toBeCalled();
    });

    it("hide notification", async () => {
      arrange(mockNotificationService).stubProperty("allowNotifications", () => true);
      arrange(mockNotificationService).stubProperty("isPanelVisible", () => true);

      let sut = hostComponent(<NotificationsHost dataContext={mockNotificationService} />, mockContainer);
      const view = render(sut);
      fireEvent.click(screen.getByTestId("hideButton"));
      expect(mockNotificationService.hide).toBeCalled();
    });

    it("show notifications from badge", async () => {
      arrange(mockNotificationService).stubProperty("allowNotifications", () => true);
      arrange(mockNotificationService).stubProperty("isPanelVisible", () => false);

      let sut = hostComponent(<NotificationsBadge />, mockContainer);
      const view = render(sut);
      fireEvent.click(screen.getByTestId("toggleButton"));
      expect(mockNotificationService.show).toBeCalled();
    });

    it("hide notifications from badge", async () => {
      arrange(mockNotificationService).stubProperty("allowNotifications", () => true);
      arrange(mockNotificationService).stubProperty("isPanelVisible", () => true);

      let sut = hostComponent(<NotificationsBadge />, mockContainer);
      const view = render(sut);
      fireEvent.click(screen.getByTestId("toggleButton"));
      expect(mockNotificationService.hide).toBeCalled();
    });
  });
});

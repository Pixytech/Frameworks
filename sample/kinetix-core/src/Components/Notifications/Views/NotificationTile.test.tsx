// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { arrange, hostComponent } from "../../../../../../testing";

import { Button } from "@progress/kendo-react-buttons";
import { NotificationTile } from "./NotificationTile";
import { INotificationsPanelItem, NotificationsPanelItemModel } from "./INotificationsPanelItem";
import { createMock } from "ts-auto-mock";
import { IndicatorColor } from "../INotificationIndicator";
import { INotification, INotificationOption } from "../INotificationOption";
import { INotificationButton } from "../INotificationButton";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module

  let mockDataContext: INotificationsPanelItem;
  beforeEach(() => {
    mockDataContext = createMock<INotificationsPanelItem>();
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Testing Component
  describe("NotificationTile", () => {
    it("NotificationTile should render", async () => {
      mockDataContext = createMock<INotificationsPanelItem>({
        notification: createMock<INotification<INotificationOption>>({
          indicator: {
            color: IndicatorColor.Green,
            text: "INDICATOR-TEST",
          },
          icon: "ICON-TEST",
          title: "TITLE-TEST",
          body: "BODY-TEST",
          stream: {
            application: "APPLICATION-TEST",
            category: "CATEGORY-TEST",
            type: "Custom",
          },
          actions: [
            {
              icon: "ACTION-ICON-TEST",
              onClick: { data: "some" },
              text: "ACTION-TEST",
              theme: "error",
            },
          ],
        }),
        model: new NotificationsPanelItemModel(),
      });

      let sut = hostComponent(<NotificationTile dataContext={mockDataContext} />);
      const view = render(sut);

      expect(screen.getByText("INDICATOR-TEST")).toBeInTheDocument();
      expect(screen.getByText("APPLICATION-TEST (CATEGORY-TEST)")).toBeInTheDocument();
      expect(screen.getByText("ACTION-TEST")).toBeInTheDocument();
      expect(screen.getByText("BODY-TEST")).toBeInTheDocument();

      //screen.debug();
    });

    it("NotificationTile should render title without stream", async () => {
      mockDataContext = createMock<INotificationsPanelItem>({
        notification: createMock<INotification<INotificationOption>>({
          indicator: {
            color: IndicatorColor.Green,
            text: "INDICATOR-TEST",
          },
          title: "TITLE-TEST",
          body: "BODY-TEST",
          actions: [
            {
              icon: "ACTION-ICON-TEST",
              onClick: { data: "some" },
              text: "ACTION-TEST",
              theme: "error",
            },
          ],
        }),
        model: new NotificationsPanelItemModel(),
      });

      let sut = hostComponent(<NotificationTile dataContext={mockDataContext} />);
      const view = render(sut);

      expect(screen.getByText("INDICATOR-TEST")).toBeInTheDocument();
      expect(screen.getByText("ACTION-TEST")).toBeInTheDocument();
      expect(screen.getByText("BODY-TEST")).toBeInTheDocument();
      //screen.debug();
    });

    it("NotificationTile should render on hover", async () => {
      mockDataContext = createMock<INotificationsPanelItem>({
        notification: createMock<INotification<INotificationOption>>({
          allowReminder: true,
          indicator: {
            color: IndicatorColor.Green,
            text: "INDICATOR-TEST",
          },
          title: "TITLE-TEST",
          body: "BODY-TEST",
          actions: [
            {
              icon: "ACTION-ICON-TEST",
              onClick: { data: "some" },
              text: "ACTION-TEST",
              theme: "error",
            },
          ],
        }),
        model: new NotificationsPanelItemModel(),
      });

      mockDataContext.model.isHovered = true;

      let sut = hostComponent(<NotificationTile dataContext={mockDataContext} />);
      const view = render(sut);

      expect(screen.getByText("INDICATOR-TEST")).toBeInTheDocument();
      expect(screen.getByText("ACTION-TEST")).toBeInTheDocument();
      expect(screen.getByText("BODY-TEST")).toBeInTheDocument();
      //screen.debug();
    });
  });
});

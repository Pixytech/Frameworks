import "reflect-metadata";
import React from "react";
import { IContainer, INotificationService, INotificationServiceType, Logo, NotificationModel } from "@kinetix/core";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMock } from "ts-auto-mock";

import HeaderView from "./HeaderView";
import { IHeader } from "./IHeader";
import { arrange, hostComponent, stubComponent } from "../../../../../testing";

describe("Kinetix monza core shell", () => {
  let mockContainer: IContainer;
  let mockNotificationService: INotificationService;
  let mockVm: IHeader;

  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockVm = createMock<IHeader>();
    mockNotificationService = createMock<INotificationService>({ model: new NotificationModel() });

    arrange(mockContainer).stubMethod("build", () => mockNotificationService, [INotificationServiceType]);
     stubComponent<typeof Logo>("Logo", "@kinetix/core", () => <>Logo</>);
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  describe("HeaderView", () => {
    it("component should be expand drawer", async () => {
      mockVm.model.isIconLeftAlign = true;
      arrange(mockVm).stubMethod("GetUsername", () => "testUser");
      let sut = hostComponent(<HeaderView title="TestTitle" dataContext={mockVm} />, mockContainer);
      const view = render(sut);
      //let collapseBtn = view.container.getElementsByClassName("k-i-arrow-chevron-left");

     // fireEvent.click(collapseBtn[0]);
      expect(view).not.toBeNull();
      await waitFor(() => {
        expect(screen.getByText("TestTitle")).toBeInTheDocument();
      });
    });
  });
});

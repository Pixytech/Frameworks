// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IContainer, INotificationService, INotificationServiceType, Logo, NotificationModel } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { HeaderModel } from "./HeaderModel";
import { IHeader } from "./IHeader";
import { arrange, hostComponent, stubComponent } from "../../../../../testing";
import { HeaderView } from "./HeaderView";

// Base Package
describe("Kinetix Monza core", () => {
  // Scoped module
  let mockNotificationService: INotificationService;
  let mockContainer: IContainer;
  let mockHeaderContext: IHeader;
  beforeEach(() => {
    mockHeaderContext = createMock<IHeader>({ model: new HeaderModel() });
    mockContainer = createMock<IContainer>();
    mockNotificationService = createMock<INotificationService>({ model: new NotificationModel() });
    arrange(mockContainer).stubMethod("build", () => mockNotificationService, [INotificationServiceType]);
     stubComponent<typeof Logo>("Logo", "@kinetix/core", () => <>Logo</>);
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("HeaderView", () => {
    // TEST:  Kinetix App > ApplicationHost > component should be created without style attribute
    it("Render routes should render components", async () => {
      arrange(mockHeaderContext).stubMethod("GetUsername", () => "TEST_USER");
      let sut = hostComponent(<HeaderView dataContext={mockHeaderContext} title="TEST_TITLE" />, mockContainer);

      const view = render(sut);

      // uncomment to see the html code
      //screen.debug();

      expect(view).not.toBeNull();
      expect(screen.getByText("TEST_TITLE")).toBeInTheDocument();
      expect(screen.getByText("TEST_USER")).toBeInTheDocument();
    });

    it("Should handle item click", async () => {
      arrange(mockHeaderContext).stubMethod("GetUsername", () => "TEST_USER");
      mockHeaderContext.model.headerName = "TEST_TITLE";

      let sut = hostComponent(<HeaderView dataContext={mockHeaderContext} title="SOME_OTHER" />, mockContainer);

      const view = render(sut);

      // uncomment to see the html code
      //screen.debug();

      expect(view).not.toBeNull();
      expect(screen.getByText("TEST_TITLE")).toBeInTheDocument();
      expect(screen.getByText("TEST_USER")).toBeInTheDocument();

      fireEvent.click(screen.getByText("TEST_USER"));

      await waitFor(() => {
        expect(screen.getByText("Logout")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Logout"));

      await waitFor(() => {
        expect(mockHeaderContext.handleUserMenuClick).toBeCalledWith("Logout");
      });
    });
  });
});

import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { act, cleanup, fireEvent, getByText, render, waitFor, screen } from "@testing-library/react";
import { arrange, clearStubs, hostComponent, stubComponent } from "../../../../../testing";
import { RegionView } from "../RegionView";
import React, { FC, ReactNode, RefAttributes, RefObject } from "react";
import { IContainer } from "../../IoC";
import { IDialogComponent } from "./IDialogComponent";
import { IDialogContextModel } from "./IDialogContextModel";
import { DialogComponentView } from "./DialogComponent";
import { Window, WindowProps } from "@progress/kendo-react-dialogs";
import { IViewResolver } from "../../Mvvm";
import { CoreTypes } from "../../CoreTypes";
import { WindowStage } from "./DialogContext";
import { IViewModel } from "../../Mvvm/IViewModel";
import { IHeaderTemplateProps } from "./IDialogContext";

// Base Package
describe("Kinetix Core", () => {
  let dataContext: IDialogComponent;
  let mockContainer: IContainer;

  // Execute once before all tests
  // To create single module for all tests

  beforeEach(() => {
    dataContext = createMock<IDialogComponent>({ model: createMock<IDialogContextModel>() });
    mockContainer = createMock<IContainer>();
    const mockViewResolver = createMock<IViewResolver>();

    arrange(mockContainer).stubMethod("build", () => mockViewResolver, [CoreTypes.IViewResolver]);
    arrange(mockViewResolver).stubMethod("renderInstance", (vm, child, props) => {
      return (
        <div>
          SOME <input autoFocus tabIndex={1} />{" "}
          <div>
            CONTENT <input tabIndex={2} />
          </div>
        </div>
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
    clearStubs();
  });

  // Testing Component
  describe("DialogComponent", () => {
    // TEST:  Kinetix App > Registry > instance should be created
    it("should render dialog component", async () => {
      dataContext.model.content = undefined;
      const mockWindow = stubComponent<typeof Window>("Window", "@progress/kendo-react-dialogs");
      let sut = hostComponent(<DialogComponentView dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      //screen.debug();
      expect(view).not.toBeNull();
      /* expect(mockWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          children: expect.anything(),
          closeButton: expect.anything(),
          maximizeButton: expect.anything(),
          minimizeButton: expect.anything(),
          modal: false,
          resizable: false,
          restoreButton: expect.anything(),
          title: expect.anything(),
        }),
        expect.anything()
      ); */
    });

    it("should render model component", async () => {
      dataContext.model.isModel = true;
      dataContext.model.canClose = true;
      dataContext.model.canMinimize = true;
      dataContext.model.canMaximize = true;
      dataContext.model.stage = WindowStage.FULLSCREEN;
      const mockWindow = stubComponent<typeof Window>("Window", "@progress/kendo-react-dialogs");

      let sut = hostComponent(<DialogComponentView dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      expect(view).not.toBeNull();

      expect(mockWindow).toHaveBeenCalledWith(
        expect.objectContaining({
          modal: true,
        }),
        expect.anything()
      );
    });

    it("should handle keyboard events", async () => {
      dataContext.model.canClose = true;
      dataContext.model.cyclicTab = true;
      dataContext.model.canMinimize = false;
      dataContext.model.canMinimize = false;
      let sut = hostComponent(<DialogComponentView dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      const window = screen.getByRole("dialog");

      fireEvent.focus(window);

      fireEvent.keyDown(window, {
        key: "Tab",
        code: "tab",
        keyCode: 9,
      });

      fireEvent.keyDown(window, {
        key: "Tab",
        code: "tab",
        keyCode: 9,
        shiftKey: true,
      });

      const closeButton = screen.getByTestId("cancelButton");
      fireEvent.click(closeButton);
      await waitFor(() => {
        expect(dataContext.Close).toBeCalled();
      });
    });

    it("should close on escape", async () => {
      dataContext.model.canClose = true;

      let sut = hostComponent(<DialogComponentView dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      const window = screen.getByRole("dialog");
      fireEvent.focus(window);
      fireEvent.keyDown(window, {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        charCode: 27,
      });
      fireEvent.keyUp(window, {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        charCode: 27,
      });

      await waitFor(() => {
        expect(dataContext.Close).toBeCalled();
      });
    });

    it("should render header title", async () => {
      dataContext.model.title = "TitleAsText";
      dataContext.model.canMaximize = true;

      render(hostComponent(<DialogComponentView dataContext={dataContext} />, mockContainer));
      expect(screen.getByText("TitleAsText")).toBeInTheDocument();
    });

    it("should render header complex title", async () => {
      dataContext.model.canMaximize = true;
      const SomeTemplate: FC<IHeaderTemplateProps> = (props: IHeaderTemplateProps) => {
        return <>COMPLEX-{props.dialogComponent.model.title}</>;
      };
      dataContext.model.content = createMock<IViewModel>();
      dataContext.model.title = "TEST";
      dataContext.model.headerTemplate = SomeTemplate;

      render(hostComponent(<DialogComponentView dataContext={dataContext} />, mockContainer));

      expect(screen.getByText("COMPLEX-TEST")).toBeInTheDocument();
    });
  });
});

import "reflect-metadata";
import { IContainer, IThemeService } from "@kinetix/core";
import { cleanup, createEvent, fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { IFormViewModel } from "./IFormViewModel";
import { createMockThemeService, hostComponent } from "../../../../testing";
import React from "react";
import { TicketLayout } from "./TicketLayout";
import { FormModel } from "./FormModel";
import { TextArea } from "@progress/kendo-react-inputs";
import { FormCard } from "./Layouts";
// Base Package
describe("Kinetix Monza Core", () => {
  let mockFormViewModel: IFormViewModel<FormModel>;
  let mockContainer: IContainer;
  let mockThemeService: IThemeService;
  let sut: JSX.Element;

  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockThemeService = createMockThemeService();
    mockFormViewModel = createMock<IFormViewModel<FormModel>>();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  // Testing Component
  describe("TicketLayout", () => {
    it("component with class name", () => {
      sut = hostComponent(<TicketLayout viewModel={mockFormViewModel} className={"myClassName"} />, mockContainer, mockThemeService);

      const view = render(sut);

      const ticketWrapper = view.container.querySelector(".ticket-wrapper");

      expect(ticketWrapper).not.toBeNull();
      expect(ticketWrapper?.className).toBe("ticket-wrapper myClassName");
    });

    it("test hot keys", () => {
      sut = hostComponent(
        <TicketLayout viewModel={mockFormViewModel}>
          <FormCard title="Form Card Title">
            <TextArea />
          </FormCard>
        </TicketLayout>,
        mockContainer,
        mockThemeService
      );

      const view = render(sut);

      const form = view.container.querySelector(".k-form")!;
      const textArea = view.container.querySelector(".k-input-inner")!;

      // Filter out 'enter'
      const enterEvent = createEvent.keyDown(form, { key: "Enter", which: 13, keyCode: 13 });
      fireEvent(form, enterEvent);

      expect(enterEvent.defaultPrevented).toBe(true);

      // Do not filter out 'enter' in text area controls
      const enterEventTextArea = createEvent.keyDown(textArea, { key: "Enter", which: 13, keyCode: 13 });
      fireEvent(textArea, enterEventTextArea);

      expect(enterEventTextArea.defaultPrevented).toBe(false);

      // Allow 'ctrl+enter'
      const ctrlEnterEvent = createEvent.keyDown(form, { key: "Enter", which: 13, keyCode: 13, ctrlKey: true });
      fireEvent(form, ctrlEnterEvent);

      expect(ctrlEnterEvent.defaultPrevented).toBe(false);
    });
  });
});

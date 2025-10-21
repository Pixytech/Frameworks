// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MessageBoxModel, MessageBoxViewModel } from "../..";
import { MessageBoxView } from "./MessageBoxView";
import { hostComponent } from "../../../../../testing";
import { createMock } from "ts-auto-mock";

class TestMessageBoxModel extends MessageBoxModel {
  test: string;
}
// Base Package
describe("Kinetix Core", () => {
  // Scoped module

  let mockMessageBoxViewModel: MessageBoxViewModel;

  beforeEach(() => {
    mockMessageBoxViewModel = createMock<MessageBoxViewModel>({
      model: new TestMessageBoxModel(),
    });
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("MessageBoxView", () => {
    // TEST:  Kinetix Core > MessageBoxView > component should be created without style attribute
    it("Should render text based messagbox", () => {
      mockMessageBoxViewModel.MessgaeBoxText = "<b>Test</b>";
      mockMessageBoxViewModel.IsHtmlContents = false;
      let sut = hostComponent(
        <MessageBoxView dataContext={mockMessageBoxViewModel} />
      );
      const view = render(sut);
      expect(view).not.toBeNull();
    });

    it("Should render html based messagbox", () => {
      mockMessageBoxViewModel.MessgaeBoxText = "<b>Test</b>";
      mockMessageBoxViewModel.IsHtmlContents = true;
      let sut = hostComponent(
        <MessageBoxView dataContext={mockMessageBoxViewModel} />
      );
      const view = render(sut);
      expect(view).not.toBeNull();
    });
  });
});

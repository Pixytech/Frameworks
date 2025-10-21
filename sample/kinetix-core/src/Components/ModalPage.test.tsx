import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { hostComponent } from "../../../../testing";
import { ModalPage } from "./ModalPage";

describe("Kinetix Core", () => {
  beforeEach(() => {});

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  describe("ModalPage", () => {
    it("should close rendered Model page", () => {
      const testTerm = "Test";

      let sut = hostComponent(
        <ModalPage showClose={true} title={testTerm}>
          TestContent
        </ModalPage>
      );
      const view = render(sut);
      let titleEle = view.getByText(testTerm);
      let contentEle = view.getByText("TestContent");
      expect(view).not.toBeNull();

      let closeBtn = screen.getByLabelText("close");

      waitFor(() => {
        expect(titleEle).not.toBeUndefined();
        expect(contentEle).not.toBeUndefined();
      });

      fireEvent.click(closeBtn);

      waitFor(() => {
        expect(titleEle).not.toBeUndefined();
      });
    });

    it("should not have close button", () => {
      const testTerm = "Test";

      let sut = hostComponent(
        <ModalPage showClose={false} title={testTerm}>
          TestContent
        </ModalPage>
      );
      const view = render(sut);

      expect(view).not.toBeNull();
    });

    it("should close rendered Model page", () => {
      const testTerm = "Test";
      const testClose = jest.fn();

      let sut = hostComponent(
        <ModalPage showClose={true} title={testTerm} onModelClose={testClose}>
          TestContent
        </ModalPage>
      );
      const view = render(sut);
      let titleEle = view.getByText(testTerm);
      let contentEle = view.getByText("TestContent");
      expect(view).not.toBeNull();

      let closeBtn = screen.getByLabelText("close");

      waitFor(() => {
        expect(titleEle).not.toBeUndefined();
        expect(contentEle).not.toBeUndefined();
      });

      fireEvent.click(closeBtn);

      waitFor(() => {
        expect(testClose).toBeCalled();
      });
    });

    it("should render page with footer", () => {
      const testTerm = "Test";

      let sut = hostComponent(
        <ModalPage showClose={true} title={testTerm} footer={<div>testFooter</div>}>
          TestContent
        </ModalPage>
      );
      const view = render(sut);
      let titleEle = view.getByText(testTerm);
      let contentEle = view.getByText("TestContent");
      let footerEle = view.getByText("testFooter");

      expect(view).not.toBeNull();

      waitFor(() => {
        expect(titleEle).not.toBeUndefined();
        expect(contentEle).not.toBeUndefined();
        expect(footerEle).not.toBeUndefined();
      });
    });
  });
});

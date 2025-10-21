import "reflect-metadata";
import React from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { createMock } from "ts-auto-mock";
import { hostComponent } from "../../../../testing";
import { PageTitleBar } from "./PageTitleBar";

describe("Kinetix Core", () => {
  beforeEach(() => {});

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  describe("PageTitleBar", () => {
    it("should render page with valid PageTitleBar", () => {
      const testTerm = "Test";

      let sut = hostComponent(<PageTitleBar title={testTerm} showBack={true} />);
      const view = render(sut);
      let titleEle = view.getByText(testTerm);
      expect(view).not.toBeNull();
      waitFor(() => {
        expect(titleEle).not.toBeUndefined();
      });
    });
  });
});

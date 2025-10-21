// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { hostComponent } from "../../../../testing";
import { Frame } from "./Frame";
import { Button } from "@progress/kendo-react-buttons";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module

  beforeEach(() => {});

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Testing Component
  describe("Frame", () => {
    it("Frame should render child components", async () => {
      let sut = hostComponent(
        <Frame>
          <Button>SomeContents</Button>
        </Frame>
      );
      const view = render(sut);
      //screen.debug();
    });

    it("Frame src should override the contents", async () => {
      let sut = hostComponent(
        <Frame src={window.location.href}>
          <Button>SomeContents</Button>
        </Frame>
      );
      const view = render(sut);
      //screen.debug();
    });
  });
});

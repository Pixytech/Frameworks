// reflect-metadata is required for IOC
import "reflect-metadata";
import React, { useEffect } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { hostComponent } from "../../../../testing";
import { ComponentBoundary } from "./ComponentBoundary";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module

  beforeEach(() => {});

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Testing Component
  describe("ComponentBoundary", () => {
    it("Component render ", async () => {
      const ComponentWithoutRenderError = () => {
        return <>Component View</>;
      };

      let sut = hostComponent(
        <ComponentBoundary>
          <ComponentWithoutRenderError />
        </ComponentBoundary>
      );

      render(sut);

      await waitFor(() => {
        expect(screen.getByText("Component View")).toBeInTheDocument();
      });
    });

    it("Component render errors catched by boundary", async () => {
      const ComponentWithRenderError = () => {
        useEffect(() => {
          throw new Error("Component render error");
        });
        return <>Component View</>;
      };

      let sut = hostComponent(
        <ComponentBoundary>
          <ComponentWithRenderError />
        </ComponentBoundary>
      );

      render(sut);

      await waitFor(() => {
        expect(screen.getByText("Error: Component render error")).toBeInTheDocument();
      });
    });
  });
});

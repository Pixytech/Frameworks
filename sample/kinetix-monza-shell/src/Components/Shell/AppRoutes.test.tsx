// reflect-metadata is required for IOC

import "reflect-metadata";
import { IContainer } from "@kinetix/core";
import { AppRoutes } from "./AppRoutes";
import { IDefaultShell, IDefaultShellType } from "./IDefaultShell";
import { createMock } from "ts-auto-mock";
import { arrange, isValidRouteElement, stubComponent } from "../../../../../testing";
import { ShellHost } from "@kinetix/monza-core";
import React from "react";

// Base Package
describe("Kinetix Monza Shell", () => {
  // Scoped module
  let sut: AppRoutes;
  let mockContainer: IContainer;
  // Execute once before all tests
  // To create single module for all tests
  beforeAll(() => {
    mockContainer = createMock<IContainer>();
    let mockShell = createMock<IDefaultShell>();
    stubComponent<typeof ShellHost>("ShellHost", "@kinetix/monza-core", (props) => <>{props.children}</>);
    arrange(mockContainer).stubMethod("build", () => mockShell, [IDefaultShellType]);
    sut = new AppRoutes(mockContainer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Testing Component
  describe("Registry", () => {
    // TEST:  Kinetix Core > Registry > should configure dependency
    it("Link should have right value", () => {
      expect(sut.link).toBe("/home");
    });
  });
});

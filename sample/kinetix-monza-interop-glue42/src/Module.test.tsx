// reflect-metadata is required for IOC
import "reflect-metadata";
import { IContainer } from "@kinetix/core";
import { Module } from "./Module";
import { createMock } from "ts-auto-mock";
import { Registry } from "./Registry";

// Base Package
describe("Kinetix Trading Interop Glue42", () => {
  // Scoped module
  let sut: Module;
  let mockContainer: IContainer;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    sut = new Module();
    mockContainer = createMock<IContainer>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("Module", () => {
    it("should include registry", () => {
      sut.onInitialized(mockContainer);
      expect(mockContainer.includeRegistry).toBeCalledWith(Registry);
    });
  });
});

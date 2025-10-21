// reflect-metadata is required for IOC
import "reflect-metadata";
import { IContainer, Registry } from ".";
import { Module } from ".";
import { createMock } from "ts-auto-mock";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: Module;
  let mockContainer: IContainer;

  // Execute once before each tests
  // To create single module for each tests
  beforeEach(() => {
    sut = new Module();
    mockContainer = createMock<IContainer>();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("Module", () => {
    // TEST:  Kinetix Core > Module > should include Registry
    it("should include Registry", () => {
      sut.onInitialized(mockContainer);
      expect(mockContainer.includeRegistry).toBeCalledWith(Registry);
    });
  });
});

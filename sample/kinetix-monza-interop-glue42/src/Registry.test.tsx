// reflect-metadata is required for IOC
import "reflect-metadata";
import { Registry } from "./Registry";
import { CoreTypes, IContainer, ObjectLifecycle } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { Glue42Client } from "./Glue42Client";

// Base Package
describe("Kinetix Monza Interop Glue42", () => {
  // Scoped module
  let sut: Registry;
  let mockContainer: IContainer;

  // Execute once before all tests
  // To create single module for all tests
  beforeAll(() => {
    sut = new Registry();
    mockContainer = createMock<IContainer>();
  });

  // Testing Component
  describe("Registry", () => {
    // TEST:  Kinetix Monza Interop Glue42 > Registry > should configure dependency
    it("should configure dependency", () => {
      sut.configure(mockContainer);

      expect(mockContainer.register).toBeCalledWith(
        CoreTypes.IInteropClient,
        Glue42Client,
        ObjectLifecycle.Singleton
      );
    });
  });
});

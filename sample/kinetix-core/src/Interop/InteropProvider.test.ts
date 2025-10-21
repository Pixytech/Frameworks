// reflect-metadata is required for IOC
import "reflect-metadata";

import { IInteropClient, InteropContainerType, InteropProviderViewModel } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
// Base Package
describe("Kinetix Core", () => {
  // Scoped sut
  let sut: InteropProviderViewModel;
  // Execute once before each tests
  // To create single sut for each tests
  beforeEach(() => {
    sut = new InteropProviderViewModel();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("InteropProvider", () => {
    it("should create module", async () => {
      const client: IInteropClient = createMock<IInteropClient>();
      const containerType: InteropContainerType = InteropContainerType.Application;
      await sut.initialize(client, containerType);
      expect(client.initialize).toBeCalled();
    });
  });
});

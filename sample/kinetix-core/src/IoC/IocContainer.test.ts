// reflect-metadata is required for IOC
import "reflect-metadata";
import { IocContainer } from "./IocContainer";

import { createMock } from "ts-auto-mock";
import { IContainer } from "./IContainer";
import { Container } from "inversify";
import { IRegistry } from "./IRegistry";
import { ObjectLifecycle } from "./ObjectLifecycle";
import { arrange } from "../../../../testing";
// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: IocContainer;
  let mockParaentContainer: Container;

  // Execute once before each tests
  // To create single module for each tests
  beforeEach(() => {
    mockParaentContainer = createMock<Container>();
    sut = new IocContainer(mockParaentContainer);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("IocContainer", () => {
    class StubRegistry implements IRegistry {
      configure(configurer: IContainer): void {
        configurer.register<StubRegistry>(StubRegistry, StubRegistry, ObjectLifecycle.Scoped);
      }
    }

    it("should create container", () => {
      sut = new IocContainer();
      expect(sut.container).toBeDefined();
    });

    it("should include Registry", () => {
      sut.includeRegistry<StubRegistry>(StubRegistry);
      expect(mockParaentContainer.bind).toBeCalled();
    });

    it("should register ", () => {
      sut.register<StubRegistry>(StubRegistry, StubRegistry, ObjectLifecycle.Scoped);
      expect(mockParaentContainer.bind).toBeCalled();
    });

    it("should register type ", () => {
      sut.registerType<StubRegistry>(StubRegistry, ObjectLifecycle.Scoped);
      expect(mockParaentContainer.bind).toBeCalled();
    });

    it("should register singletom ", () => {
      sut.registerType<StubRegistry>(StubRegistry, ObjectLifecycle.Singleton);
      expect(mockParaentContainer.bind).toBeCalled();
    });

    it("should register instance ", () => {
      const instance = new StubRegistry();
      sut.registerInstance<StubRegistry>(StubRegistry, instance);
      expect(mockParaentContainer.bind).toBeCalled();
    });

    it("should build ", () => {
      sut.build<StubRegistry>(StubRegistry);
      expect(mockParaentContainer.get).toBeCalled();
    });

    it("should build all ", () => {
      sut.buildAll<StubRegistry>(StubRegistry);
      expect(mockParaentContainer.getAll).toBeCalled();
    });

    it("should create child container ", () => {
      sut.createChildContainer();
      expect(mockParaentContainer.createChild).toBeCalled();
    });

    it("should deregister ", () => {
      arrange(mockParaentContainer).stubMethod("isBound", () => true);
      sut.deregister<StubRegistry>(StubRegistry);
      expect(mockParaentContainer.unbind).toBeCalled();
    });
  });
});

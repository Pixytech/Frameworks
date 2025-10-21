// reflect-metadata is required for IOC
import "reflect-metadata";
import { DispatchState } from "./DispatchState";
import { clearStubs } from "../../../../testing";

// Base Package
describe("Kinetix Core", () => {
  // Scoped sut

  beforeEach(() => {
    //DispatchState is stubbed at global level so this is required to roll back impl to real
    clearStubs();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("DispatchState", () => {
    it("should execute callback", async () => {
      const someState = {
        property: "some",
        method: () => {
          return "someMethod";
        },
      };
      const mockCallBack = jest.fn();
      DispatchState(mockCallBack, someState);
      expect(mockCallBack).toBeCalled();
    });
  });
});

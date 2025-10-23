// reflect-metadata is required for IOC
import "reflect-metadata";
import { IAuthenticationService, IEventAggregator } from "@kinetix/core";
import { HeaderViewModel } from "./HeaderViewModel";
import { createMock } from "ts-auto-mock";
import { arrange, createMockEventAggregator } from "../../../../../testing";
import { DrawerToggleEvents, DrawerTogglePayload } from "@kinetix/monza-core";
import { waitFor } from "@testing-library/react";
// Base Package
describe("Kinetix Trading Shell Sales360", () => {
  // Scoped module
  let sut: HeaderViewModel;

  let mockAuthService: IAuthenticationService;
  let mockEvents: IEventAggregator;

  let subscriptionCallBack: (p: DrawerTogglePayload) => void = () => {};

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockAuthService = createMock<IAuthenticationService>();

    mockEvents = createMockEventAggregator();

    arrange(mockAuthService).stubMethod("GetUsername", () => {
      return "testUser";
    });
    const eventsImp = {
      publish: jest.fn(),
      subscribe: jest.fn((callBack) => {
        subscriptionCallBack = callBack;
      }),
    };

    arrange(mockEvents).stubMethod("getEvent", () => {
      console.log("*/* event called");
      return eventsImp;
    });

    sut = new HeaderViewModel(mockEvents, mockAuthService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("HeaderViewModel", () => {
    it("should have model", async () => {
      console.debug = jest.fn();

      await sut.initialize();
      subscriptionCallBack(new DrawerTogglePayload(false));

      expect(sut.model).not.toBeNull();
      await waitFor(() => {
        expect(console.debug).toBeCalled();
      });
    });

    it("username should have valid res", async () => {
      let username = sut.GetUsername();
      expect(username).toBe("testUser");
    });

    it("user context menu logout click should Logout user", async () => {
      sut.handleUserMenuClick("Logout");
      expect(mockAuthService.DoLogout).toBeCalled();
    });

    it("expand drawer should get called", async () => {
      let mockDrawerToggleEvent = createMock<DrawerToggleEvents>();
      arrange(mockEvents).stubMethod("getEvent", () => {
        return mockDrawerToggleEvent;
      });
      sut.handleClick(mockEvents, true);
      expect(mockDrawerToggleEvent.publish).toBeCalledWith(new DrawerTogglePayload(false));
    });
  });
});

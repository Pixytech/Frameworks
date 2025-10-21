// reflect-metadata is required for IOC
import "reflect-metadata";
import { HeaderViewModel } from "./HeaderViewModel";
import { createMock } from "ts-auto-mock";
import {
  IEventAggregator,
  IAuthenticationService,
  EventAggregator,
} from "@kinetix/core";
import {
  HeaderNameEvents,
  HeaderNamePayload,
} from "../Events/HeaderNameEvents";

import {
  DrawerToggleEvents,
  DrawerTogglePayload,
} from "../Events/DrawerToggleEvents";
import { arrange, createMockEventAggregator } from "../../../../../testing";

// Base Package
describe("Kinetix Monza core", () => {
  // Scoped module
  let sut: HeaderViewModel;
  let mockEventAggregator: IEventAggregator;
  let mockAuthenticationService: IAuthenticationService;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockEventAggregator = createMockEventAggregator();
    mockAuthenticationService = createMock<IAuthenticationService>();
    sut = new HeaderViewModel(mockEventAggregator, mockAuthenticationService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("HeaderViewModel", () => {
    // TEST:  IDP.Agreements > HeaderViewModel > should include Register with light theme
    it("should subscribe to events on initialize", async () => {
      await sut.initialize();

      expect(
        mockEventAggregator.getEvent(
          DrawerToggleEvents,
          DrawerToggleEvents.Type
        ).subscribe
      ).toBeCalled();
      expect(
        mockEventAggregator.getEvent(HeaderNameEvents, HeaderNameEvents.Type)
          .subscribe
      ).toBeCalled();
    });

    it("should raise event drawer on handle click", async () => {
      sut.model.isIconLeftAlign = false;
      await sut.initialize();

      sut.handleClick(mockEventAggregator, false);

      expect(
        mockEventAggregator.getEvent(
          DrawerToggleEvents,
          DrawerToggleEvents.Type
        ).publish
      ).toBeCalled();
    });

    it("should update model on HeaderNameEvents event", async () => {
      let subscriptionCallBack: (p: HeaderNamePayload) => void = () => {};
      const eventsImp = {
        publish: jest.fn(),
        subscribe: jest.fn((callBack) => {
          subscriptionCallBack = callBack;
        }),
      };

      arrange(mockEventAggregator).stubMethod(
        "getEvent",
        () => {
          return eventsImp;
        },
        [HeaderNameEvents, HeaderNameEvents.Type]
      );

      await sut.initialize();
      subscriptionCallBack(new HeaderNamePayload("testHeader"));
      expect(sut.model.headerName).toBe("testHeader");
    });

    it("should update model on DrawerToggleEvents event", async () => {
      let subscriptionCallBack: (p: DrawerTogglePayload) => void = () => {};
      const eventsImp = {
        publish: jest.fn(),
        subscribe: jest.fn((callBack) => {
          subscriptionCallBack = callBack;
        }),
      };

      arrange(mockEventAggregator).stubMethod(
        "getEvent",
        () => {
          return eventsImp;
        },
        [DrawerToggleEvents, DrawerToggleEvents.Type]
      );

      await sut.initialize();
      subscriptionCallBack(new DrawerTogglePayload(true));
      expect(sut.model.isIconLeftAlign).toBe(true);
    });

    it("GetUsername should return valid username", () => {
      mockAuthenticationService.GetUsername = jest
        .fn()
        .mockImplementation(() => {
          return "testUser";
        });
      let username = sut.GetUsername();

      expect(username).toBe("testUser");
    });

    it("handleUserMenuClick should get user loggedOut", () => {
      sut.handleUserMenuClick("Logout");

      expect(mockAuthenticationService.DoLogout).toBeCalled();
    });
  });
});

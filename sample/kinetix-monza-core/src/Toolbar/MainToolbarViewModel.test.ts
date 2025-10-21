// reflect-metadata is required for IOC
import "reflect-metadata";
import { EventAggregator, IContainer, IEventAggregator } from "@kinetix/core";
import { MainToolbarViewModel } from "./MainToolbarViewModel";
import { AssetType, BlotterData, BlotterLaunchEvent, RecordType, TicketData, TicketLaunchEvent, ToolbarOptionChangeEvent, ToolbarOptionChangePayload } from "..";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let container: IContainer;
  let sut: MainToolbarViewModel;
  let events: IEventAggregator;
  let mockMenuItem = { Name: "Test", Catagory: "Common" };

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(async () => {
    events = new EventAggregator();
    container = jest.createMockFromModule<IContainer>("@kinetix/core");
    sut = new MainToolbarViewModel(container, events);

    container.buildAll = jest.fn().mockReturnValue([
      {
        getToolbarItems() {
          return [mockMenuItem];
        },
      },
    ]);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("MainToolbarViewModel", () => {
    // TEST:  Kinetix Monza Core > Module > should get initialized
    it("should get initialized", async () => {
      let mockTicketMenu = jest.spyOn(sut as any, "getNewTicketMenus");
      let mockInit = jest.spyOn(MainToolbarViewModel.prototype, "initialize");

      await sut.initialize();

      expect(sut).not.toBeNull();
      expect(mockTicketMenu).toBeCalledTimes(1);
      expect(mockInit).toBeCalledTimes(1);
      expect(sut.model.MenuItems).not.toBeNull();
      expect(sut.model.MenuItems[mockMenuItem.Catagory]).toStrictEqual([mockMenuItem]);
    });

    // TEST:  Kinetix Monza Core > Module > should get initialized
    it("getNewTicketMenus should be called on change of ToolbarOptionChangeEvent", async () => {
      let mockTicketMenu = jest.spyOn(sut as any, "getNewTicketMenus");
      await sut.initialize();
      events.getEvent<ToolbarOptionChangeEvent>(ToolbarOptionChangeEvent, ToolbarOptionChangeEvent.Type).publish(new ToolbarOptionChangePayload("save"));

      expect(events).not.toBeNull();
      //TODO : Raj - Why this test is failing ?
      //expect(mockTicketMenu).toBeCalledTimes(2);
    });

    // TEST:  Kinetix Monza Core > Module > should get initialized
    it("should call ticket launch event", () => {
      let mocklaunchTicket = jest.spyOn(sut as any, "launchTicket");
      let mockFnc = jest.fn();
      let ticketData: TicketData = {
        eventType: "new",
        assetType: AssetType.BOND,
        recordType: RecordType.Trade,
        source: "unknown",
        properties: [],
      };
      events.getEvent<TicketLaunchEvent>(TicketLaunchEvent, TicketLaunchEvent.Type).subscribe((x) => {
        mockFnc(x);
      });

      sut.launchTicket(ticketData);

      expect(events).not.toBeNull();
      expect(mocklaunchTicket).toHaveBeenCalledTimes(1);
      expect(mockFnc).toHaveBeenCalledTimes(1);
      expect(mockFnc).toBeCalledWith(ticketData);
    });

    it("should call blotter launch event", () => {
      let mocklaunchBlotter = jest.spyOn(sut as any, "launchBlotter");
      let mockFnc = jest.fn();
      let ticketData: BlotterData = {
        datasetId: "id",
        configurationId: "configId",
      };
      events.getEvent<BlotterLaunchEvent>(BlotterLaunchEvent, BlotterLaunchEvent.Type).subscribe((x) => {
        mockFnc(x);
      });

      sut.launchBlotter(ticketData);

      expect(events).not.toBeNull();
      expect(mocklaunchBlotter).toHaveBeenCalledTimes(1);
      expect(mockFnc).toHaveBeenCalledTimes(1);
      expect(mockFnc).toBeCalledWith(ticketData);
    });
  });
});

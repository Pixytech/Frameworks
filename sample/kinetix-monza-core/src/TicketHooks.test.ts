// reflect-metadata is required for IOC
import "reflect-metadata";
import {getTicketData, TicketHook} from "./TicketHooks";
import { createMock } from "ts-auto-mock";

import { TicketLaunchEvent } from "./Events";
import { IFormViewModel, FormModel } from "./Forms";
import { ILayoutProvider } from "./ILayoutProvider";

import { TradingCoreTypes } from "./TradingCoreTypes";
import { arrange, createMockEventAggregator } from "../../../testing";
import { TicketData } from "./TicketData";
import { AssetType } from "./AssetType";
import { RecordType } from "./RecordType";
import { Subject } from "rxjs";
import {LifecycleEvents} from "./LifeCycleEvents";
import { BlotterStream, BlotterStreamPayload } from "./Blotter/BlotterStream";
import { IContainer, IEventAggregator, IInteropProvider, IInteropClient, IDialogService, IRestClient, IStreamingService, Token, CoreTypes, IRestClientType, IStreamingServiceType, InteropContainerType, IntentContext } from "@kinetix/core";
import { IComponentShell } from "./IComponentShell";


// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: TicketHook;
  let mockContainer: IContainer;
  let mockEventAggregator: IEventAggregator;
  let mockInteropProvider: IInteropProvider;
  let mockIInteropClient: IInteropClient;
  let mockdialogService: IDialogService;
  let mockapiClient: IRestClient;
  let mockliveUpdates: IStreamingService;
  let mockTicket: IFormViewModel<FormModel>;
  let mockComponentShell: IComponentShell;
  let mockTicketSymbol: Token<any>;
  let mockLayoutProvider: ILayoutProvider;
  // Execute once before each tests
  // To create single module for each tests
  beforeEach(() => {
    sut = TicketHook.Instance;
    mockContainer = createMock<IContainer>();
    mockEventAggregator = createMockEventAggregator();
    mockInteropProvider = createMock<IInteropProvider>();
    mockdialogService = createMock<IDialogService>();
    mockapiClient = createMock<IRestClient>();
    mockliveUpdates = createMock<IStreamingService>();
    mockTicket = createMock<IFormViewModel<FormModel>>();
    mockComponentShell = createMock<IComponentShell>();
    mockLayoutProvider = createMock<ILayoutProvider>();
    mockIInteropClient = createMock<IInteropClient>();
    mockTicketSymbol = Symbol.for("mockTicketSymbol");

    arrange(mockContainer)
      .stubMethod("build", () => mockEventAggregator, [CoreTypes.IEventAggregator])
      .stubMethod("build", () => mockInteropProvider, [CoreTypes.IInteropProvider])
      .stubMethod("build", () => mockdialogService, [CoreTypes.IDialogService])
      .stubMethod("build", () => mockapiClient, [IRestClientType])
      .stubMethod("build", () => mockliveUpdates, [IStreamingServiceType])
      .stubMethod("build", () => mockComponentShell, [CoreTypes.IInteropShell])
      .stubMethod("build", () => mockTicket, [mockTicketSymbol])
      .stubMethod("buildAll", () => [mockLayoutProvider], [TradingCoreTypes.ILayoutProvider]);

    arrange(mockInteropProvider).stubProperty("interop", () => mockIInteropClient);
    arrange(mockLayoutProvider).stubProperty("assetType", () => AssetType.BOND);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("TicketHooks", () => {
    // TEST:  Kinetix Monza Core > ViewMapProvider > should map ConfigurationEditorViewModel
    it("should subscribe to events onLoad", async () => {
      arrange(mockInteropProvider)
        .stubProperty("containerType", () => InteropContainerType.Component)
        .stubProperty("isPlatformAvailable", () => true);

      await sut.onLoad(mockContainer);

      expect(mockEventAggregator.getEvent(TicketLaunchEvent, TicketLaunchEvent.Type).subscribe).toBeCalled();
      expect(mockIInteropClient.registerIntentHandler).toBeCalled();
    });

    it("should launch ticket on ticket event when in browser", async () => {
      const apiSubject = new Subject<TicketData>();
      arrange(mockapiClient).stubMethod("get", () => {
        return apiSubject;
      });
      arrange(mockInteropProvider).stubProperty("interop", () => undefined);
      let subscriptionCallBack: (p: TicketData) => void = () => {};
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
        [TicketLaunchEvent, TicketLaunchEvent.Type]
      );

      arrange(mockLayoutProvider).stubMethod("getDataEndpoint", () => "https://test-url", ["TesteventType", RecordType.Trade, "TestProductType"]);
      arrange(mockLayoutProvider).stubMethod("getLayoutType", () => mockTicketSymbol);

      await sut.onLoad(mockContainer);

      subscriptionCallBack({ assetType: AssetType.BOND, eventType: "TesteventType", properties: [], recordType: RecordType.Trade, source: "TestSource", productType: "TestProductType" });
      apiSubject.next({ assetType: AssetType.BOND, eventType: "TesteventType", properties: [{ fieldName: "id", value: "" }], recordType: RecordType.Trade, source: "TestSource", productType: "TestProductType" });
      expect(mockLayoutProvider.getDataEndpoint).toBeCalled();
      expect(mockliveUpdates.getAdapter<BlotterStreamPayload>(BlotterStream).enabled).toBe(false);
    });

    it("should launch ticket on ticket event when in interop", async () => {
      let registeredhandler: (name: string, context: IntentContext) => Promise<void> = () => Promise.resolve();

      arrange(mockIInteropClient).stubMethod("registerIntentHandler", (name: string, handler: (name: string, context: IntentContext) => Promise<void>) => {
        registeredhandler = handler;
      });

      const apiSubject = new Subject<TicketData>();
      arrange(mockapiClient).stubMethod("get", () => {
        return apiSubject;
      });

      let subscriptionCallBack: (p: TicketData) => void = () => {};
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
        [TicketLaunchEvent, TicketLaunchEvent.Type]
      );

      arrange(mockLayoutProvider).stubMethod("getDataEndpoint", () => "https://test-url", ["TesteventType", RecordType.Trade, "TestProductType"]);
      arrange(mockLayoutProvider).stubMethod("getLayoutType", () => mockTicketSymbol);

      await sut.onLoad(mockContainer);

      subscriptionCallBack({ assetType: AssetType.BOND, eventType: "TesteventType", properties: [], recordType: RecordType.Trade, source: "TestSource", productType: "TestProductType" });
      //apiSubject.next({ assetType: AssetType.BOND, eventType: "TesteventType", properties: [{ fieldName: "id", value: "" }], recordType: RecordType.Trade, source: "TestSource", productType: "TestProductType" });
      await registeredhandler("TEST", {
        type: "type",
        data: {
          data: JSON.stringify({
            eventType: "TesteventType",
            productType: "TestProductType",
            assetType: AssetType.BOND,
            recordType: RecordType.Trade,
            source: "TestSource",
            properties: [],
          } as TicketData),
        },
        name: "test",
        target: "",
      });

      expect(mockLayoutProvider.getDataEndpoint).toBeCalled();
      expect(mockliveUpdates.getAdapter<BlotterStreamPayload>(BlotterStream).enabled).toBe(false);
    });

    it("should get ticket data based on assetType", async () => {
      getTicketData(mockapiClient, "http://test-url", {
        assetType: AssetType.REF_DATA,
        eventType: LifecycleEvents.Create,
        recordType: RecordType.RefData,
        source: "Kinetix",
        productType: "LegalEntity",
        properties: [],
      })

      expect(mockapiClient.get).toBeCalledWith("http://test-url");

      getTicketData(mockapiClient, "http://test-url", {
        assetType: AssetType.BOND,
        eventType: LifecycleEvents.Create,
        recordType: RecordType.Trade,
        source: "Kinetix",
        productType: "LegalEntity",
        properties: [],
      })

      expect(mockapiClient.post).toBeCalledWith("http://test-url/new", {});
    });
  });
});

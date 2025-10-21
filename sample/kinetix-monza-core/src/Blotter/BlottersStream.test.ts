// reflect-metadata is required for IOC
import "reflect-metadata";
import { IAuthenticationService, IConfigurationService, IContainer, IMessageStreamType, StreamingService, MessageStream } from "@kinetix/core";

import { createMock } from "ts-auto-mock";

import { arrange, delay } from "../../../../testing";


import mockIo, { Socket } from "socket.io-client";
import { waitFor } from "@testing-library/react";
import { TestScheduler } from "rxjs/testing";
import { interval, map, take } from "rxjs";
import { BlotterStream, BlotterStreamPayload, BlotterUpdateType } from "./BlotterStream";



jest.mock("socket.io-client");

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: StreamingService;
  let mockConfigService: IConfigurationService;
  let mockContainer: IContainer;
  let mockSocket: Socket;
  let mockAuthService:IAuthenticationService
  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockConfigService = createMock<IConfigurationService>();
    mockSocket = createMock<Socket>();
    mockAuthService = createMock<IAuthenticationService>();
    mockContainer = createMock<IContainer>();

    

       (mockIo as any).mockImplementation(() => {
      return mockSocket;
    });

    arrange(mockAuthService).stubMethod("GetParsedToken", () => {
      return {
        jti: "testJti",
      };
    });

    sut = new StreamingService(mockConfigService,mockAuthService,mockContainer);

    arrange(mockContainer).stubMethod("buildAll",()=>[new BlotterStream(mockConfigService)],[IMessageStreamType]);

    arrange(mockConfigService).stubMethod("getConfiguration", () => {
      return {
        value: {
          enableBatching: true,
          bufferTime: 1000,
          batchDelay: 1000,
          batchThreshold: 2,
        },
      };
    });

    //stubComponent<typeof io>("Socket", "socket.io-client", () => mockSocket);
    /*  arrange(mockSocket).stubMethod("addEventListener", (e, callback) => {
      callback();
    }); */
     arrange(mockSocket).stubMethod("on", (e, callback) => {
      callback();
    });
    arrange(mockSocket).stubProperty("connected", () => true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("BlotterStream", () => {
    const testScheduler = new TestScheduler((actual, expected) => {
      // asserting the two objects are equal - required
      // for TestScheduler assertions to work via your test framework
      // e.g. using chai.
      //console.log("testScheduler", actual, expected);
      expect(actual).toEqual(expected);
    });

    it("initialize should connect socket and create all adapters with config", async () => {
      await testScheduler.run(async () => {
        await sut.initialize();
        const adapter = sut.getAdapter<BlotterStreamPayload>(BlotterStream);
        const eventStreamAdapters = sut["eventStreamAdapters"] as Map<string, MessageStream<any>>;
        const blotterStreamer = eventStreamAdapters.get(adapter.name) as any as BlotterStream;
        expect(blotterStreamer).not.toBeNull();
        expect(blotterStreamer.config.batchDelay).toBe(1000);
      });
    });

    it("initialize without config", async () => {
      await testScheduler.run(async () => {
        arrange(mockConfigService).stubMethod("getConfiguration", () => undefined);
        await sut.initialize();
        const adapter = sut.getAdapter<BlotterStreamPayload>(BlotterStream);
        const eventStreamAdapters = sut["eventStreamAdapters"] as Map<string, MessageStream<any>>;
        const blotterStreamer = eventStreamAdapters.get(adapter.name) as any as BlotterStream;
        expect(blotterStreamer).not.toBeNull();
        expect(blotterStreamer.config.batchDelay).toBe(10000);
      });
    });

    it("getevent should handle nonBrust", async () => {
      await testScheduler.run(async () => {
        await sut.initialize();

        const packets: { items: BlotterStreamPayload[] }[] = [];
        const adapter = sut.getAdapter<BlotterStreamPayload>(BlotterStream);
        adapter.stream.subscribe((data) => {
          packets.push({ items: [...data] });
        });

        const eventStreamers = sut["eventStreams"] as Map<string, MessageStream<any>>;
        const blotterStreamer = eventStreamers.get(adapter.name) as MessageStream<any>;
        expect(blotterStreamer).not.toBeNull();

        const events = [
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
        ];

        var observable = interval(1200).pipe(
          take(events.length),
          map((t) => {
            console.log("TAKE", t);
            return { item: events[t], index: t };
          })
        );
        let publishingIndex = 0;
        observable.subscribe((item) => {
          blotterStreamer.process(item.item);
          publishingIndex = item.index;
        });

        await waitFor(
          () => {
            expect(publishingIndex).toBe(events.length - 1);
          },
          { timeout: 4000 }
        );

        await delay(1000);

        expect(packets.length).toBe(2);
        expect(packets[0].items.length).toBe(1);
        expect(packets[1].items.length).toBe(1);
      });
    });

    it("getevent should brust", async () => {
      await testScheduler.run(async () => {
        await sut.initialize();

        const packets: { items: BlotterStreamPayload[] }[] = [];
      const adapter = sut.getAdapter<BlotterStreamPayload>(BlotterStream);
        sut.getAdapter<BlotterStreamPayload>(BlotterStream).stream.subscribe((data) => {
          packets.push({ items: [...data] });
        });

        const eventStreamers = sut["eventStreams"] as Map<string, MessageStream<any>>;
        const blotterStreamer = eventStreamers.get(adapter.name) as MessageStream<any>;
        expect(blotterStreamer).not.toBeNull();

        const events = [
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
          { datasetID: "test", type: BlotterUpdateType.Single },
        ];

        var observable = interval(1).pipe(
          take(events.length),
          map((t) => {
            return { item: events[t], index: t };
          })
        );
        let publishingIndex = 0;
        observable.subscribe((item) => {
          blotterStreamer.process(item.item);
          publishingIndex = item.index;
        });

        await waitFor(
          () => {
            expect(publishingIndex).toBe(events.length - 1);
          },
          { timeout: 6000 }
        );

        await delay(1000);

        expect(packets.length).toBe(1);
        expect(packets[0].items.length).toBe(12);
      });
    });

   
  });
});

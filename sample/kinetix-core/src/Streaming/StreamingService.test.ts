// reflect-metadata is required for IOC
import "reflect-metadata";

import { createMock } from "ts-auto-mock";
import { StreamingService } from "./StreamingService";
import { arrange } from "../../../../testing";
import mockIo, { Socket } from "socket.io-client";
import { TestScheduler } from "rxjs/testing";
import { Observable } from "rxjs";
import { IMessageStreamType, MessageStream, StreamBase } from "./MessageStream";
import { IAuthenticationService } from "../Auth";
import { IConfigurationService } from "../Configuration";
import { IContainer } from "../IoC";
import { AppStream, AppStreamPayload } from "./AppStream";

jest.mock("socket.io-client");

export class InvalidStreamPayload extends StreamBase {
    
}

export class InvalidStream extends MessageStream<InvalidStreamPayload>{
    public get name(): string {
        return "someName"
    }
    
    async initialize(): Promise<void> {
        
    }
    
    public get stream(): Observable<InvalidStreamPayload[]> {
        return this.subject;
    }
    public forceRefresh(): void {
        //
    }
    
}


// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let sut: StreamingService;
  let mockConfigService: IConfigurationService;
  let mockSocket: Socket;
  let mockAuthService:IAuthenticationService
  let mockContainer:IContainer
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

    arrange(mockContainer).stubMethod("buildAll",()=>[new AppStream()],[IMessageStreamType])

    sut = new StreamingService(mockConfigService,mockAuthService,mockContainer);

    arrange(mockSocket).stubMethod("on", (e, callback) => {
      callback();
    });
    arrange(mockSocket).stubProperty("connected", () => true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("StreamingService", () => {
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

        const eventStreamAdapters = sut["eventStreamAdapters"] as Map<string, MessageStream<any>>;
        const adapter = sut.getAdapter<AppStreamPayload>(AppStream);
        const blotterStreamer = eventStreamAdapters.get(adapter.name) as any as AppStream;
        expect(blotterStreamer).not.toBeNull();
      });
    });

  
   
   

    it("throw error for not implemented adapter", async () => {
      await testScheduler.run(async () => {
        arrange(mockConfigService).stubMethod("getConfiguration", () => undefined);
        await sut.initialize();

        expect(() => {
          sut.getAdapter<InvalidStreamPayload>(InvalidStream);
        }).toThrow(Error);
      });
    });

    it.skip("should delete the dead subscriptions", async () => {
      await sut.initialize();

      const adapter = sut.getAdapter<AppStreamPayload>(AppStream);
      const client1 = adapter.stream.subscribe(() => {});
      const client2 = adapter.stream.subscribe(() => {});
      const client3 = adapter.stream.subscribe(() => {});

      let eventStreamAdapters = sut["eventStreams"] as Map<string, MessageStream<any>>;
      expect(eventStreamAdapters.size).toBe(1);
      client1.unsubscribe();
      client2.unsubscribe();
      client3.unsubscribe();

      //act
      sut["setupSubscriptions"]();
      eventStreamAdapters = sut["eventStreams"] as Map<string, MessageStream<any>>;
      expect(eventStreamAdapters.size).toBe(0);
    });

    it.skip("should clear subscrition when disabled", async () => {
      await sut.initialize();

      const adapter = sut.getAdapter<AppStreamPayload>(AppStream);
      const client1 = adapter.stream.subscribe(() => {});
      const client2 = adapter.stream.subscribe(() => {});
      const client3 = adapter.stream.subscribe(() => {});

      adapter.enabled = false
      const eventStreams = sut["eventStreams"] as Map<string, MessageStream<any>>;
      expect(eventStreams.size).toBe(1);
      expect(eventStreams.get(adapter.name)?.subscription).toBe(undefined);

      //expect(mockSocket.connect).toBeCalled();
      expect(eventStreams.size).toBe(1);
      expect(eventStreams.get(adapter.name)?.subscription).not.toBe(undefined);
    });
  });
});

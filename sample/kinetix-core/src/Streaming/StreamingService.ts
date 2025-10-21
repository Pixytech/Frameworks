
import { fromEvent } from "rxjs";
import io, { Socket } from "socket.io-client";
import { IStreamingService } from "./IStreamingService";
import { IMessageStreamType, IStreamAdapter, MessageStream, StreamBase } from "./MessageStream";
import { AccessTokenRenew, IAuthenticationServiceType, MultiUserSessionViewModel, type IAuthenticationService, } from "../Auth";
import { type IConfigurationService } from "../Configuration";
import { CoreTypes } from "../CoreTypes";
import { IocInjectable, type IContainer, IocInject } from "../IoC";
import { AppStream, AppStreamPayload } from "./AppStream";
import { DisposableAction, Type } from "../Core";
import { IDialogService } from "../Components";

@IocInjectable()
export class StreamingService implements IStreamingService {
  socket: Socket;
  readonly configSvc: IConfigurationService;

  private readonly eventStreams: Map<string, MessageStream<any>> = new Map<string, MessageStream<any>>();
  private readonly eventStreamAdapters: Map<string, MessageStream<any>> = new Map<string, MessageStream<any>>();
  isinitialize: boolean = false;
  autheService: IAuthenticationService;
  container: IContainer;

  constructor(@IocInject(CoreTypes.IConfigurationService) configSvc: IConfigurationService,  @IocInject(IAuthenticationServiceType) autheService: IAuthenticationService,@IocInject(CoreTypes.IContainer) container: IContainer) {
    this.configSvc = configSvc;
    this.container= container;
    this.autheService= autheService;
  }
  

  disConnect() {
    this.socket.disconnect();
    Array.from(this.eventStreams.keys()).forEach((key) => {
      const stream = this.eventStreams.get(key);
      if (stream?.subscription) {
        stream.subscription.dispose();
        stream.subscription = undefined;
        console.debug("unsubscribe for event", key);
      }
    });
  }

  connect() {
    const service = this.autheService;
    const authFactory =()=>{return {
            AuthToken: service.GetParsedToken()?.jti
          }};

    this.socket = io("/rtu/blotters", {
      transports: ["websocket"],
      auth:authFactory(),
      query:authFactory()
    });
    
    this.socket.on("connect", () => {
        console.debug(`StreamingService - connect ${this.socket.id}`);
    });

    
    this.socket.io.on("error", (error) => {
         console.debug(`StreamingService - error connecting ${this.socket.id}`,error);     
    });

    this.socket.io.on("reconnect", (attempt) => {
      console.debug(`StreamingService - reconnect ${attempt}`);     
    });
    
    if(window.location.hostname !== "localhost"){
      this.handleAutoLogoff();
    }
  }

  tryClosingAutoLogoff() {
    const dialogService =  this.container.build<IDialogService>(CoreTypes.IDialogService);
    const multiUserSession = this.container.build<MultiUserSessionViewModel>(MultiUserSessionViewModel);
    if(dialogService.getDialog(multiUserSession)){
      console.debug(`StreamingService - tryClosingAutoLogoff`);     
      dialogService.Close(multiUserSession);
    }
  }
   handleAutoLogoff(): void {
    try{
      this.getAdapter<AppStreamPayload>(AppStream).stream.subscribe(async data=>{
         console.debug(`StreamingService - handleAutoLogoff`,data);     
        if(data.some(x=>x.type === "SESSION_REPLACED")){
          const dialogService =  this.container.build<IDialogService>(CoreTypes.IDialogService);
           const multiUserSession = this.container.build<MultiUserSessionViewModel>(MultiUserSessionViewModel);
           this.disConnect();
           if(dialogService.getDialog(multiUserSession)){
            dialogService.Activate(multiUserSession);
           }else{
              await multiUserSession.show(dialogService);
           }
           
        }
      });
    }catch(e){
      console.debug(`configureLiveStream - eerror`,e);     
    }
    }

    
  async initialize(): Promise<void> {
      if(!this.isinitialize){
        this.isinitialize = true;
        console.debug(`StreamingService - initialize`);     
        this.autheService.accessTokenRenew.subscribe(state=>{this.onAccessTokenRenew(state)});
        const streamAdapters = this.container.buildAll<MessageStream<any>>(IMessageStreamType);
        streamAdapters.forEach(stream=>{
          this.eventStreamAdapters.set(stream.name, stream)
        }) 

        const adapters = Array.from(this.eventStreamAdapters.values());
        const promisses = adapters.map((x) => x.initialize());
        await Promise.all(promisses);
        this.connect();
    }
  }
  onAccessTokenRenew(state: AccessTokenRenew) {
    console.debug(`StreamingService - onAccessTokenRenew`,state);    
    switch(state.state){
      case 'started':
        this.tryClosingAutoLogoff();
        this.socket.disconnect();
        break;
      case 'renewed':
        this.connect();
        this.reconnectSubscriptions();
        break;
    }
  }


  private reconnectSubscriptions() {
    const eventsToRemove: string[] = [];

    this.eventStreams.forEach((stream: MessageStream<any>, key: string) => {
        console.debug("StreamingService - reconnectSubscriptions isObserved",key,stream.isObserved());
        if (stream.subscription) {
           console.debug("StreamingService  reconnectSubscriptions - subscribe",key);
          const subscription = fromEvent(this.socket, key).subscribe((data: any) => {
            this.processUpdates(stream, data);
          });
           stream.subscription = new DisposableAction(()=>{
            console.debug("StreamingService  reconnectSubscriptions - unsubscribe",key);
            subscription.unsubscribe();
            if (!stream.isObserved()) {
              eventsToRemove.push(key);
              stream.subscription?.dispose();
              stream.subscription = undefined;
            }
           });

          console.debug("StreamingService - reconnectSubscriptions - subscribed for event", key);
        }else {
          if (!stream.isObserved()) {
            
            eventsToRemove.push(key);
          }
        }
    });

     ///cleanup dead subscriptions
      eventsToRemove.forEach((key) => {
         console.debug("StreamingService - reconnectSubscriptions eventsToRemove",key);
        this.eventStreams.delete(key);
      });
  }
  private setupSubscriptions() {
    
      const eventsToRemove: string[] = [];

      /// check we have subscriptions for all message types
      this.eventStreams.forEach((stream: MessageStream<any>, key: string) => {
        console.debug("StreamingService - setupSubscriptions isObserved",key,stream.isObserved());
        if (!stream.subscription) {
          const subscription = fromEvent(this.socket, key).subscribe((data: any) => {
            this.processUpdates(stream, data);
          });
           stream.subscription = new DisposableAction(()=>{
            console.debug("StreamingService - unsubscribe",key);
            subscription.unsubscribe();
            if (!stream.isObserved()) {
              eventsToRemove.push(key);
              stream.subscription?.dispose();
              stream.subscription = undefined;
            }
           });

          console.debug("StreamingService - setupSubscriptions - subscribed for event", key);
        } else {
          if (!stream.isObserved()) {
            
            eventsToRemove.push(key);
          }
        }
      });

      ///cleanup dead subscriptions
      eventsToRemove.forEach((key) => {
         console.debug("StreamingService - setupSubscriptions eventsToRemove",key);
        this.eventStreams.delete(key);
      });
  }

  processUpdates(stream: MessageStream<any>, data: any) {
    console.debug(`StreamingService - processUpdates`,data);     
    stream.process(data);
  }

  getAdapter<TStreamType extends StreamBase>(typeinfo:Type<MessageStream<TStreamType>>): IStreamAdapter<TStreamType>
  {
    let stream: MessageStream<TStreamType>;
    const target = new typeinfo();
    const streamName = target.name;
    if (!this.eventStreams.has(streamName)) {
      const adapter = this.eventStreamAdapters.get(streamName);
      if (adapter) {
        stream = adapter;
      } else {
        throw new Error(`StreamingService - adapter for ${streamName} is not available`);
      }
      this.eventStreams.set(streamName, stream);
      this.setupSubscriptions();
    } else {
      stream = this.eventStreams.get(streamName) as MessageStream<TStreamType>;
    }

    return stream;
  }
}

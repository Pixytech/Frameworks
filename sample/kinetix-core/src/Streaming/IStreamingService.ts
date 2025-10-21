import { Type } from "../Core";
import { IStreamAdapter, MessageStream, StreamBase } from "./MessageStream";

export interface IStreamingService {
  initialize(): Promise<void>;
  getAdapter<TStreamType extends StreamBase>(typeinfo:Type<MessageStream<TStreamType>>): IStreamAdapter<TStreamType>;
}

export const IStreamingServiceType = Symbol.for("IStreamingServiceType");





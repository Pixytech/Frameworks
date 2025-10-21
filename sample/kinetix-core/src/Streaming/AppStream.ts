import { Observable } from "rxjs";
import { MessageStream, StreamBase } from "./MessageStream";
import { IocInjectable } from "../IoC";

export class AppStreamPayload extends StreamBase {
    type: "SESSION_REPLACED";
    data:any;
}

@IocInjectable()
export class AppStream extends MessageStream<AppStreamPayload>{
    public get name(): string {
        return "user_rtu"
    }
    
    async initialize(): Promise<void> {
        
    }
    
    public get stream(): Observable<AppStreamPayload[]> {
        return this.subject;
    }
    public forceRefresh(): void {
        //
    }
    
}
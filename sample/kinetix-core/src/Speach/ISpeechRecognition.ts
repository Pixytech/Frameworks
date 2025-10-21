import { Observable } from "rxjs";
export const ISpeechRecognitionType = Symbol.for("ISpeechRecognitionType");
export interface ISpeechRecognition{
    isAvailable:boolean;
    isRunning: boolean;
    start(continuous:boolean):void;
    stop():void;
    onData:Observable<string>;
    onStateChanged: Observable<void>;
}
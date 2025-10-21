import { Observable, Subject } from "rxjs";
import { ISpeechRecognition } from "./ISpeechRecognition";
import { IocInjectable } from "../IoC";

@IocInjectable()
export class SpeechRecognition implements ISpeechRecognition{
    isAvailable: boolean = false;
    isRunning: boolean = false;
    recognition: any;
    _data:Subject<string> = new Subject<string>();
    onData: Observable<string>;
    onStateChanged: Observable<void>;
    _stateChanged:Subject<void> = new Subject<void>();
    constructor(){
        
        this.onData = this._data.asObservable();
        this.onStateChanged = this._stateChanged.asObservable();
        const SpeechRecognition =  (window as any)['SpeechRecognition'] || (window as any)['webkitSpeechRecognition'];

        if(SpeechRecognition){
            this.isAvailable = true;
            this.recognition = new SpeechRecognition();
      
            const SpeechGrammarList = (window as any)['SpeechGrammarList'] || (window as any)['webkitSpeechGrammarList'];
            const speechRecognitionList = new SpeechGrammarList();
            speechRecognitionList.addFromString('command|stop', 1);
            this.recognition.grammars = speechRecognitionList;

            this.ConfigureService();
        }
    }
    ConfigureService() {
        this.recognition.onstart = () => {
            this.isRunning = true;
            this._stateChanged.next();
            console.debug("SpeechRecognition onstart")
          };

          this.recognition.onend = () => {
            this.isRunning = false;
            this._stateChanged.next();
            console.debug("SpeechRecognition onend")
          };

          this.recognition.onresult = async (event: any) => {
            const transcript = event.results[event.results.length - 1][0].transcript;
            // Check if the recognized speech contains the word "stop"
            console.debug("SpeechRecognition onresult",transcript)
            if (transcript.includes('stop')) {
              this.onSendMessage(transcript.replace('stop', ''));
              
              this.stop();
            } else {
              this.onSendMessage(transcript);
            }
          };
    
          // Event fired when an error occurs in speech recognition
          this.recognition.onerror = (event: Error) => {
            this._data.error(event);
          };
    }
    onSendMessage(transcript: string) {
        const data = `${transcript}`.trim();
        if(data.length >0){
            this._data.next(data);
        }
    }

    start(continuous:boolean): void {
        if(this.isAvailable && !this.isRunning){
            // Set up recognition properties
            this.recognition.continuous = continuous;
            this.recognition.start();
            console.debug("SpeechRecognition started")
        }
    }
    stop(): void {
        if(this.isAvailable && this.isRunning){
            this.recognition.stop();
            console.debug("SpeechRecognition stoped")
        }
    }
}
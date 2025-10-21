// reflect-metadata is required for IOC
import "reflect-metadata";
import { SpeechRecognition } from "./SpeechRecognition";
import { arrange, clearStubs } from "../../../../testing";

// Base Package
describe("Kinetix Core", () => {
    let sut:SpeechRecognition;
    let mockSpeachOnError:(e:Error)=>void ;
    let mockSpeachOnResult:(e:{results:SpeechRecognitionResultList})=>void ;
  // Testing Component
  
  afterEach(() => {
    jest.clearAllMocks();
    clearStubs();
  });

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockSpeachOnError = jest.fn();
    mockSpeachOnResult = jest.fn()
    class MockSpeechRecognition{
      onstart:()=>void = ()=>{};
      onend:()=>void = ()=>{};
      
      public get onerror() : (e:Error)=>void {
        return mockSpeachOnError
      }

      
      public set onerror(v : (e:Error)=>void) {
        mockSpeachOnError = v;
      }
      
      public get onresult() : (e:{results:SpeechRecognitionResultList})=>void {
        return mockSpeachOnResult
      }

      
      public set onresult(v : (e:{results:SpeechRecognitionResultList})=>void) {
        mockSpeachOnResult = v;
      }
      
       start(){
          this.onstart();
       }

       stop(){
        this.onend();
       }
    }
    const speechRecognition = MockSpeechRecognition;
    const speechGrammarList = jest.fn(()=>{
      return {
        addFromString:jest.fn()
      }
    });

    arrange(window as any).stubProperty("SpeechRecognition", () => speechRecognition);
    arrange(window as any).stubProperty("SpeechGrammarList", () => speechGrammarList);
    sut = new SpeechRecognition();
    });

  describe("SpeechRecognition", () => {
    // TEST:  Kinetix Core > AutomationHelper > GetId should return replace symbol and space with `-`
    it("should construct the service when SpeechRecognition is available", () => {
     
        expect(sut.isAvailable).toBe(true);
        expect(sut.isRunning).toBe(false);
        sut.start(true);
        expect(sut.isRunning).toBe(true);
        sut.stop();
        expect(sut.isRunning).toBe(false);
    });

    it("should construct the fallback service when webkitSpeechRecognition is available", () => {
     
          const speechRecognition = jest.fn(()=>{  return {}});
        const speechGrammarList = jest.fn(()=>{
          return {
            addFromString:jest.fn()
          }
        });

        clearStubs();
        arrange(window as any).stubProperty("SpeechRecognition", () => undefined);
        arrange(window as any).stubProperty("SpeechGrammarList", () => undefined);
        arrange(window as any).stubProperty("webkitSpeechRecognition", () => speechRecognition);
        arrange(window as any).stubProperty("webkitSpeechGrammarList", () => speechGrammarList);
        sut = new SpeechRecognition();
        expect(sut.isAvailable).toBe(true);
          
      });

      it("should not be available", () => {
     
      clearStubs();
      arrange(window as any).stubProperty("SpeechRecognition", () => undefined);
        arrange(window as any).stubProperty("SpeechGrammarList", () => undefined);
        arrange(window as any).stubProperty("webkitSpeechRecognition", () => undefined);
        arrange(window as any).stubProperty("webkitSpeechGrammarList", () => undefined);
      sut = new SpeechRecognition();
      expect(sut.isAvailable).toBe(false);
        
    });


    it("should send on error", () => {
     
      expect(sut.isAvailable).toBe(true);
      expect(sut.isRunning).toBe(false);
      sut.start(true);
      let error: Error | undefined;
      sut.onData.subscribe({next:(v=>{}),error(err) {
        error = err
      },})
      mockSpeachOnError(new Error("Something is wrong"));
      expect(error).toBeDefined()
  });

  it("should send transcript", () => {
     
        expect(sut.isAvailable).toBe(true);
        expect(sut.isRunning).toBe(false);
        sut.start(true);
        let transcript: string | undefined;
        sut.onData.subscribe({next:(v=>{
          transcript = v;
        }),})

        mockSpeachOnResult({
          results: [[{transcript:"test"}]] as any as SpeechRecognitionResultList
        });
        expect(transcript).toBe("test")
    });

    it("should send transcript without stop", () => {
     
      expect(sut.isAvailable).toBe(true);
      expect(sut.isRunning).toBe(false);
      sut.start(true);
      let transcript: string | undefined;
      sut.onData.subscribe({next:(v=>{
        transcript = v;
      }),})

      mockSpeachOnResult({
        results: [[{transcript:"test stop"}]] as any as SpeechRecognitionResultList
      });
      expect(transcript).toBe("test")
  });

  });
});

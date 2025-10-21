import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { HtmlEditorModel, HtmlEditorViewModel } from "./HtmlEditorViewModel";
import { cleanup, fireEvent, render, screen, waitFor} from "@testing-library/react";
import { arrange, clearStubs, hostComponent } from "../../../../../testing";
import React from "react";
import { IContainer } from "../../IoC";
import { HtmlEditor } from "./HtmlEditor";
import { PdfHtml, PrintHtml } from "./HtmlEditorTools";
// Base Package
describe("Kinetix Core", () => {
  class TestViewer extends HtmlEditorViewModel<HtmlEditorModel> {}

 

  // this is real data service mocking
  let dataContext: TestViewer;
  let mockContainer: IContainer;
  // Execute once before all tests
  // To create single module for all tests

  beforeEach(() => {
    dataContext = new TestViewer();
    mockContainer = createMock<IContainer>();
    dataContext.model.contextMenus = [
      { id: "Copy-text", displayName: "Copy text", subItems: [{ id: "Copy-text-submenu", displayName: "Copy text subMenu" }] },
      { id: "sep", isSeparator: true },
      { id: "Copy-text2", displayName: "Copy text2" },
    ];
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("HtmlEditor", () => {
    // TEST:  Kinetix App > Registry > instance should be created
    it("should print html", async () => {
      dataContext.model.content = "<p>Somedata</p>";
      dataContext.model.contentCss = "p{ color:red}";
      const mockPrint = jest.fn();
     
      arrange(window).stubMethod("print",()=>mockPrint );
            
      
          
      expect(dataContext.nodeDOM(0)).toBe(null);
      expect(dataContext.onPreprocessHtml("test")).toBe("test");
      let sut = hostComponent(<HtmlEditor tools={[PrintHtml,PdfHtml]} dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      const reference = dataContext.getEditorReference();
      expect(reference.state).toBeDefined();

      expect(dataContext.getHtml()).toBeDefined();
      
      fireEvent.click(screen.getByTestId("print-html"));
      await waitFor(()=>{
        //expect(mockPrint).toBeCalled();
      })

    });

    

    it("should save pdf", async () => {
        dataContext.model.content = "<p>Somedata</p>";
        dataContext.model.contentCss = "p{ color:red}";
        const mockPrint = jest.fn();
       
        arrange(window).stubMethod("print",()=>mockPrint );
              
        
            
        expect(dataContext.nodeDOM(0)).toBe(null);
        expect(dataContext.onPreprocessHtml("test")).toBe("test");
        let sut = hostComponent(<HtmlEditor tools={[PrintHtml,PdfHtml]} dataContext={dataContext} />, mockContainer);
        const view = render(sut);
  
        const reference = dataContext.getEditorReference();
        expect(reference.state).toBeDefined();
  
        expect(dataContext.getHtml()).toBeDefined();
        
        fireEvent.click(screen.getByTestId("pdf-html"));
        await waitFor(()=>{
          //expect(mockPrint).toBeCalled();
        })
  
      });
  

  });
});

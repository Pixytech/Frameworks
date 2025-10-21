import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { cleanup, render } from "@testing-library/react";
import { clearStubs, hostComponent } from "../../../../../testing";
import React from "react";
import { IContainer } from "../../IoC";
import { WordEditorViewModel } from "./WordEditorViewModel";
import { WordEditor } from "./WordEditor";

// Base Package
describe("Kinetix Core", () => {
  class TestViewer extends WordEditorViewModel {}

 

  // this is real data service mocking
  let dataContext: TestViewer;
  let mockContainer: IContainer;
  // Execute once before all tests
  // To create single module for all tests

  beforeEach(() => {
    dataContext = new TestViewer();
    mockContainer = createMock<IContainer>();
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
    clearStubs();
  });

  // Testing Component
  describe("WordEditor", () => {
    // TEST:  Kinetix App > Registry > instance should be created
    it("should render html", async () => {
      dataContext.model.documentUrl = "https://localhost:3000";
      
      let sut = hostComponent(<WordEditor dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      expect(view).toBeDefined();
    });
    it("should render html in edit view", async () => {
      dataContext.model.documentUrl = "https://localhost:3000";
      dataContext.model.mode = "edit"
      
      let sut = hostComponent(<WordEditor dataContext={dataContext} />, mockContainer);
      const view = render(sut);

      expect(view).toBeDefined();
    });
  });
});

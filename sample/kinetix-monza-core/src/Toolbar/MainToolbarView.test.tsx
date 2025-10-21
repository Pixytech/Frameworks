// reflect-metadata is required for IOC
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { arrange, hostComponent } from "../../../../testing";
import { MainToolbarView } from "./MainToolbarView";
import { MainToolbarViewModel } from "./MainToolbarViewModel";
import { MainToolbarModel } from "./MainToolbarModel";
import { AssetType } from "../AssetType";
import { RecordType } from "../RecordType";
import { AutomationHelper } from "@kinetix/core";

// Base Package
describe("Kinetix Monza core", () => {
  // Scoped module
  let mockDataContext: MainToolbarViewModel;

  beforeEach(() => {
    mockDataContext = createMock<MainToolbarViewModel>({ model: new MainToolbarModel() });
    mockDataContext.model.MenuItems = {
      item1: [
        {
          Name: "itemName1",
          Catagory: "cat1",
          Icon: "icon1",
          Title: "title1",
          Data: {
            eventType: "event1",
            productType: "productType1",
            assetType: AssetType.BOND,
            recordType: RecordType.Trade,
            source: "kinetix",
            properties: [],
          },
          Type: "Ticket",
          Enabled: true,
          Visible: true,
        },
      ],
      item2: [
        {
          Name: "itemName2",
          Catagory: "cat1",
          Icon: "icon1",
          Title: "title1",
          Data: {
            configurationId: "id",
            datasetId: "dataset",
          },
          Type: "Blotter",
          Enabled: true,
          Visible: true,
        },
      ],
    };
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  // Note: running cleanup afterEach is done automatically for you in @testing-library/react@9.0.0 or higher
  // unmount and cleanup DOM after the test is finished.
  afterEach(cleanup);

  // Testing Component
  describe("MainToolbarView", () => {
    // TEST:  Kinetix App > ApplicationHost > component should be created without style attribute
    it("Render routes should render components", async () => {
      let sut = hostComponent(<MainToolbarView dataContext={mockDataContext} />);

      const view = render(sut);

      // uncomment to see the html code
      //screen.debug();
      expect(screen.getByTestId(AutomationHelper.GetId("item1"))).toBeDefined();
      expect(screen.getByTestId(AutomationHelper.GetId("item2"))).toBeDefined();
    });

    it("should launch ticket", async () => {
      let sut = hostComponent(<MainToolbarView dataContext={mockDataContext} />);

      const view = render(sut);

      // uncomment to see the html code
      //screen.debug();
      const mainMenu = screen.getByTestId(AutomationHelper.GetId("item1"));
      fireEvent.focus(mainMenu);
      fireEvent.click(mainMenu);

      await waitFor(() => {
        expect(screen.getByTestId(AutomationHelper.GetId("itemName1"))).toBeDefined();
      });

      const item = screen.getByTestId(AutomationHelper.GetId("itemName1"));
      fireEvent.focus(item);
      fireEvent.click(item);
      fireEvent.blur(item);
      await waitFor(() => {
        expect(mockDataContext.launchTicket).toBeCalled();
      });
      fireEvent.blur(mainMenu);
    });

    it("should launch blotter", async () => {
      let sut = hostComponent(<MainToolbarView dataContext={mockDataContext} />);

      const view = render(sut);

      // uncomment to see the html code
      //screen.debug();
      const mainMenu = screen.getByTestId(AutomationHelper.GetId("item2"));
      fireEvent.focus(mainMenu);
      fireEvent.click(mainMenu);

      await waitFor(() => {
        expect(screen.getByTestId(AutomationHelper.GetId("itemName2"))).toBeDefined();
      });

      const item = screen.getByTestId(AutomationHelper.GetId("itemName2"));
      fireEvent.focus(item);
      fireEvent.click(item);
      fireEvent.blur(item);
      await waitFor(() => {
        expect(mockDataContext.launchBlotter).toBeCalled();
      });
      fireEvent.blur(mainMenu);
    });
  });
});

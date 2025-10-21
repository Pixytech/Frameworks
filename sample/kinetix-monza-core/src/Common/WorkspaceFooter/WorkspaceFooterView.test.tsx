/* eslint-disable testing-library/no-wait-for-multiple-assertions */
import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { IContainer, IThemeService } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { arrangeViewModel, createMockThemeService, hostComponent } from "../../../../../testing";
import { WorkspaceFooterView } from "./WorkspaceFooterView";
import { WorkspaceFooterViewModel,WorkspaceFooterModel } from "./WorkspaceFooterViewModel";

describe("Kinetix Monza core", () => {
  let mockContainer: IContainer;
  let mockFooterContext: WorkspaceFooterViewModel;
  let mockThemeService: IThemeService;

  beforeEach(() => {
    // @ts-ignore
    mockFooterContext = createMock<WorkspaceFooterViewModel>({ model: new WorkspaceFooterModel() });
    mockContainer = createMock<IContainer>();
    mockThemeService = createMockThemeService();
    mockThemeService.Icons= [{name:"partners-logo"}]
    mockFooterContext.model.pageContextList = [{ title: "dummyTitle", content: "dummyContent", link: "/page/terms" }];

    arrangeViewModel(mockFooterContext).acceptModelChanges().acceptViewChanges();
  });

  afterEach(() => {
    cleanup();
    jest.resetAllMocks();
  });

  describe("WorkspaceFooterView", () => {
    it("Should render footer with the footer content", async () => {
      let sut = hostComponent(<WorkspaceFooterView dataContext={mockFooterContext} />, mockContainer, mockThemeService);
      const view = render(sut);

      expect(view).not.toBeNull();

      expect(screen.getByText("Powered by")).toBeInTheDocument();
      expect(screen.getByText("dummyTitle")).toBeInTheDocument();
    });

    it("Should call navigator for non-external links", async () => {
      mockFooterContext.model.pageContextList = [{ title: "dummyTitle", link: "/page/terms", content: 'dummyContent' }];

      let sut = hostComponent(<WorkspaceFooterView dataContext={mockFooterContext} />, mockContainer, mockThemeService);
      const view = render(sut);

      expect(view).not.toBeNull();
      const btn = screen.getAllByText("dummyTitle");
      fireEvent.click(btn[0]);
      await waitFor(() => {
        expect(screen.getByText("Powered by")).toBeInTheDocument();
        expect(btn[0]).toBeInTheDocument();
        expect(btn[0]).toBeInTheDocument();
        expect(mockFooterContext.navigator).toBeCalledWith("/page/terms");
      });
    });

    it("Should call window.open for external links", async () => {
      mockFooterContext.model.pageContextList = [{ title: "dummyTitle", link: "https://dummy.com", content: 'dummyContent' }];
      let sut = hostComponent(<WorkspaceFooterView dataContext={mockFooterContext} />, mockContainer, mockThemeService);
      const view = render(sut);
      window.open = jest.fn();

      expect(view).not.toBeNull();
      const btn = screen.getAllByText("dummyTitle");
      fireEvent.click(btn[0]);
      await waitFor(() => {
        expect(screen.getByText("Powered by")).toBeInTheDocument();
        expect(btn[0]).toBeInTheDocument();
        expect(btn[0]).toBeInTheDocument();
        expect(window.open).toBeCalledWith("https://dummy.com");
      });
    });
  });
});

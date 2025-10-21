import "reflect-metadata";
import { WorkspaceFooterViewModel } from "./WorkspaceFooterViewModel";
import { createMock } from "ts-auto-mock";
import { arrange, createMockThemeService } from "../../../../../testing";
import { IFooterConfigProvider } from "./IFooterConfigProvider";
import { IThemeService } from "@kinetix/core";

describe("Kinetixt Monza core", () => {
  let sut: WorkspaceFooterViewModel;
  let mockFooterConfig: IFooterConfigProvider;
  let mockThemeService : IThemeService;
  beforeEach(() => {
    mockThemeService = createMockThemeService(true);
    mockThemeService.Icons= [{name:"partners-logo"}]
    mockFooterConfig = createMock<IFooterConfigProvider>();
    arrange(mockFooterConfig).stubProperty("logo", () => "testLogo");
    sut = new WorkspaceFooterViewModel(mockFooterConfig,mockThemeService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("WorkspaceFooterViewModel", () => {
    it("Should populate correct values to model on initialize", async () => {
      let mockContext = { title: "dummyTitle", link: "/page/terms", content: 'dummyContent' };
      arrange(mockFooterConfig)
        .stubProperty("text", () => "testTitle")
        .stubProperty("logo", () => "dummyLogo")
        .stubMethod("getConfigs", () => {
          return Promise.resolve([mockContext]);
        });

      await sut.initialize();

      expect(sut.model).not.toBeNull();
      expect(sut.model.footerText).toBe("testTitle");
      expect(sut.model.logo).toBe("dummyLogo");
      expect(sut.model.pageContextList).toStrictEqual([{ title: "dummyTitle", link: "/page/terms", content: 'dummyContent' }]);
    });
  });
});

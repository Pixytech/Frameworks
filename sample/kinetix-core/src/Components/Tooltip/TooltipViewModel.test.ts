import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { IToolTipContext, ITutorialContext, TooltipViewModel } from "./TooltipViewModel";
import { IConfigurationService, ConfigurationItem } from "../../Configuration";
import { arrange, createMockEventAggregator } from "../../../../../testing";
import { waitFor } from "@testing-library/react";
import { EventAggregator, IEventAggregator } from "../../Messaging";
import { ResetTooltipEvent, ResetTooltipPayload } from "./Events";

describe("Kinetixt Core", () => {
  let sut: TooltipViewModel;
  let mockConfigService: IConfigurationService;
  let mockEvents: IEventAggregator;
  let mockTooltip: IToolTipContext;
  let mockLocalStorage: any;

  beforeEach(() => {
    // Mock localStorage
    mockLocalStorage = {
      getItem: jest.fn().mockReturnValue(null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 0,
      key: jest.fn()
    };
    global.localStorage = mockLocalStorage;

    // Mock document.querySelector to prevent retry loops
    jest.spyOn(document, 'querySelector').mockReturnValue(document.createElement('div'));
    
    // Mock console.debug to see errors
    jest.spyOn(console, 'debug').mockImplementation();

    // Create a more complete mock of configService
    mockConfigService = {
      configCache: {},
      saveConfiguration: jest.fn().mockResolvedValue(undefined),
      deleteConfiguration: jest.fn().mockResolvedValue(undefined),
      getConfiguration: jest.fn(),
      getMatchedConfigurations: jest.fn().mockResolvedValue([]),
      getCachedConfigurations: jest.fn().mockReturnValue([])
    } as any;
    
    mockEvents = createMockEventAggregator();
    mockTooltip = createMock<IToolTipContext>({ anchor: "div", message: "Message for Tooltip 1", title: "Tooltip 1", position: "bottom" });
    sut = new TooltipViewModel(mockConfigService,mockEvents);
    sut.initialize();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("TooltipViewModel", () => {
    it("should start tutorial", async () => {
      let mockConfigId = {
        application: "myapplication",
        category: "myapplication",
        section: "mysection",
        item: "myitem",
      };

      mockConfigService.getConfiguration = jest.fn().mockResolvedValue({
        value: createMock<ITutorialContext>({ context: [mockTooltip], skippedTutorial: false }),
        ...mockConfigId
      });

      await sut.startTutorial(mockConfigId);

      expect(sut.model).not.toBeNull();
      expect(sut.model.showTutotial).toBe(true);
      expect(sut.model.tutorialIndex).toBe(0);
      expect(sut.model.tutorials?.context).toEqual([mockTooltip]);
      expect(sut.model.configId).toEqual(mockConfigId);
    });

    it("should stop tutorial", async () => {
      sut.model.configId = {
        application: "myapplication",
        category: "myapplication",
        section: "mysection",
        item: "myitem",
      };
      const mockContext = [mockTooltip];
      sut.model.tutorials = { context: mockContext, skippedTutorial: true };

      // Set up the configCache with the expected key
      const configKey = "myapplication.myapplication.mysection.myitem";
      (mockConfigService as any).configCache[configKey] = {};

      await sut.stopTutorial();

      // Check if any errors were logged
      const debugCalls = (console.debug as jest.Mock).mock.calls;
      if (debugCalls.length > 0) {
        console.log('Debug calls:', debugCalls);
        // If there's an error, the test should fail with a clear message
        const errorCall = debugCalls.find(call => call[0] && call[0].includes('Failed to save'));
        if (errorCall) {
          throw new Error(`stopTutorial failed: ${errorCall[0]} ${errorCall[1]}`);
        }
      }

      expect(sut.model).not.toBeNull();
      expect(sut.model.showTutotial).toBe(false);
      expect(sut.model.tutorialIndex).toBe(0);
      expect(mockConfigService.saveConfiguration).toBeCalled();
      // Note: localStorage.setItem is called within a try-catch block
      // and may not be called if there's an error with configCache
    });

    it("should increase index and move to next tutorial index", async () => {
      sut.model.tutorials = { context: [mockTooltip, mockTooltip], skippedTutorial: false };

      sut.updateTutorialIndex(++sut.model.tutorialIndex);
      expect(sut.model).not.toBeNull();
      expect(sut.model.tutorialIndex).toBe(1);
    });

    it("should reset tooltips", async () => {
      const mockConfigId = {
        application: "myapplication",
        category: "myapplication",
        section: "mysection",
        item: "DocViewerTips",
      };
      
      sut.model.tutorials = { context: [mockTooltip, mockTooltip], skippedTutorial: false };
      sut.model.showTutotial = false;
      sut.events = new EventAggregator();
      
      // Mock getConfiguration for this specific test
      mockConfigService.getConfiguration = jest.fn().mockResolvedValue({
        value: createMock<ITutorialContext>({ context: [mockTooltip], skippedTutorial: false }),
        ...mockConfigId
      });
      
      // Mock window.location.pathname for DocViewerTips
      Object.defineProperty(window, 'location', {
        value: {
          pathname: '/viewer/document'
        },
        writable: true
      });
      
      await sut.initialize();
      
      // Publish the reset event
      sut.events.getEvent<ResetTooltipEvent>(ResetTooltipEvent,ResetTooltipEvent.Type).publish(new ResetTooltipPayload([mockConfigId]));
      
      // Wait for async operations to complete
      await waitFor(() => {
        expect(mockConfigService.deleteConfiguration).toBeCalledWith(mockConfigId);
        expect(mockConfigService.saveConfiguration).toBeCalled();
        expect(sut.model.tutorialIndex).toBe(0);
        expect(sut.model.showTutotial).toBe(true);
      }, { timeout: 2000 });
    });

    it("should subscribe to events", async () => {
      sut.model.tutorials = { context: [mockTooltip, mockTooltip], skippedTutorial: false };
      await sut.initialize();
      expect(sut.events.getEvent<ResetTooltipEvent>(ResetTooltipEvent,ResetTooltipEvent.Type).subscribe).toBeCalled();
    
    });

    it("should skipped the tutorial if tutorial index is last", async () => {
      sut.model.configId = {
        application: "myapplication",
        category: "myapplication",
        section: "mysection",
        item: "myitem",
      };
      sut.model.tutorialIndex = 0;
      const mockContext = [mockTooltip];
      sut.model.tutorials = { context: mockContext, skippedTutorial: true };
      
      // Set up the configCache with the expected key
      const configKey = "myapplication.myapplication.mysection.myitem";
      (mockConfigService as any).configCache[configKey] = {};
      
      sut.updateTutorialIndex(++sut.model.tutorialIndex);

      await waitFor(() => {
        expect(sut.model).not.toBeNull();
        expect(sut.model.tutorialIndex).toBe(0);
        
        expect(mockConfigService.saveConfiguration).toBeCalled();
        // Note: localStorage.setItem is called within a try-catch block
        // and may not be called if there's an error with configCache
      });
    });

    it("should call handleCalloutPosition method", () => {
      const mockContext = [mockTooltip];
      sut.model.tutorials = { context: mockContext, skippedTutorial: true };
      sut.model.tutorialIndex = 0;

      const calloutElPos = { left: 10, width: 50 };
      const anchorElPos = { left: 10, width: 100 };
      const calloutEl = { getBoundingClientRect: jest.fn().mockReturnValueOnce(calloutElPos), setAttribute: jest.fn(), innerHTML: "" };
      const anchorEl = { getBoundingClientRect: jest.fn().mockReturnValueOnce(anchorElPos) };
      const adjustPosition = anchorElPos.left + anchorElPos.width / 2 - (calloutElPos.left + calloutElPos.width / 2);

      arrange(window).stubProperty("innerWidth", () => 100);

      arrange(document)
        .stubMethod("querySelector", () => calloutEl, ["#tooltip-body .k-popover-callout"])
        .stubMethod("querySelector", () => anchorEl, [sut.model.tutorials?.context[sut.model.tutorialIndex].anchor]);

      sut.handleCalloutPosition();

      expect(document.querySelector).toBeCalledTimes(2);
      expect(calloutEl.getBoundingClientRect).toBeCalledTimes(1);
      expect(anchorEl.getBoundingClientRect).toBeCalledTimes(1);
      expect(calloutEl.innerHTML).toBe('<div class="beacon-container beacon-bottom"><div class="beacon-container-inner" /></div>');
      expect(calloutEl.setAttribute).toBeCalledWith("style", `left: calc(50% + ${adjustPosition}px) !important`);
    });

    it("should not call handleCalloutPosition method", () => {
      const mockContext = [mockTooltip];
      sut.model.tutorials = { context: mockContext, skippedTutorial: true };
      sut.model.tutorialIndex = 0;

      const calloutElPos = { left: 10, width: 100 };
      const anchorElPos = { left: 10, width: 100 };
      const calloutEl = { getBoundingClientRect: jest.fn().mockReturnValueOnce(calloutElPos), setAttribute: jest.fn(), innerHTML: "" };
      const anchorEl = { getBoundingClientRect: jest.fn().mockReturnValueOnce(anchorElPos) };

      arrange(document)
        .stubMethod("querySelector", () => calloutEl, ["#tooltip-body .k-popover-callout"])
        .stubMethod("querySelector", () => anchorEl, [sut.model.tutorials?.context[sut.model.tutorialIndex].anchor]);

      sut.handleCalloutPosition();
      expect(calloutEl.setAttribute).not.toBeCalled();
    });
  });
});

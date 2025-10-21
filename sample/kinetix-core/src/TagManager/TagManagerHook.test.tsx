import "reflect-metadata";
import React from "react";
import { IContainer, ITagLogger, ITagManagerService, useCreateTag } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { arrange, hostComponent } from "../../../../testing";
import { render } from "@testing-library/react";

const TestView = ({ data, logEvent }: { data?: { eventName: string; context: any; partyID: string }; logEvent?: () => void }) => {
  useCreateTag(data, logEvent);
  return <></>;
};

describe("Kinetix Monza Core", () => {
  let mockContainer: IContainer;
  let mockTagManagerLogger: ITagLogger;

  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockTagManagerLogger = createMock<ITagLogger>();

    arrange(mockContainer).stubMethod("build", () => createMock<ITagManagerService>({ Tag: mockTagManagerLogger }));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("TagManagerHook", () => {
    it("should call tag.createEvent when data is available", () => {
      const mockLogEvent = jest.fn();
      const sut = hostComponent(<TestView data={{ eventName: "test", context: { sectionTitle: "Test" }, partyID: "123" }} logEvent={mockLogEvent} />, mockContainer);
      const view = render(sut);

      expect(view).not.toBeNull();
      expect(mockTagManagerLogger.createEvent).toBeCalled();
    });

    it("should call logEvent when data is un-available", () => {
      const mockLogEvent = jest.fn();
      const sut = hostComponent(<TestView data={undefined} logEvent={mockLogEvent} />, mockContainer);
      const view = render(sut);

      expect(view).not.toBeNull();
      expect(mockLogEvent).toBeCalled();
    });

    it("should throw error log", () => {
      const mockLogError = jest.fn(() => {
        throw new Error("Invthrowalid Data");
      });
      const sut = hostComponent(<TestView data={undefined} logEvent={mockLogError} />, mockContainer);
      const view = render(sut);

      expect(view).not.toBeNull();
      expect(mockLogError).toBeCalled();
    });
  });
});

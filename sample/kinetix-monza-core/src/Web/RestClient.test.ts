// reflect-metadata is required for IOC
import "reflect-metadata";
import { ApiResponseType, ApplicationModel, IApplication, IAuthenticationService, INotificationService, NotificationModel } from "@kinetix/core";
import { waitFor } from "@testing-library/react";
import { createMock } from "ts-auto-mock";
import { RestClient } from "./RestClient";
import { arrange, mockFetch } from "../../../../testing";

interface IData {
  content: string;
}

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: RestClient;
  let mockAuthService: IAuthenticationService;
  let mockNotificationService: INotificationService;
  let mockApplication: IApplication;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockAuthService = createMock<IAuthenticationService>();
    mockNotificationService = createMock<INotificationService>({ model: new NotificationModel() });
    mockApplication = createMock<IApplication>({ model: new ApplicationModel() });
    sut = new RestClient(mockAuthService, mockNotificationService, mockApplication);
    arrange(mockAuthService).stubMethod("GetParsedToken", () => {
      return {
        jti: "testJti",
      };
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("RestClient", () => {
    it("should get json contents if response type is not provided", async () => {
      mockFetch<IData>({ content: "testData" });
      sut.get<IData>("someUrl").subscribe((x) => {
        expect(x.content).toBe("testData");
      });
    });

    it("should throw exception on server Failure", async () => {
      mockFetch<any>({ status: "Failure", description: "SOmeError" });
      sut.get<IData>("someUrl", ApiResponseType.Json).subscribe(
        (x) => {},
        (e:Error) => {
          expect(e.message).toBe("Server Failure : SOmeError");
          expect(mockNotificationService.raise).toBeCalled();
        }
      );
    });

    it("should get binary contents if response type is Binary", async () => {
      arrange(window).stubMethod("fetch", () => {
        return Promise.resolve({ blob: () => Promise.resolve("blob"), status: 200, ok: true });
      });
      sut.get<IData>("someUrl", ApiResponseType.Binary).subscribe((x) => {
        expect(x).toBe("blob");
      });
    });

    it("get should notify error", async () => {
      arrange(window).stubMethod("fetch", () => {
        return Promise.reject("error Processing request");
      });
      sut.get<IData>("someUrl", ApiResponseType.Binary).subscribe(
        (x) => {},
        (e) => {
          expect(e).toBe("error Processing request");
          expect(mockNotificationService.raise).toBeCalled();
        }
      );
    });

    it("put should notify error", async () => {
      arrange(window).stubMethod("fetch", () => {
        return Promise.reject("error Processing request");
      });
      sut.put<any, any>("someUrl", {}).subscribe(
        (x) => {},
        (e) => {
          expect(e).toBe("error Processing request");
          expect(mockNotificationService.raise).toBeCalled();
        }
      );
    });

    it("post should notify error", async () => {
      arrange(window).stubMethod("fetch", () => {
        return Promise.reject("error Processing request");
      });
      sut.post<any, any>("someUrl", {}).subscribe(
        (x) => {},
        (e) => {
          expect(e).toBe("error Processing request");
          expect(mockNotificationService.raise).toBeCalled();
        }
      );
    });

    it("patch should notify error", async () => {
      arrange(window).stubMethod("fetch", () => {
        return Promise.reject("error Processing request");
      });
      sut.patch<any, any>("someUrl", {}).subscribe(
        (x) => {},
        (e) => {
          expect(e).toBe("error Processing request");
          expect(mockNotificationService.raise).toBeCalled();
        }
      );
    });

    it("delete should notify error", async () => {
      arrange(window).stubMethod("fetch", () => {
        return Promise.reject("error Processing request");
      });
      sut.delete("someUrl").subscribe(
        (x) => {},
        (e) => {
          expect(e).toBe("error Processing request");
          expect(mockNotificationService.raise).toBeCalled();
        }
      );
    });

    it("should get binary contents if response type is Text", async () => {
      arrange(window).stubMethod("fetch", () => {
        return Promise.resolve({ text: () => Promise.resolve("sampleText"), status: 200, ok: true });
      });
      sut.get<IData>("someUrl", ApiResponseType.Text).subscribe((x) => {
        expect(x).toBe("sampleText");
      });
    });

    it("post should return json contents", async () => {
      mockFetch<IData>({ content: "response" });
      sut.post<IData, IData>("someUrl", { content: "request" }).subscribe((x) => {
        expect(x.content).toBe("response");
      });
    });

    it("post should get binary contents if response type is Binary", async () => {
      arrange(window).stubMethod("fetch", () => {
        return Promise.resolve({ blob: () => Promise.resolve("blob"), status: 200, ok: true });
      });
      sut.post<IData, IData>("someUrl", { content: "request" }, ApiResponseType.Binary).subscribe((x) => {
        expect(x).toBe("blob");
      });
    });

    it("put should return json contents", async () => {
      mockFetch<IData>({ content: "response" });
      sut.put<IData, IData>("someUrl", { content: "request" }).subscribe((x) => {
        expect(x.content).toBe("response");
      });
    });

    it("patch should return json contents", async () => {
      mockFetch<IData>({ content: "response" });
      sut.patch<IData, IData>("someUrl", { content: "request" }).subscribe((x) => {
        expect(x.content).toBe("response");
      });
    });

    it("post should return json contents", async () => {
      mockFetch<IData>({ content: "response" });
      let mockCallback = jest.fn();
      sut.delete("someUrl").subscribe(() => {
        mockCallback();
      });

      await waitFor(() => {
        expect(mockCallback).toBeCalled();
      });
    });
  });
});

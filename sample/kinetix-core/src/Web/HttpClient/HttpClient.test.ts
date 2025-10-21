// reflect-metadata is required for IOC
import "reflect-metadata";
import { HttpClient, HttpRequest, HttpResponse, IHttpInterceptor } from "..";
import { createMock } from "ts-auto-mock";
import { mockFetch } from "../../../../../testing";
import { firstValueFrom } from "rxjs";

// Base Package
describe("Kinetix Core", () => {
  // Testing Component
  let sut: HttpClient;
  let mockRequestInterceptors: IHttpInterceptor<HttpRequest>[];
  let mockResponseInterceptors: IHttpInterceptor<HttpResponse>[];
  beforeEach(() => {
    mockRequestInterceptors = createMock<IHttpInterceptor<HttpRequest>[]>();
    mockResponseInterceptors = createMock<IHttpInterceptor<HttpResponse>[]>();

    sut = new HttpClient(mockRequestInterceptors, mockResponseInterceptors);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
  describe("HttpClient", () => {
    it("http get", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      const prepareRequest = jest.fn().mockImplementation((r) => r);
      const result = await firstValueFrom(sut.get("https://some-server/get/some-get", {}, prepareRequest));
      expect(result.json()).not.toBeNull();
      expect(prepareRequest).toBeCalled();
    });

    it("http post", async () => {
      let testValue = { default: "test" };
      mockFetch(testValue);
      const prepareRequest = jest.fn().mockImplementation((r) => r);
      const result = await firstValueFrom(sut.post("https://some-server/get/some-get", {}, prepareRequest));
      expect(prepareRequest).toBeCalled();
      expect(result.json()).not.toBeNull();
    });

    it("http put", async () => {
      let testValue = { default: "test" };
      const prepareRequest = jest.fn().mockImplementation((r) => r);
      mockFetch(testValue);
      const result = await firstValueFrom(sut.put("https://some-server/get/some-get", {}, prepareRequest));
      expect(result.json()).not.toBeNull();
      expect(prepareRequest).toBeCalled();
    });

    it("http patch", async () => {
      let testValue = { default: "test" };
      const prepareRequest = jest.fn().mockImplementation((r) => r);
      mockFetch(testValue);
      const result = await firstValueFrom(sut.patch("https://some-server/get/some-get", {}, prepareRequest));
      expect(result.json()).not.toBeNull();
      expect(prepareRequest).toBeCalled();
    });

    it("http delete", async () => {
      let testValue = { default: "test" };
      const prepareRequest = jest.fn().mockImplementation((r) => r);
      mockFetch(testValue);
      const result = await firstValueFrom(sut.delete("https://some-server/get/some-get", {}, prepareRequest));
      expect(result.json()).not.toBeNull();
      expect(prepareRequest).toBeCalled();
    });
  });
});

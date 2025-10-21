import "reflect-metadata";
import { AuthenticationService, IKeycloakFactory } from "..";
import { arrange, createMockLocation, mockFetch } from "../../../../testing";
import Keycloak, { KeycloakError, KeycloakInitOptions, KeycloakPromise } from "keycloak-js";
import { createMock } from "ts-auto-mock";
import { fireEvent, waitFor } from "@testing-library/react";

describe("Authentication Service", () => {
  let sut: AuthenticationService;
  let mockKeyCloakFactory: IKeycloakFactory;
  let mockKeyCloakClient: Keycloak;

  beforeEach(async () => {
    mockKeyCloakFactory = createMock<IKeycloakFactory>();
    mockKeyCloakClient = createMock<Keycloak>();
    mockKeyCloakClient.onTokenExpired = jest.fn();
    arrange(mockKeyCloakFactory).stubMethod("getClient", () => mockKeyCloakClient);
    sut = new AuthenticationService(mockKeyCloakFactory);
    let NonAuthRoutes = ["/noRoute"];
    const mockLocation = createMock<Location>({
      pathname: "/TESTPATH",
    });
    arrange(window).stubProperty("location", () => mockLocation);
    sut.model.nonAuthRoutes = NonAuthRoutes;
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should initialize the service ", async () => {
    await sut.initialize();
    expect(mockKeyCloakClient.onTokenExpired).toBeDefined();
    expect(mockKeyCloakClient.init).toBeCalledWith({ onLoad: "login-required", checkLoginIframe: false });
  });

  it("on initialize if user not authenticate the doLogout to call login page", async () => {
    arrange(mockKeyCloakClient).stubMethod("init", async () => {
      return false;
    });

    await sut.initialize();

    expect(mockKeyCloakClient.onTokenExpired).toBeDefined();
    expect(mockKeyCloakClient.init).toBeCalledWith({ onLoad: "login-required", checkLoginIframe: false });
    expect(mockKeyCloakClient.logout).toBeCalledWith(undefined);
  });

  it("should logout", async () => {
    arrange(mockKeyCloakClient).stubProperty("idTokenParsed", () => {
      return { test: "123" };
    });

    await sut.initialize();
    let token = sut.GetParsedToken();
    await sut.DoLogout({ redirectUri: "someUri" });

    expect(mockKeyCloakClient.logout).toBeCalledWith({ redirectUri: "someUri" });
    expect(token).toEqual({ test: "123" });
  });

  it("should logout using custom logout", async () => {

    sut.createLogoutUrl = jest.fn();
    arrange(mockKeyCloakClient).stubProperty("idTokenParsed", () => {
      return { test: "123" };
    });

    await sut.initialize();
    let token = sut.GetParsedToken();
    
    mockKeyCloakClient.createLogoutUrl({ redirectUri: "someUri" })
    expect(sut.createLogoutUrl).toBeCalledWith({ redirectUri: "someUri" });
  });

  it("should provide login status", async () => {
    await sut.initialize();
    await sut.DoLogout({ redirectUri: "someUri" });
    expect(mockKeyCloakClient.logout).toBeCalledWith({ redirectUri: "someUri" });
  });

  it("should update keyclock state from window message when user changed", async () => {
    mockKeyCloakClient.idTokenParsed = { sub: "initialUser" };
    await sut.initialize();
    mockKeyCloakClient.idTokenParsed = { sub: "userchanged" };

    const mockInit = mockKeyCloakClient.init as any as jest.Mock<KeycloakPromise<boolean, KeycloakError>, [KeycloakInitOptions]>;

    await waitFor(() => {
      expect(mockInit.mock.calls).toEqual([[{ checkLoginIframe: false, onLoad: "login-required" }]]);
    });
  });

  it("should update token on expired", async () => {
    await sut.initialize();

    arrange(mockKeyCloakClient).stubMethod("updateToken", () => true);
    if (mockKeyCloakClient.onTokenExpired) {
      mockKeyCloakClient.onTokenExpired();
    }

    await waitFor(() => expect(mockKeyCloakClient.updateToken).toBeCalledWith(20));
  });

  it("should relogin on update token on expired", async () => {
    await sut.initialize();

    arrange(mockKeyCloakClient).stubMethod("updateToken", () => false);
    if (mockKeyCloakClient.onTokenExpired) {
      mockKeyCloakClient.onTokenExpired();
    }

    await waitFor(() => expect(mockKeyCloakClient.updateToken).toBeCalledWith(20));
    expect(sut.keycloak.logout).toBeCalledWith(undefined);
  });

  it("should relogin on update token error", async () => {
    console.error = jest.fn();
    await sut.initialize();

    arrange(mockKeyCloakClient).stubMethod("updateToken", () => {
      throw new Error("Can't renew token");
    });
    if (mockKeyCloakClient.onTokenExpired) {
      mockKeyCloakClient.onTokenExpired();
    }

    await waitFor(() => expect(mockKeyCloakClient.updateToken).toBeCalledWith(20));
    expect(sut.keycloak.logout).toBeCalledWith(undefined);
    expect(console.error).toBeCalled();
  });

  it("should return login status based on token", async () => {
    mockKeyCloakClient.idToken = "SomeToen";
    await sut.initialize();
    expect(sut.IsLoggedIn()).toBeTruthy();
  });

  it("should get default GetUserId", async () => {
    await sut.initialize();
    expect(sut.GetUserId()).toEqual("unknown");
  });

  it("should get keyclock factory", async () => {
    expect(sut.clientFactory).toBeDefined();
  });

  it("should GetUserId prefered user name", async () => {
    await sut.initialize();
    mockKeyCloakClient.idTokenParsed = { preferred_username: "SomeName" };
    expect(sut.GetUserId()).toEqual("SomeName");
  });

  it("should have token hint on logout url", async () => {
    (mockKeyCloakClient as any)["endpoints"] = {
      logout: () => {
        return "-";
      },
    };
    await sut.initialize();
    let url = sut.keycloak.createLogoutUrl();
    expect(url).toContain("id_token_hint");
  });

  it("should get default GetUsername", async () => {
    await sut.initialize();
    expect(sut.GetUsername()).toEqual("Unknown");
  });

  it("should GetUsername preferred user name", async () => {
    await sut.initialize();
    mockKeyCloakClient.idTokenParsed = { name: "SomeName" };
    expect(sut.GetUsername()).toEqual("SomeName");
  });
});

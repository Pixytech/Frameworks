import "reflect-metadata";
import { KeycloakFactory } from "..";
import { mockFetch } from "../../../../testing";

describe("Kinetix Core", () => {
  describe("KeycloakFactory", () => {
    let sut: KeycloakFactory;
    beforeEach(async () => {
      mockFetch(
        {
          realm: "KEYCLOAK_REALM",
          url: "/KEYCLOAK_URL",
          clientId: "KEYCLOAK_CLIENT",
        },
        ["/desktop/keycloak.json"]
      );
      sut = new KeycloakFactory();
    });

    afterEach(() => {
      jest.resetAllMocks();
    });

    it("should get keyclock client", async () => {
      const client = await sut.getClient();
      expect(client).toBeDefined();
    });
  });
});

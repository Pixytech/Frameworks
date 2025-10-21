import Keycloak from "keycloak-js";
export const IKeycloakFactoryType = Symbol.for("IKeycloakFactory");

export interface IKeycloakFactory {
  getClient(): Promise<Keycloak>;
}

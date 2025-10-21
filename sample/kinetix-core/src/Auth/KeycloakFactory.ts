import Keycloak from "keycloak-js";
import { IKeycloakFactory } from "./IKeycloakFactory";

export class KeycloakFactory implements IKeycloakFactory {
  async getClient(): Promise<Keycloak> {
    let response = await fetch("/desktop/keycloak.json");
    let responseJson = await response.json();
    return new Keycloak(responseJson);
  }
}

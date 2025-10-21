import { KeycloakLogoutOptions } from "keycloak-js";
import { IViewModelBase } from "../Mvvm";
import { IKeycloakFactory } from "./IKeycloakFactory";
import { Observable } from "rxjs";

export class AuthenticationModel {
  nonAuthRoutes: string[] = [];
}

export interface IAuthToken {
  sub?: string;
  [key: string]: any;
}

export interface AccessTokenRenew{
  state:'started' | 'renewed'
}

export interface IAuthenticationService extends IViewModelBase<AuthenticationModel> {
  accessTokenRenew :Observable<AccessTokenRenew>;
  autoRefreshToken:boolean;
  clientFactory: IKeycloakFactory;
  createLogoutUrl?:(options?: KeycloakLogoutOptions)=> string;
  GetUsername(): string;
  GetUserId(): string;
  GetParsedToken(): IAuthToken | undefined;
  IsLoggedIn(): boolean;
  DoLogout(options?: { redirectUri: string }): Promise<void>;
  UpdateToken(): Promise<void>;
}

export const IAuthenticationServiceType = Symbol.for("IAuthenticationService");

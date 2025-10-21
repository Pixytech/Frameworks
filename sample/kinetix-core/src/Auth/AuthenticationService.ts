import Keycloak, { KeycloakInitOptions, KeycloakLogoutOptions } from "keycloak-js";
import { AccessTokenRenew, AuthenticationModel, IAuthToken, IAuthenticationService } from "./IAuthenticationService";
import { INavigationAware, ViewModelBase } from "../Mvvm";
import { Params, NavigateFunction, Location } from "react-router-dom";
import { IocInject } from "../IoC";
import { KeycloakFactory } from "./KeycloakFactory";
import { IKeycloakFactoryType } from "./IKeycloakFactory";
import type { IKeycloakFactory } from "./IKeycloakFactory";
import { ITagManager } from "../TagManager/ITagManager";
import { Observable, Subject } from "rxjs";

export class AuthenticationService extends ViewModelBase<AuthenticationModel> implements IAuthenticationService, INavigationAware {
  QueryParams: Readonly<Params<string>>;
  navigator: NavigateFunction;
  location: Location;
  /**
 * @deprecated The method should not be used. inject the auth service instead or use IApplicationCache or metadataProvide.appState.
 */
  public static Instance = new AuthenticationService(new KeycloakFactory());
  public keycloak: Keycloak;
  loginUrl: string;
  logoutUrl: string;
  keyclockFactory: IKeycloakFactory;
  tagManager: ITagManager;
  private readonly accessTokenRenewSubject = new Subject<AccessTokenRenew>();
  autoRefreshToken: boolean = true;

  createLogoutUrl?: (options?: KeycloakLogoutOptions) => string = undefined;

  constructor(@IocInject(IKeycloakFactoryType) keyclockFactory: IKeycloakFactory) {
    super();
    this.keyclockFactory = keyclockFactory;
  }
  
  public get accessTokenRenew(): Observable<AccessTokenRenew>{
    return this.accessTokenRenewSubject.asObservable();
  }

  public get clientFactory(): IKeycloakFactory {
    return this.keyclockFactory;
  }

  protected createModel(): AuthenticationModel {
    return new AuthenticationModel();
  }

  protected async onInitializeOnce(): Promise<void> {
    this.keycloak = await this.keyclockFactory.getClient();

    console.debug("AuthenticationService - Starting authentication");

    this.keycloak.onTokenExpired = async () => {
      console.debug("AuthenticationService -  onTokenExpired - autoRefreshToken", this.autoRefreshToken);
      if(this.autoRefreshToken)
        {
          await this.UpdateToken();
        }
    };

    console.debug("AuthenticationService - Initialize auth service");
    if (!this.model.nonAuthRoutes.some((path) => window.location.pathname.startsWith(path))) {
      await this.initKeyclock({
        checkLoginIframe: false,
        onLoad: "login-required",
      });
    }
  }

  private async initKeyclock(initOptions: KeycloakInitOptions): Promise<void> {
    let authenticated = await this.keycloak.init(initOptions);

    if (!authenticated) {
      this.DoLogout();
    } else {
      let kc: any = this.keycloak;
      const authProvider: IAuthenticationService = this;
      const logoutURLPart = "?id_token_hint=" + this.keycloak.idToken + "&post_logout_redirect_uri=" ;
      this.keycloak.createLogoutUrl = function (options) {
        let redirect= options?.redirectUri;
        if(!redirect){
          redirect = window.location.href;
        }
        console.debug("AuthenticationService - createLogoutUrl redirect",redirect);
        const logoutUrl = authProvider.createLogoutUrl ? authProvider.createLogoutUrl(options) : kc.endpoints.logout() + logoutURLPart + encodeURIComponent(redirect);
        console.debug("AuthenticationService - createLogoutUrl",logoutUrl);
        return logoutUrl;
      };
    }
  }

  async DoLogout(options?: { redirectUri: string }) {
    await this.keycloak.logout(options);
  }

  GetParsedToken(): IAuthToken | undefined {
    return this.keycloak.idTokenParsed;
  }

  IsLoggedIn(): boolean {
    return this.keycloak.idToken !== undefined;
  }

  async UpdateToken() {
    console.debug("AuthenticationService - Attempt to update access token");
    let refreshed: boolean = false;
    try {
      this.accessTokenRenewSubject.next({state:'started'});
      refreshed = await this.keycloak.updateToken(20);
      if (refreshed) {
        console.debug("AuthenticationService - access token refreshed " + new Date());
      } else {
        console.debug("AuthenticationService - access token expired " + new Date());
      }
    } catch (e: any) {
      console.error("AuthenticationService - Error while refreshing access token - possiblly invalid refresh_token " + new Date(), e);
    } finally {
      if (!refreshed) {
        this.DoLogout();
      }else{
        this.accessTokenRenewSubject.next({state:'renewed'});
      }
    }
  }

  GetUsername(): string {
    return this.keycloak.idTokenParsed?.name ? this.keycloak.idTokenParsed?.name : "Unknown";
  }

  GetUserId(): string {
    return this.keycloak.idTokenParsed?.preferred_username ? this.keycloak.idTokenParsed.preferred_username : "unknown";
  }
}

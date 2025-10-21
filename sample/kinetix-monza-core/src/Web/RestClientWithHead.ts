import { IocInjectable, IocInject, IRestClientWithHead, IAuthenticationServiceType, INotificationServiceType, IApplicationType, type IAuthenticationService, type INotificationService, type IApplication } from "@kinetix/core";
import { Observable } from "rxjs";
import { RestClient } from "./RestClient";

/**
 * Extended REST client implementation that includes HEAD request support
 * Inherits all functionality from RestClient and adds HEAD method
 */
@IocInjectable()
export class RestClientWithHead extends RestClient implements IRestClientWithHead {
  constructor(
    @IocInject(IAuthenticationServiceType) authService: IAuthenticationService,
    @IocInject(INotificationServiceType) notificationService: INotificationService,
    @IocInject(IApplicationType) application: IApplication
  ) {
    super(authService, notificationService, application);
  }

  /**
   * Performs a HEAD request to retrieve response headers without the body
   * Useful for checking resource existence, freshness, and metadata
   */
  head(url: string, onBeforeSend: (request: RequestInit) => RequestInit = (r) => r): Observable<Response> {
    return new Observable<Response>((observer) => {
      const token = this.authService.GetParsedToken();
      const headers = {
        'AuthToken': token?.jti || '',
        'Content-Type': 'application/json'
      };
      
      fetch(url, onBeforeSend({ 
        method: 'HEAD',
        headers: headers
      }))
        .then(response => {
          observer.next(response);
          observer.complete();
        })
        .catch(error => {
          this.publishError(error);
          observer.error(error);
        });
    });
  }
}
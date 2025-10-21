import { HttpClient, HttpRequest, IHttpInterceptor, IRestClient, IAuthenticationServiceType, IocInject, IocInjectable, ApiResponseType, INotificationServiceType, NotificationSeverity, type IApplication, IApplicationType, IndicatorColor, type IAuthenticationService, type INotificationService, NotificationToast, NotificationCategory } from "@kinetix/core";
import { catchError, mergeMap, Observable, throwError } from "rxjs";

@IocInjectable()
export class RestClient implements IRestClient {
  httpClient: HttpClient;
  authService: IAuthenticationService;
  notificationService: INotificationService;
  application: IApplication;
  constructor(@IocInject(IAuthenticationServiceType) authService: IAuthenticationService, @IocInject(INotificationServiceType) notificationService: INotificationService, @IocInject(IApplicationType) application: IApplication) {
    this.authService = authService;
    this.application = application;
    this.notificationService = notificationService;
    this.httpClient = new HttpClient([new MonzaRestRequestInterceptor(authService)]);
  }

  get<T>(url: string, responseType: ApiResponseType = ApiResponseType.Json, onBeforeSend: (request: RequestInit) => RequestInit = (r) => r): Observable<T> {
    return this.httpClient.get(url, {}, onBeforeSend).pipe(
      mergeMap((response) => {
        switch (responseType) {
          case ApiResponseType.Text:
            return response.text();
          case ApiResponseType.Binary:
            return response.blob();
          case ApiResponseType.Json:
          default:
            return response.json();
        }
      }),
      catchError((error: Error) => {
        this.publishError(error);
        return throwError(() => error);
      })
    );
  }

  protected async publishError(error: Error): Promise<void> {
    this.notificationService.raise({
      title: `Network Error`,
      body: error.message,
      toast: NotificationToast.Transient,
      data: { error: error },
      severity: NotificationSeverity.High,
      stream: {
        category: `${NotificationCategory.NetworkError}`,
        type: "System",
      },
      indicator: {
        color: IndicatorColor.Red,
      },
    });
  }

  post<T, R>(url: string, request: T, responseType: ApiResponseType = ApiResponseType.Json, onBeforeSend: (request: RequestInit) => RequestInit = (r) => r): Observable<R> {
    return this.httpClient.post(url, { body: request }, onBeforeSend).pipe(
      mergeMap((response) => {
        switch (responseType) {
          case ApiResponseType.Text:
            return response.text();
          case ApiResponseType.Binary:
            return response.blob();
          case ApiResponseType.Json:
          default:
            return response.json();
        }
      }),
      catchError((error: Error) => {
        this.publishError(error);
        return throwError(() => error);
      })
    );
  }

  put<T, R>(url: string, request: T, onBeforeSend: (request: RequestInit) => RequestInit = (r) => r): Observable<R> {
    return this.httpClient.put(url, { body: request }, onBeforeSend).pipe(
      mergeMap((response) => response.json()),
      catchError((error: Error) => {
        this.publishError(error);
        return throwError(() => error);
      })
    );
  }

  patch<T, R>(url: string, request: T, onBeforeSend: (request: RequestInit) => RequestInit = (r) => r): Observable<R> {
    return this.httpClient.patch(url, { body: request }, onBeforeSend).pipe(
      mergeMap((response) => response.json()),
      catchError((error: Error) => {
        this.publishError(error);
        return throwError(() => error);
      })
    );
  }

  delete<T, R>(url: string, request?: T, onBeforeSend: (request: RequestInit) => RequestInit = (r) => r): Observable<R> {
    return this.httpClient.delete(url, { body: request }, onBeforeSend).pipe(
      mergeMap((response) => response.json()),
      catchError((error: Error) => {
        this.publishError(error);
        return throwError(() => error);
      })
    );
  }
}

export class MonzaRestRequestInterceptor implements IHttpInterceptor<HttpRequest> {
  authService: IAuthenticationService;
  constructor(authService: IAuthenticationService) {
    this.authService = authService;
  }
  intercept(request: HttpRequest): HttpRequest {
    let token = this.authService.GetParsedToken();
    const newRequest = request.clone();
    newRequest.headers = {
      ...request.headers,
      AuthToken: token?.jti,
      "Content-Type": "application/json",
    };
    return newRequest;
  }
}

import "whatwg-fetch";
import { from, Observable, map } from "rxjs";
import { RequestMapper } from "./Mappers/RequestMapper";
import { checkHttpStatus } from "./Operators/checkHttpStatus";
import { HttpRequestConfigurations } from "./Types/HttpRequestConfigurations";
import { IHttpInterceptor } from "./Types/IHttpInterceptor";
import { HttpInterceptors } from "./Types/HttpInterceptors";
import { HttpRequestConfig } from "./Types/HttpRequestConfig";
import { HttpRequest } from "./Types/HttpRequest";
import { HttpResponse } from "./Types/HttpResponse";
import { IHttp } from "./Types/IHttp";

export class HttpClient implements IHttp {
  private readonly _reqInterceptors: HttpInterceptors<HttpRequest>;
  private readonly _resInterceptors: HttpInterceptors<HttpResponse>;

  constructor(reqInterceptors: IHttpInterceptor<HttpRequest>[] = [], resInterceptors: IHttpInterceptor<HttpResponse>[] = []) {
    this._reqInterceptors = new HttpInterceptors<HttpRequest>(reqInterceptors);
    this._resInterceptors = new HttpInterceptors<HttpResponse>(resInterceptors);
  }

  public get(uri: string, config: Partial<HttpRequestConfig> = {}, onBeforeSend: (request: RequestInit) => RequestInit = (r) => r): Observable<HttpResponse> {
    //don't encode uri as it have data included in uri
    const url = uri;
    const request = this._reqInterceptors.execute(new HttpRequest(url, config));
    const configObject: RequestInit = RequestMapper.for(request, HttpRequestConfigurations.GET);
    return from(fetch(url, onBeforeSend(configObject))).pipe(
      map((res) => this._resInterceptors.execute(new HttpResponse(res as any))),
      checkHttpStatus()
    );
  }

  public post(uri: string, config: Partial<HttpRequestConfig>, onBeforeSend: (request: RequestInit) => RequestInit): Observable<HttpResponse> {
    const url = encodeURI(uri);
    const request = this._reqInterceptors.execute(new HttpRequest(url, config));
    const configObject: RequestInit = RequestMapper.for(request, HttpRequestConfigurations.POST);

    return from(fetch(url, onBeforeSend(configObject))).pipe(
      map((res) => this._resInterceptors.execute(new HttpResponse(res as any))),
      checkHttpStatus()
    );
  }

  public put(uri: string, config: Partial<HttpRequestConfig>, onBeforeSend: (request: RequestInit) => RequestInit): Observable<HttpResponse> {
    const url = encodeURI(uri);
    const request = this._reqInterceptors.execute(new HttpRequest(url, config));
    const configObject: RequestInit = RequestMapper.for(request, HttpRequestConfigurations.PUT);

    return from(fetch(url, onBeforeSend(configObject))).pipe(
      map((res) => this._resInterceptors.execute(new HttpResponse(res as any))),
      checkHttpStatus()
    );
  }

  public patch(uri: string, config: Partial<HttpRequestConfig>, onBeforeSend: (request: RequestInit) => RequestInit): Observable<HttpResponse> {
    const url = encodeURI(uri);
    const request = this._reqInterceptors.execute(new HttpRequest(url, config));
    const configObject: RequestInit = RequestMapper.for(request, HttpRequestConfigurations.PATCH);

    return from(fetch(url, onBeforeSend(configObject))).pipe(
      map((res) => this._resInterceptors.execute(new HttpResponse(res as any))),
      checkHttpStatus()
    );
  }

  public delete(uri: string, config: Partial<HttpRequestConfig>, onBeforeSend: (request: RequestInit) => RequestInit): Observable<HttpResponse> {
    const url = encodeURI(uri);
    const request = this._reqInterceptors.execute(new HttpRequest(url, config));
    const configObject: RequestInit = RequestMapper.for(request, HttpRequestConfigurations.DELETE);

    return from(fetch(url, onBeforeSend(configObject))).pipe(
      map((res) => this._resInterceptors.execute(new HttpResponse(res as any))),
      checkHttpStatus()
    );
  }
}

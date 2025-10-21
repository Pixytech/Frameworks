import { Observable } from "rxjs";
import { HttpRequestConfig } from "./HttpRequestConfig";
import { HttpRequestConfigurations } from "./HttpRequestConfigurations";
import { HttpResponse } from "./HttpResponse";

export interface IHttp {
  get(url: HttpRequestConfigurations, config: HttpRequestConfig, onBeforeSend: (request: RequestInit) => RequestInit): Observable<HttpResponse>;
  post(url: HttpRequestConfigurations, config: HttpRequestConfig, onBeforeSend: (request: RequestInit) => RequestInit): Observable<HttpResponse>;
  put(url: HttpRequestConfigurations, config: HttpRequestConfig, onBeforeSend: (request: RequestInit) => RequestInit): Observable<HttpResponse>;
  patch(url: HttpRequestConfigurations, config: HttpRequestConfig, onBeforeSend: (request: RequestInit) => RequestInit): Observable<HttpResponse>;
  delete(url: HttpRequestConfigurations, config: HttpRequestConfig, onBeforeSend: (request: RequestInit) => RequestInit): Observable<HttpResponse>;
}

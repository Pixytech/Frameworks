import { Observable } from "rxjs";
export enum ApiResponseType {
  Json,
  Binary,
  Text,
}
export const IRestClientType = Symbol.for("IRestClientType");

export interface IRestClient {
  get<T>(url: string, responseType?: ApiResponseType, onBeforeSend?: (request: RequestInit) => RequestInit): Observable<T>;
  post<T, R>(url: string, request: T, responseType?: ApiResponseType, onBeforeSend?: (request: RequestInit) => RequestInit): Observable<R>;
  put<T, R>(url: string, request: T, onBeforeSend?: (request: RequestInit) => RequestInit): Observable<R>;
  patch<T, R>(url: string, request: T, onBeforeSend?: (request: RequestInit) => RequestInit): Observable<R>;
  delete<T, R>(url: string, request?: T, onBeforeSend?: (request: RequestInit) => RequestInit): Observable<R>;
}

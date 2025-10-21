import { cloneDeep } from "lodash";
import { urlRegex } from "../Helpers/UrlRegex";
import { HttpRequestConfig } from "./HttpRequestConfig";
export interface IHeaders {
  [key: string]: any;
}

export class HttpRequest {
  public url: string;
  public mode: RequestMode | undefined;
  public cache: RequestCache | undefined;
  public credentials: RequestCredentials | undefined;
  public redirect: RequestRedirect | undefined;
  public referrer: string | undefined;
  public body: any;

  private _headers: IHeaders;

  constructor(url: string, config: Partial<HttpRequestConfig>) {
    this.url = new RegExp(urlRegex).test(url)
      ? url
      : `${window.location.origin}${url}`;
    this.mode = config.mode || undefined;
    this.cache = config.cache || undefined;
    this.credentials = config.credentials || undefined;
    this.headers = config.headers || {};
    this.redirect = config.redirect || undefined;
    this.referrer = config.referrer || undefined;
    this.body = config.body || undefined;
  }

  public get headers(): { [headerName: string]: string } {
    return this._headers;
  }

  public set headers(headers: { [headerName: string]: string }) {
    if (headers.hasOwnProperty("Content-Type")) {
      this._headers = headers;
    } else {
      this._headers = {
        ...headers,
      };
    }
  }

  public clone(): HttpRequest {
    return cloneDeep(this);
  }
}

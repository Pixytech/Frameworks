import { Observable } from "rxjs";
import { IRestClient } from "./IRestClient";

export const IRestClientWithHeadType = Symbol.for("IRestClientWithHeadType");

/**
 * Extended REST client interface that includes HEAD request support
 * Used for resource validation and checking resource freshness
 */
export interface IRestClientWithHead extends IRestClient {
  /**
   * Performs a HEAD request to the specified URL
   * @param url The URL to send the HEAD request to
   * @param onBeforeSend Optional callback to modify the request before sending
   * @returns Observable<Response> containing the response headers
   */
  head(url: string, onBeforeSend?: (request: RequestInit) => RequestInit): Observable<Response>;
}
import { concatMap, Observable, of, OperatorFunction, throwError } from "rxjs";
import { HttpResponse } from "../Types/HttpResponse";

export function checkHttpStatus(): OperatorFunction<HttpResponse, HttpResponse> {
  return function (source: Observable<HttpResponse>): Observable<HttpResponse> {
    return source.pipe(
      concatMap((res) => {
        return res.ok ? of(res) : throwError(() => new Error(`the server responded with a status of ${res.status} (${res.statusText})`, { cause: res }));
      })
    );
  };
}

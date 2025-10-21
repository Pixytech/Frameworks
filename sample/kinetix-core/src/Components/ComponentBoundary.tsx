import React, { Suspense } from "react";
import { ErrorBoundary } from "./ErrorBoundary";
import { Typography } from "@progress/kendo-react-common";

export const ComponentBoundary = (props: { children: any; message?: string | null }) => {
  return (
    <ErrorBoundary
      message={props.message}
      fallback={(errordata) => {
        return (
          <div style={{ margin: "2px" }}>
            <Typography.h5 themeColor="error">Error {errordata.message?.toLowerCase()}</Typography.h5>
            <Typography.p themeColor="light">
              <details style={{ margin: "0.625rem" }}>
                <summary>{errordata.error.toString()}</summary>
                <p>{errordata.componentStack?.componentStack}</p>
              </details>
            </Typography.p>
          </div>
        );
      }}
    >
      <Suspense
        fallback={
          <div style={{ height: "100%", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "center", margin: "1.25rem" }}>
              <Typography.p themeColor="primary">
                <span className="k-icon k-font-icon k-i-loading"></span>
                <span style={{ marginLeft: 10 }}>{props.message}</span>
              </Typography.p>
            </div>
          </div>
        }
      >
        {props.children}
      </Suspense>
    </ErrorBoundary>
  );
};

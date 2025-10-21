import React from "react";
import { render } from "@testing-library/react";
import { LightTheme } from "./LightTheme";

describe("LightTheme", () => {
  it("renders children", () => {
    const { getByText } = render(
      <LightTheme>
        <div>Child Component</div>
      </LightTheme>
    );

    const childComponent = getByText("Child Component");
    expect(childComponent).toBeInTheDocument();
  });
});

import React from "react";
import { render } from "@testing-library/react";
import { DarkTheme } from "./DarkTheme";

describe("DarkTheme", () => {
  it("renders children", () => {
    const { getByText } = render(
      <DarkTheme>
        <div>Child Component</div>
      </DarkTheme>
    );

    const childComponent = getByText("Child Component");
    expect(childComponent).toBeInTheDocument();
  });
});

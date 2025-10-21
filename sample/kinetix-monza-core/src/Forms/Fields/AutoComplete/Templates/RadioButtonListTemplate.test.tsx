import "reflect-metadata";
import React from "react";
import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { createMock } from "ts-auto-mock";
import { hostComponent } from "../../../../../../../testing";
import { IFormAutoCompleteChildProps } from "../FormAutoComplete";
import { RadioButtonListTemplate } from "./RadioButtonListTemplate";

describe("Kinetix Monza Core", () => {
    let props: IFormAutoCompleteChildProps;
    const mockOnChange = jest.fn();
    const mockOnInit = jest.fn();

    beforeEach(() => {
        props = createMock<IFormAutoCompleteChildProps>();

        // Setup mock data
        props.field.name = "testRadio";
        props.field.updateModel(m => {
            m.value = { value: "option1", label: "Option 1" };
            m.tooltip = "Test tooltip";
            m.disabled = false;
            m.readonly = false;
        });
        props.field.getOptions = jest.fn().mockReturnValue([
            { value: "option1", label: "Option 1" },
            { value: "option2", label: "Option 2" }
        ]);
        props.context = {
            onChange: mockOnChange,
            onInit: mockOnInit,
            others: {}
        };
        props.field.Owner.updateModel(m => {
            m.disabled = false;
            m.readonly = false;
        })
    });

    afterEach(() => {
        cleanup();
        jest.resetAllMocks();
    });

    describe("RadioButtonListTemplate", () => {
        it("should render RadioButtonListTemplate with options", () => {
            const { container } = render(hostComponent(<RadioButtonListTemplate {...props} />));

            const radioGroup = container.querySelector('.radio-list');
            expect(radioGroup).toBeInTheDocument();

            const radioButtons = container.querySelectorAll('input[type="radio"]');
            expect(radioButtons).toHaveLength(2);
        });

        it("should call onInit when mounted", async () => {
            render(hostComponent(<RadioButtonListTemplate {...props} />));

            await waitFor(() => {
                expect(mockOnInit).toHaveBeenCalled();
            });
        });

        it("should handle value changes", () => {
            const { container } = render(hostComponent(<RadioButtonListTemplate {...props} />));

            const secondRadioButton = container.querySelectorAll('input[type="radio"]')[1];
            fireEvent.click(secondRadioButton);

            expect(mockOnChange).toHaveBeenCalled();
        });

        it("should be disabled when field is disabled", () => {
            props.field.model.disabled = true;

            const { container } = render(hostComponent(<RadioButtonListTemplate {...props} />));

            const radioButtons = container.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                expect(radio).toBeDisabled();
            });
        });

        it("should be disabled when owner is disabled", () => {
            props.field.Owner.model.disabled = true;

            const { container } = render(hostComponent(<RadioButtonListTemplate {...props} />));

            const radioButtons = container.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                expect(radio).toBeDisabled();
            });
        });

        it("should be disabled when readonly", () => {
            props.field.model.readonly = true;

            const { container } = render(hostComponent(<RadioButtonListTemplate {...props} />));

            const radioButtons = container.querySelectorAll('input[type="radio"]');
            radioButtons.forEach(radio => {
                expect(radio).toBeDisabled();
            });
        });

        it("should cleanup subscription on unmount", async () => {
            const mockSubscription = { unsubscribe: jest.fn() };
            mockOnInit.mockReturnValue(mockSubscription);

            const { unmount } = render(hostComponent(<RadioButtonListTemplate {...props} />));

            unmount();

            await waitFor(() => {
                expect(mockSubscription.unsubscribe).toHaveBeenCalled();
            });
        });
    });
});
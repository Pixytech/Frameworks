import "reflect-metadata";
import "@testing-library/jest-dom";

import { CompositeDisposable, IContainer, IDialogService, IRestClient } from "@kinetix/core";
import { IMetaDataProvider } from "../Services";
import { arrange } from "../../../../../testing";
import { waitFor } from "@testing-library/react";

import { createMock } from "ts-auto-mock";
import { IFormField, FormNumericField } from "../Fields";
import { FormModel } from "../FormModel";
import { FormViewModel } from "../FormViewModel";
import { IRule } from "./IRule";
import { TicketRules } from "./TicketRules";

export class TestTicketModel extends FormModel {}

export class StandAloneExceptionRule implements IRule<TestTicket> {
  isExecuting: boolean;
  name: string = "SOMENAMEException";
  public generateException: boolean;
  subscriptions: CompositeDisposable = new CompositeDisposable();
  async execute(model: TestTicket, property: IFormField): Promise<void> {
    throw new Error("SOME-ERROR");
  }
  dispose(): void {
    console.debug("disposed");
  }
}

export class StandAloneRule implements IRule<TestTicket> {
  isExecuting: boolean;
  name: string = "SOMENAME";
  subscriptions: CompositeDisposable = new CompositeDisposable();
  async execute(model: TestTicket, property: IFormField): Promise<void> {
    model.testFieldChangedStandAlone();
  }
  dispose(): void {
    console.debug("disposed");
  }
}

export class TestRules extends TicketRules<TestTicket> {
  public onLoadInvoked: () => void;

  protected async configureRules(): Promise<void> {
    console.debug("configureRules");
    this.whenChange((m) => [m.testField]).then("InlineRules", async (model: TestTicket, field: IFormField) => {
      console.log("whenChange InlineRules");
      model.testFieldChangedInline();
    });

    this.whenChange((m) => [m.testField]).thenRule<StandAloneRule>(StandAloneRule, (m, r) => {
      console.log("whenChange StandAloneRule");
    });

    this.whenChange((m) => [m.testField]).thenRule<StandAloneExceptionRule>(StandAloneExceptionRule);
  }

  public async onLoad(): Promise<void> {
    console.debug("onLoad", this.onLoadInvoked);
    this.onLoadInvoked();
    await super.onLoad();
  }
}
export class TestTicket extends FormViewModel<TestTicketModel> {
  testFieldChangedInline: () => void;
  testFieldChangedStandAlone: () => void;

  public testField: FormNumericField = new FormNumericField(this);

  protected async onFormInitialize(): Promise<void> {}

  protected async onFormLoad(): Promise<void> {
    console.debug("fonFormLoad");
    await this.ruleEngine.loadRules<TestRules>(TestRules);
  }

  protected createModel(): TestTicketModel {
    return new TestTicketModel();
  }
}

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: TestTicket;
  let mockContainer: IContainer;
  let mockDialogService: IDialogService;
  let mockMetaDataProvider: IMetaDataProvider;
  let mockApi: IRestClient;
  let mockRule: TestRules;
  let mockStandAloneRule: StandAloneRule;
  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockDialogService = createMock<IDialogService>();
    mockMetaDataProvider = createMock<IMetaDataProvider>();
    mockApi = createMock<IRestClient>();

    sut = new TestTicket(mockContainer, mockDialogService, mockMetaDataProvider, mockApi);

    sut.testFieldChangedInline = jest.fn();
    sut.testFieldChangedStandAlone = jest.fn();

    mockRule = new TestRules();
    mockRule.onLoadInvoked = jest.fn();

    mockStandAloneRule = new StandAloneRule();

    arrange(mockContainer).stubMethod("build", () => mockRule, [TestRules]);
    arrange(mockContainer).stubMethod("build", () => mockStandAloneRule, [StandAloneRule]);
    arrange(mockContainer).stubMethod("build", () => new StandAloneExceptionRule(), [StandAloneExceptionRule]);
  });

  // Testing Component

  describe("RuleEngine", () => {
    it("on init load rules", async () => {
      await sut.formInitialize();
      await sut.initialize();

      await waitFor(() => {
        expect(mockRule.onLoadInvoked).toBeCalled();
        // rule should not execute on load unles explicit change
        expect(sut.testFieldChangedInline).not.toBeCalled();
        expect(sut.testFieldChangedStandAlone).not.toBeCalled();
      });
    });

    it("Executing rules", async () => {
      await sut.formInitialize();
      await sut.initialize();
      const suspended = sut.ruleEngine.suspend();
      expect(sut.ruleEngine.isSuspended()).toBe(true);

      sut.testFieldChangedInline = jest.fn();
      sut.testFieldChangedStandAlone = jest.fn();
      sut.testField.setValue(10);
      await waitFor(() => {
        expect(sut.testFieldChangedInline).not.toBeCalled();
        expect(sut.testFieldChangedStandAlone).not.toBeCalled();
      });

      suspended.dispose();
      sut.ruleEngine.EndDefer();
      expect(sut.ruleEngine.isSuspended()).toBe(false);

      sut.testFieldChangedInline = jest.fn();
      sut.testFieldChangedStandAlone = jest.fn();

      sut.testField.setValue(20);
      await waitFor(() => {
        expect(sut.testFieldChangedInline).toBeCalled();
        expect(sut.testFieldChangedStandAlone).toBeCalled();
      });

      sut.ruleEngine.dispose();
    });

    it("Log exception from rules and continue others", async () => {
      const standAloneRule = new StandAloneExceptionRule();

      arrange(mockContainer).stubMethod("build", () => standAloneRule, [StandAloneRule]);

      sut.testFieldChangedInline = jest.fn();
      sut.testFieldChangedStandAlone = jest.fn();
      sut.testField.setValue(10);
      await sut.formInitialize();
      await sut.initialize();
      await waitFor(() => {
        expect(sut.testFieldChangedStandAlone).not.toBeCalled();
      });

      sut.ruleEngine.dispose();
    });
  });
});

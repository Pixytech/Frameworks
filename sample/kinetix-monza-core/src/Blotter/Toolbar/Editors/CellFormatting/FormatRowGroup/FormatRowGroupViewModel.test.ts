// reflect-metadata is required for IOC
import "reflect-metadata";
import {
  IConfigurationItem,
  IConfigurationService,
  IContainer,
  IDialogService,
  IRestClient,
} from "@kinetix/core";
import {
  BlotterCellFormatOptionsPopupViewModel,
  BlotterCellFormatRowGroupModel,
  BlotterCellFormatRowGroupViewModel,
  DataTypes,
  IBlotterCellFormatOptionsPopup,
  IBlotterCellFormatOptionsPopupType,
  IBlotterCellFormatting,
  IMetaDataProvider,
} from "@kinetix/monza-core";
import { Subject } from "rxjs";
import { createMock } from "ts-auto-mock";
import { arrange } from "../../../../../../../../testing";
import dayjs from "dayjs";
// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped module
  let sut: BlotterCellFormatRowGroupViewModel;

  let container: IContainer;
  let blotterCellFormatting: IBlotterCellFormatting;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    container = createMock<IContainer>();
    blotterCellFormatting = createMock<IBlotterCellFormatting>();

    arrange(container).stubMethod(
      "build",
      () => new BlotterCellFormatOptionsPopupViewModel(),
      [IBlotterCellFormatOptionsPopupType]
    );

    sut = new BlotterCellFormatRowGroupViewModel(container);
    sut.Owner = blotterCellFormatting;
    sut.model.format = {
      column: {
        name: "assetClass",
        displayName: "Asset",
        displayField: "assetClass",
        order: 0,
        type: DataTypes.string,
        field: "assetClass",
        objectName: "assetClass",
        groupable: true,
        aggregable: true,
        useAsParameter: true,
        isArray: true,
        sortable: true,
        allowMultipleValues: true,
        forceUTC: true,
        primaryDisplayName: true,
        defaultColumn: true,
        nested: true,
        possibleValues: [],
        enumType: "string",
        alternativeFields: [],
      },
      conditions: [
        {
          opretaor: {
            text: "filter.eqOperator",
            operator: "eq",
          },
          value: "test",
          format: undefined,
          priority: 0,
        },
      ],
      priority: 0,
    };

    sut.initialize();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("BlotterCellFormatRowGroupViewModel", () => {
    it("should configure properties on init", async () => {
      expect(sut.formatOptionsPopupViewModels.length).toBe(1);
    });

    it("handle value change", () => {
      const configurationChangedSpy = jest.spyOn(
        blotterCellFormatting,
        "configurationChanged"
      );

      expect(sut.model.format.conditions[0].value).not.toBeNull();
      sut.handleValueChange(null, 0);
      expect(sut.model.format.conditions[0].value).toBeNull();
      expect(configurationChangedSpy).toBeCalled();

      sut.handleValueChange({ displayName: "displayNameTest" }, 0);

      expect(sut.model.format.conditions[0].value.value).toBe(
        "displayNameTest"
      );

      let dateObj = new Date("2019-01-01T00:00:00.000+00:00");
      let dateStr = dayjs(dateObj).format("YYYY-MM-DD");
      sut.handleValueChange(dateObj, 0);
      expect(sut.model.format.conditions[0].value).toBe(dateStr);
    });
  });
});

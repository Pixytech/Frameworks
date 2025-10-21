// reflect-metadata is required for IOC
import "reflect-metadata";
import type { IContainer } from "@kinetix/core";
import { createMock } from "ts-auto-mock";
import { BlotterCellFormatOptionsPopupModel, BlotterCellFormatRowGroupModel, BlotterCellFormattingViewModel, DataTypes, GridOperationModes, IBlotterCellFormatOptionsPopup, IBlotterCellFormatOptionsPopupType, IBlotterCellFormatRowGroup, IBlotterCellFormatRowGroupType } from "../../../..";
import type { IConfigurationEditor } from "../IConfigurationEditor";
import { arrange } from "../../../../../../../testing";
import { getOperatorsByType } from "../../../Utils/Operators";
import { TextFilterProps } from "@progress/kendo-react-data-tools";

// Base Package
describe("Kinetix Monza Core", () => {
  // Scoped viewModel
  let sut: BlotterCellFormattingViewModel;
  let mockContainer: IContainer;
  let mockConfigurationEditor: IConfigurationEditor;
  let mockFormatRowGroup: IBlotterCellFormatRowGroup;
  let mockCellFormatOptionsPopup: IBlotterCellFormatOptionsPopup;

  let datasetDefCol1 = {
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
  };

  let datasetDefCol2 = {
    name: "name",
    displayName: "Name",
    displayField: "name",
    order: 0,
    type: DataTypes.string,
    field: "name",
    objectName: "name",
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
  };

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(() => {
    mockContainer = createMock<IContainer>();
    mockConfigurationEditor = createMock<IConfigurationEditor>();
    mockFormatRowGroup = createMock<IBlotterCellFormatRowGroup>({ model: new BlotterCellFormatRowGroupModel() });
    mockCellFormatOptionsPopup = createMock<IBlotterCellFormatOptionsPopup>({ model: new BlotterCellFormatOptionsPopupModel() });

    arrange(mockContainer).stubMethod("build", () => mockFormatRowGroup, [IBlotterCellFormatRowGroupType]);
    arrange(mockContainer).stubMethod("build", () => mockCellFormatOptionsPopup, [IBlotterCellFormatOptionsPopupType]);
    arrange(mockFormatRowGroup).stubMethod("updateModel", (callback: (model: any) => void) => callback(mockFormatRowGroup.model));
    arrange(mockCellFormatOptionsPopup).stubMethod("updateModel", (callback: (model: any) => void) => callback(mockCellFormatOptionsPopup.model));

    sut = new BlotterCellFormattingViewModel(mockContainer);
    sut.Owner = mockConfigurationEditor;
    sut.columns = [datasetDefCol1, datasetDefCol2];
    sut.formats = [
      {
        column: datasetDefCol1,
        conditions: [
          {
            opretaor: getOperatorsByType(datasetDefCol1.type)[0],
            priority: 1,
            format: { textStyles: {} },
          },
        ],
        priority: 1,
      },
    ];

    sut.setConfiguration(GridOperationModes.Client);
  });

  // Testing Component
  describe("BlotterCellFormattingViewModel", () => {
    it("model is not null", async () => {
      await sut.initialize();

      expect(sut.model).not.toBeNull();
    });

    it("model is not null", async () => {
      await sut.initialize();
      const stringFieldSettings = sut.mapFieldSettingsFromColumn({
        name: "name",
        displayName: "Name",
        displayField: "name",
        order: 0,
        type: DataTypes.string,
        field: "name",
        objectName: "name",
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
      });

      const boolFieldSettings = sut.mapFieldSettingsFromColumn({
        name: "name",
        displayName: "Name",
        displayField: "name",
        order: 0,
        type: DataTypes.boolean,
        field: "name",
        objectName: "name",
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
      });

      const listFieldSettings = sut.mapFieldSettingsFromColumn({
        name: "name",
        displayName: "Name",
        displayField: "name",
        order: 0,
        type: DataTypes.enum,
        field: "name",
        objectName: "name",
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
      });

      const dateFieldSettings = sut.mapFieldSettingsFromColumn({
        name: "name",
        displayName: "Name",
        displayField: "name",
        order: 0,
        type: DataTypes.date,
        field: "name",
        objectName: "name",
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
      });

      const numericFieldSettings = sut.mapFieldSettingsFromColumn({
        name: "name",
        displayName: "Name",
        displayField: "name",
        order: 0,
        type: DataTypes.int,
        field: "name",
        objectName: "name",
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
      });

      expect(stringFieldSettings).not.toBeNull();
      expect(boolFieldSettings).not.toBeNull();
      expect(dateFieldSettings).not.toBeNull();
      expect(numericFieldSettings).not.toBeNull();
      expect(listFieldSettings).not.toBeNull();

      const filterProps = createMock<TextFilterProps>();
      const stringField = stringFieldSettings.filter(filterProps);
      const boolField = boolFieldSettings.filter(filterProps);
      const dateField = dateFieldSettings.filter(filterProps);
      const numericField = numericFieldSettings.filter(filterProps);
      const listField = listFieldSettings.filter(filterProps);

      expect(stringField).not.toBeNull();
      expect(boolField).not.toBeNull();
      expect(dateField).not.toBeNull();
      expect(numericField).not.toBeNull();
      expect(listField).not.toBeNull();
    });
    it("searchColumn must add formatGroup", async () => {
      await sut.initialize();

      expect(sut.formatGroups.length).toBe(1);

      sut.searchColumn.setValue("Name");

      expect(sut.formatGroups.length).toBe(2);
      expect(sut.formatGroups[0].model.format.column.name).toBe("name");
      expect(sut.formatGroups[0].model.format.conditions.length).toBe(1);

      sut.searchColumn.setValue("Name");

      expect(sut.formatGroups[0].model.format.conditions.length).toBe(2);
    });
  });
});

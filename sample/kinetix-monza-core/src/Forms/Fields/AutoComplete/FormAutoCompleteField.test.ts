// reflect-metadata is required for IOC
import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { arrange } from "../../../../../../testing";
import { waitFor } from "@testing-library/react";
import { FormAutoCompleteField } from "./FormAutoCompleteField";
import { DataFilter, DataTypes, FormModel, IFormViewModel, UpdateSourceTrigger, dataService } from "@kinetix/monza-core";

// Base Package
describe("Kinetix Monza core", () => {
  // Scoped module
  let sut: FormAutoCompleteField;
  let mockdataService: typeof dataService = dataService;
  let mockOwner: IFormViewModel<FormModel>;

  // Execute once before all tests
  // To create single module for all tests
  beforeEach(async () => {
    mockOwner = createMock<IFormViewModel<FormModel>>();

    sut = new FormAutoCompleteField(mockOwner);

    await sut.initialize();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // Testing Component
  describe("FormAutoCompleteField", () => {
    it("should get initialized", async () => {
      expect(sut.displayName).toBe("displayName");
      expect(sut.updateSourceTrigger).toBe(UpdateSourceTrigger.LostFocus);
    });

    it("getOptions should return model.data if dataset passed", async () => {
      sut.model.data = ["testOption1", "testOption2"];
      sut.dataset = "testId";
      let res = sut.getOptions();

      expect(res).not.toBeNull();
      expect(res).toStrictEqual(["testOption1", "testOption2"]);
    });

    it("getOptions should return model.data if dataset passed", async () => {
      sut.model.data = ["testOption1", "testOption2"];
      sut.dataset = "testId";
      let res = sut.getOptions();

      expect(res).not.toBeNull();
      expect(res).toStrictEqual(["testOption1", "testOption2"]);
    });

    it("getTreeOptions should return model.data if dataset passed", async () => {
      sut.model.data = [
        {
          text: "Furniture",
          id: 1,
          items: [
            { text: "Tables & Chairs", id: 2 },
            { text: "Sofas", id: 3 },
            { text: "Occasional Furniture", id: 4 },
          ],
        },
        {
          text: "Decor",
          id: 5,
          items: [
            { text: "Bed Linen", id: 6 },
            { text: "Curtains & Blinds", id: 7 },
            { text: "Carpets", id: 8 },
          ],
        },
      ];
      sut.dataset = "testId";
      let res = sut.getTreeOptions();

      sut.onExpandChange(sut.model.data[0]);
      expect(sut.model.expandState).toStrictEqual([1]);
    });

    it("getOptions should return model.options if dataset not passed", async () => {
      sut.model.options = ["testOption1", "testOption2"];
      let res = sut.getOptions();

      expect(res).not.toBeNull();
      expect(res).toStrictEqual(["testOption1", "testOption2"]);
    });

    it("getSubmitValue should return right data", async () => {
      sut.model.value = { value: "SomeValue", test: "display" };
      sut.fieldType = DataTypes.enum;
      sut.displayName = "test";
      expect(sut.getSubmitValue()).toBe("display");
      sut.fieldType = DataTypes.complexObject;
      expect(sut.getSubmitValue().value).toBe("SomeValue");

      sut.model.value = [{ value: "SomeValue", test: "display" }];
      sut.fieldType = DataTypes.enum;
      sut.displayName = "test";
      sut.selection = "Multiple";
      expect(sut.getSubmitValue()[0]).toBe("display");
    });

    it("setValue should set right data for multiselect", async () => {
      sut.fieldType = DataTypes.enum;
      sut.displayName = "test";
      sut.selection = "Multiple";

      expect(sut.getSubmitValue().length).toBe(0);

      sut.model.data = [
        { value: "SomeValue", test: "display" },
        { value: "SomeValue1", test: "display2" },
      ];
      sut.setValue([{ value: "SomeValue", test: "display" }]);

      expect(sut.getSubmitValue()[0]).toBe("display");

      sut.setValue("display");
      expect(sut.getSubmitValue()[0]).toBe("display");
      sut.setValue(["display"]);
      expect(sut.getSubmitValue()[0]).toBe("display");

      sut.setValue("SomeUnkown");
      expect(sut.getSubmitValue()[0]).toBe("SomeUnkown");

      sut.setValue({ value: "SomeUnkown", test: "SomeUnkown" });
      expect(sut.getSubmitValue()[0]).toBe("SomeUnkown");
    });

    it("setValue should set right data for singleSelect", async () => {
      sut.fieldType = DataTypes.enum;
      sut.displayName = "test";
      sut.selection = "Single";
      sut.model.data = [
        { value: "SomeValue", test: "display" },
        { value: "SomeValue1", test: "display2" },
      ];
      sut.setValue([{ value: "SomeValue", test: "display" }]);

      expect(sut.getSubmitValue()).toBe("display");

      sut.setValue("display");
      expect(sut.getSubmitValue()).toBe("display");
      sut.setValue(["display"]);
      expect(sut.getSubmitValue()).toBe("display");

      sut.setValue("SomeUnkown");
      expect(sut.getSubmitValue()).toBe("SomeUnkown");
    });

    it("onKeyDown Ctrl down arrow should open popup", async () => {
      sut.EnableAcelerator = true;
      let e = createMock<React.KeyboardEvent<Element>>({ key: "ArrowDown", ctrlKey: true });

      sut.model.value = null;
      sut.model.required = true;
      sut.model.text = "te";
      sut.model.data = ["test"];

      sut.onKeyDown(e);

      await waitFor(() => {
        expect(sut.model.show).toBe(true);
      });

      sut.handleAcceleratorPopup(false);
      expect(sut.model.acceleratorData.length).toBe(0);
    });

    it("onKeyDown Tab should call setValue", async () => {
      let mockSetValue = jest.spyOn(sut, "setValue");
      let mockMoveToNextField = jest.spyOn(mockOwner, "moveToNextField");

      let e = createMock<React.KeyboardEvent<Element>>({ key: "Tab" });

      sut.model.value = null;
      sut.model.required = true;
      sut.model.text = "te";
      sut.model.data = ["test"];

      sut.onKeyDown(e);

      await waitFor(() => {
        expect(mockSetValue).toBeCalled();
        expect(mockMoveToNextField).toBeCalled();
      });
    });

    it("filterData from options tests", async () => {
      sut.dataset = undefined;

      let filter: DataFilter = {
        type: DataTypes.string,
        operator: "eq",
        value: "te",
      };

      sut.hasfocus = true;
      sut.model.readonly = false;
      sut.Owner.model.readonly = false;
      sut.model.text = "te";
      sut.displayName = "displayName";
      sut.model.data = [{ displayName: "test" }, { displayName: "some2" }, { displayName: "ignore" }];
      sut.model.ignoreOptions = ["ignore"];
      sut.filterData(filter);

      await waitFor(() => {
        expect(sut.model.data.length).toBe(1);
      });
    });
    it("filterData tests", async () => {
      let mockSetValue = jest.spyOn(sut, "setValue");
      let mockUpdateModel = jest.spyOn(sut, "updateModel");

      let filter: DataFilter = {
        type: DataTypes.string,
        operator: "eq",
        value: "test",
      };

      sut.hasfocus = false;
      sut.model.readonly = true;
      sut.Owner.model.readonly = true;
      sut.filterData(filter);

      expect(mockUpdateModel).not.toBeCalled();

      sut.hasfocus = true;
      sut.filterData(filter);

      expect(mockUpdateModel).not.toBeCalled();

      sut.model.readonly = false;
      sut.filterData(filter);

      expect(mockUpdateModel).not.toBeCalled();

      sut.Owner.model.readonly = false;
      sut.filterData(filter);

      await waitFor(() => {
        expect(mockUpdateModel).toBeCalled();
      });

      const results = {
        items: [
          {
            displayName: "name",
          },
        ],
      };

      arrange(mockdataService).stubMethod("getDatasetDataByLookup", () => {
        return {
          then: jest.fn((callBack) => {
            sut.hasfocus = false;
            callBack(results);
            return {
              catch: jest.fn(() => {
                return {
                  finally: jest.fn(() => {}),
                };
              }),
              finally: jest.fn(() => {}),
            };
          }),
          catch: jest.fn(() => {
            return {
              finally: jest.fn(() => {}),
            };
          }),
        };
      });

      sut.dataset = "testId";
      sut.filterData(filter);
      await waitFor(() => {
        expect(mockSetValue).toBeCalledWith({ displayName: "name" });
      });
    });

    it("buttonGroupKeydown ArrowRight should call focus on the child node if exist", async () => {
      let mockCallback1 = jest.fn();
      let mockCallback2 = jest.fn();
      let mockCallback3 = jest.fn();

      (document.activeElement! as any).tabIndex = 1;

      let e = {
        key: "ArrowRight",
      };

      let ElementRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback1();
                },
              },
              {
                focus: () => {
                  mockCallback2();
                },
              },
              {
                focus: () => {
                  mockCallback3();
                },
              },
            ],
          },
        },
      };

      let listRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback1();
                },
              },
            ],
          },
        },
      };
      sut.buttonGroupKeydown(e, ElementRef, listRef);

      await waitFor(() => {
        expect(mockCallback3).toBeCalled();
      });
    });

    it("buttonGroupKeydown ArrowRight should call focus on first child node if  selected index not matched to list", async () => {
      let mockCallback = jest.fn();
      (document.activeElement! as any).tabIndex = 2;
      let e = {
        key: "ArrowRight",
      };

      let ElementRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback();
                },
              },
            ],
          },
        },
      };

      let listRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback();
                },
              },
            ],
          },
        },
      };
      sut.buttonGroupKeydown(e, ElementRef, listRef);

      await waitFor(() => {
        expect(mockCallback).toBeCalled();
      });
    });

    it("buttonGroupKeydown ArrowLeft should call focus on child node before the selected index", async () => {
      let mockCallback1 = jest.fn();
      let mockCallback2 = jest.fn();
      let mockCallback3 = jest.fn();

      (document.activeElement! as any).tabIndex = 2;
      let e = {
        key: "ArrowLeft",
      };

      let ElementRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback1();
                },
              },
              {
                focus: () => {
                  mockCallback2();
                },
              },
              {
                focus: () => {
                  mockCallback3();
                },
              },
            ],
          },
        },
      };

      let listRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback1();
                },
              },
              {
                focus: () => {
                  mockCallback2();
                },
              },
              {
                focus: () => {
                  mockCallback3();
                },
              },
            ],
          },
        },
      };
      sut.buttonGroupKeydown(e, ElementRef, listRef);

      await waitFor(() => {
        expect(mockCallback2).toBeCalled();
      });
    });

    it("buttonGroupKeydown ArrowDown should call focus on the child node if exist", async () => {
      let mockCallback1 = jest.fn();
      let mockCallback2 = jest.fn();
      let mockCallback3 = jest.fn();

      (document.activeElement! as any).tabIndex = 0;

      let e = {
        key: "ArrowDown",
      };

      let ElementRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback1();
                },
              },
              {
                focus: () => {
                  mockCallback2();
                },
              },
              {
                focus: () => {
                  mockCallback3();
                },
              },
            ],
          },
        },
      };

      let listRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback1();
                },
              },
              {
                focus: () => {
                  mockCallback2();
                },
              },
              {
                focus: () => {
                  mockCallback3();
                },
              },
            ],
          },
        },
      };
      sut.buttonGroupKeydown(e, ElementRef, listRef);

      await waitFor(() => {
        expect(mockCallback2).toBeCalled();
      });
    });

    it("buttonGroupKeydown ArrowDown should call focus on first child node if selected index not matched to list", async () => {
      let mockCallback = jest.fn();
      (document.activeElement! as any).tabIndex = 2;
      let e = {
        key: "ArrowDown",
      };

      let ElementRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback();
                },
              },
            ],
          },
        },
      };

      let listRef = {
        current: {
          _element: {
            childNodes: [
              {
                focus: () => {
                  mockCallback();
                },
              },
            ],
          },
        },
      };
      sut.buttonGroupKeydown(e, ElementRef, listRef);

      await waitFor(() => {
        expect(mockCallback).toBeCalled();
      });
    });

    it("filterAcceleratorData with data", async () => {
      let mockHandleAccelerator = jest.spyOn(sut, "handleAccelerator");

      const results = {
        items: [
          {
            displayName: "name",
          },
        ],
      };

      arrange(mockdataService).stubMethod("getDatasetDataByLookup", () => {
        return Promise.resolve(results);
      });

      sut.filterAcceleratorData("tst");

      await waitFor(() => {
        expect(mockHandleAccelerator).toBeCalledWith(results.items[0]);
      });
    });

    it("filterAcceleratorData with empty results", async () => {
      let mockHandleAccelerator = jest.spyOn(sut, "handleAccelerator");

      const results = {};

      arrange(mockdataService).stubMethod("getDatasetDataByLookup", () => {
        return Promise.resolve(results);
      });

      sut.filterAcceleratorData("tst");

      await waitFor(() => {
        expect(mockHandleAccelerator).toBeCalledWith();
      });
    });
  });
});

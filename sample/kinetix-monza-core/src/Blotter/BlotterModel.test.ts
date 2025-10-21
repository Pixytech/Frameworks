// reflect-metadata is required for IOC
import "reflect-metadata";
import { BlotterModel } from "..";

// Base Package
describe("Kinetix Monza Core", () => {
  // Testing Component
  describe("BlotterModel", () => {
    // TEST:  Kinetix Monza Core > BlotterModel > items should get created without dataKeyItem Prefix
    it("items should get created without dataKeyItem Prefix", () => {
      let module = new BlotterModel();
      //let mockCompositeKey = jest.spyOn(module as any, "getCompositeKey");
      module.items = [{ value: "test" }];
      expect(module).not.toBeNull();
      expect(module.items.length).toBe(1);

      expect(module.items[0].dataKeyItem).toBe("0");
      expect(module.items[0].value).toBe("test");

      //expect(mockCompositeKey).toHaveBeenCalledTimes(1);
    });

    // TEST:  Kinetix Monza Core > BlotterModel > instance should be created
    it("items should get created with dataKeyItem Prefix", () => {
      let module = new BlotterModel();

      module.primaryKeys = ["id"];
      module.items = [{ value: "test" }];
      expect(module).not.toBeNull();
      expect(module.items.length).toBe(1);
      expect(module.items[0].dataKeyItem).toBe("id-0");
      expect(module.items[0].value).toBe("test");
    });

    // TEST:  Kinetix Monza Core > BlotterModel > dataResult should return test data
    it("dataResult should return test data", () => {
      let model = new BlotterModel();
      model.items = [{ value: "test" }];
      let gridData = model.getDataResult();
      expect(gridData).not.toBeNull();
      expect(gridData.data).not.toBeNull();
      expect(gridData.total).toBe(1);
      expect(gridData.data.length).toBe(1);
      expect(gridData.data[0].value).toBe("test");
    });
  });
});

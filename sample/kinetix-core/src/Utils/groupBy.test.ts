// reflect-metadata is required for IOC
import "reflect-metadata";
import { groupBy } from "./groupBy";

// Base Package
describe("Kinetix Core", () => {
  // Scoped module
  let module = [
    { Name: "a", Type: "ABC" },
    { Name: "b", Type: "ABC" },
    { Name: "c", Type: "ABC" },
    { Name: "p", Type: "PQR" },
    { Name: "q", Type: "PQR" },
  ];

  // Testing Component
  describe("groupBy", () => {
    // TEST:  Kinetix Monza Core > groupBy > should return grouped items from given array
    it("should return grouped items from given array", () => {
      let groupedItems = groupBy(module, (x) => x.Type);

      let expectedObj = {
        ABC: [
          { Name: "a", Type: "ABC" },
          { Name: "b", Type: "ABC" },
          { Name: "c", Type: "ABC" },
        ],
        PQR: [
          { Name: "p", Type: "PQR" },
          { Name: "q", Type: "PQR" },
        ],
      };
      expect(module).not.toBeNull();
      expect(groupedItems).not.toBeNull();
      expect(groupedItems).toStrictEqual(expectedObj);
    });
  });
});

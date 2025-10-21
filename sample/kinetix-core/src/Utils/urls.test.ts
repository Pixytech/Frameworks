import { joinPath, getDistinct } from "./Urls"; // Replace './your-module' with the actual path to your module

describe("joinPath", () => {
  test("should join two paths correctly", () => {
    const url = "path/file";
    const concat = "concat/path";
    const expected = "path/file/concat/path";
    expect(joinPath(url, concat)).toBe(expected);
  });

  test("should handle relative paths correctly", () => {
    const url = "path/files";
    const concat = "./other/path";
    const expected = "path/files/other/path";
    expect(joinPath(url, concat)).toBe(expected);
  });

  test("should handle current directory indicator correctly", () => {
    const url = "path/to/some";
    const concat = "./other/path";
    const expected = "path/to/some/other/path";
    expect(joinPath(url, concat)).toBe(expected);
  });
});

describe("getDistinct", () => {
  test("should return distinct values of a property", () => {
    const data = [
      { id: 1, name: "John" },
      { id: 2, name: "Jane" },
      { id: 3, name: "John" },
    ];
    const expected = ["John", "Jane"];
    expect(getDistinct(data, "name")).toEqual(expected);
  });

  test("should handle missing properties", () => {
    const data = [{ id: 1, name: "John" }, { id: 2 }, { id: 3, name: "John" }];
    const expected = ["John"];
    expect(getDistinct(data, "name")).toEqual(expected);
  });
});

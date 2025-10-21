// reflect-metadata is required for IOC
import "reflect-metadata";
import { IIcon, ThemeService } from "..";
import { createMock } from "ts-auto-mock";
import { SVGIcon } from "@progress/kendo-svg-icons";

// Base Package
describe("Kinetix Core", () => {

    let sut: ThemeService;
    beforeEach(() => {
        sut = new ThemeService();
    });
  // Testing Component
  describe("ThemeService", () => {
    // TEST:  Kinetix Core > AutomationHelper > GetId should return replace symbol and space with `-`
    it("Should add icons", () => {
        sut.AddSvgIcons([createMock<SVGIcon>({name:'icon1'})]);
        const existingIcons = sut.Icons.length - 1;
        sut.AddIcons([createMock<IIcon>({name:'icon2'})])
        expect(sut.Icons.length).toBe(existingIcons + 2);
    });

  });
});

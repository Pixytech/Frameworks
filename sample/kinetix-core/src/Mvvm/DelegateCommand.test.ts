// reflect-metadata is required for IOC
import "reflect-metadata";
import { DelegateCommand } from "./DelegateCommand";

// Base Package
describe("Kinetix Core", () => {
  // Scoped sut
  let sut: DelegateCommand;
  let mockExecute: (para: any) => void;
  let mockCanExecute: (para: any) => boolean;
  // Execute once before each tests
  // To create single sut for each tests
  beforeEach(() => {
    mockExecute = jest.fn();
    mockCanExecute = jest.fn().mockImplementation((p) => true);
    sut = new DelegateCommand(mockExecute, mockCanExecute);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("DelegateCommand", () => {
    it("should canExecute", async () => {
      expect(sut.canExecute()).toBe(true);

      mockCanExecute = jest.fn().mockImplementation((p) => false);
      sut = new DelegateCommand(mockExecute, mockCanExecute);
      expect(sut.canExecute()).toBe(false);
    });

    it("should canExecute", async () => {
      sut.execute();
      expect(mockExecute).toBeCalled();
      sut.raiseCanExecuteChanged();
    });
  });
});

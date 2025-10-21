// reflect-metadata is required for IOC
import "reflect-metadata";
import { createMock } from "ts-auto-mock";
import { MessageBoxViewModel } from "./MessageBoxViewModel";
import { IDialogContext, IDialogService } from "../DialogService";
import { MessageBoxButton } from "./MessageBoxButton";
import { MessageBoxImage } from "./MessageBoxImage";
import { MessageBoxResult } from "./MessageBoxResult";
// Base Package
describe("Kinetix Core", () => {
  // Scoped sut
  let sut: MessageBoxViewModel;
  let mockDialogService: IDialogService;
  let mockMessageBoxText: string;
  let mockOnClose: (result: MessageBoxResult) => void;
  let mockButton: MessageBoxButton;
  let mockIcon: MessageBoxImage;
  let mockDefaultResult: MessageBoxResult;
  // Execute once before each tests
  // To create single sut for each tests
  beforeEach(() => {
    mockDialogService = createMock<IDialogService>();
    mockMessageBoxText = "TEST-TEXT";
    mockOnClose = jest.fn();
    mockButton = MessageBoxButton.Ok;
    mockIcon = MessageBoxImage.Error;
    mockDefaultResult = MessageBoxResult.Ok;
    sut = new MessageBoxViewModel(mockDialogService, mockMessageBoxText, mockOnClose, mockButton, mockIcon, mockDefaultResult,(x)=>{});
    sut.OnDialogCreated(createMock<IDialogContext>());
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("MessageBoxViewModel", () => {
    it("should create model", async () => {
      expect(sut.model).toBeDefined();
    });

    it("should close dialog", async () => {
      expect(sut.Command.canExecute(MessageBoxResult.Cancel)).toBeTruthy();
      sut.Command.execute(MessageBoxResult.Cancel);
      expect(sut.Result).toBe(MessageBoxResult.Cancel);
      expect(mockDialogService.Close).toBeCalled();
    });

    it("should get icon class", async () => {
      expect(sut.getIconClassName(MessageBoxImage.Error)).toBe("message-box-icon message-box-error k-icon k-font-icon k-i-close-circle k-i-x-circle");
      expect(sut.getIconClassName(MessageBoxImage.Hand)).toBe("message-box-icon message-box-error k-icon k-font-icon k-i-close-circle k-i-x-circle");
      expect(sut.getIconClassName(MessageBoxImage.Stop)).toBe("message-box-icon message-box-error k-icon k-font-icon k-i-close-circle k-i-x-circle");
      expect(sut.getIconClassName(MessageBoxImage.Question)).toBe("message-box-icon k-icon k-font-icon k-i-question k-i-help");
      expect(sut.getIconClassName(MessageBoxImage.Exclamation)).toBe("message-box-icon message-box-warning");
      expect(sut.getIconClassName(MessageBoxImage.Warning)).toBe("message-box-icon message-box-warning");
      expect(sut.getIconClassName(MessageBoxImage.Asterisk)).toBe("message-box-icon k-icon k-font-icon k-i-information k-i-info");
      expect(sut.getIconClassName(MessageBoxImage.Information)).toBe("message-box-icon k-icon k-font-icon k-i-information k-i-info");
      expect(sut.getIconClassName(MessageBoxImage.None)).toBe("");
    });
  });
});

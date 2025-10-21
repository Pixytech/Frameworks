/// Specifies the buttons that are displayed on a message box. Used as an argument of the IMessageBoxService.Show method.

export enum MessageBoxButton {
    ///The message box displays an OK button.
    Ok = "Ok",
    ///The message box displays OK and Cancel buttons.
    OkCancel = "OKCancel",
    ///The message box displays Yes, No, and Cancel buttons.
    YesNoCancel = "YesNoCancel",
    ///The message box displays Yes and No buttons.
    YesNo = "YesNo"
}

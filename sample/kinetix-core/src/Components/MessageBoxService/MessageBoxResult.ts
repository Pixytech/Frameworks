/// Specifies which message box button that a user clicks. MessageBoxResult is returned by the IMessageBoxService.Show method.

export enum MessageBoxResult {
    /// The message box returns no result.
    None = "None",
    /// The result value of the message box is Ok.
    Ok = "Ok",
    /// The result value of the message box is Cancel.
    Cancel = "Cancel",
    /// The result value of the message box is Yes.
    Yes = "Yes",
    /// The result value of the message box is No.
    No ="No"
}

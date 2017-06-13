namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    public enum WindowSizeToContent
    {

        /// <summary>Specifies that a window will not automatically set its size to fit the size of its content. Instead, the size of a window is determined by other properties, including <see cref="P:System.Windows.FrameworkElement.Width" />, <see cref="P:System.Windows.FrameworkElement.Height" />, <see cref="P:System.Windows.FrameworkElement.MaxWidth" />, <see cref="P:System.Windows.FrameworkElement.MaxHeight" />, <see cref="P:System.Windows.FrameworkElement.MinWidth" />, and <see cref="P:System.Windows.FrameworkElement.MinHeight" />. See WPF Windows Overview.</summary>
        Manual,

        /// <summary>Specifies that a window will automatically set its width to fit the width of its content, but not the height.</summary>
        Width,

        /// <summary>Specifies that a window will automatically set its height to fit the height of its content, but not the width.</summary>
        Height,

        /// <summary>Specifies that a window will automatically set both its width and height to fit the width and height of its content.</summary>
        WidthAndHeight
    }
}

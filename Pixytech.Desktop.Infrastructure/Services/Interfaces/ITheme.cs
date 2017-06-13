using System;

namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    public interface ITheme
    {
        string Name { get; }

        Uri Source { get; }

        FontSize FontSize { get; set; }

        string AccentColor { get; set; }
    }
}

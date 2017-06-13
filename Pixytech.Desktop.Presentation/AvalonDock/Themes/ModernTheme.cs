using System;

namespace Pixytech.Desktop.Presentation.AvalonDock.Themes
{
    public class ModernTheme : Theme
    {
        public override Uri GetResourceUri()
        {
            return new Uri("/Pixytech.Desktop.Presentation;component/AvalonDock/Themes/ModernUI/Theme.xaml", UriKind.Relative);
        }
    }
}

using System;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media;

namespace Pixytech.Desktop.Presentation.AvalonDock.Themes.ModernUI
{
    public class DropDownButtonImageConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            var solidColorBrush = value as SolidColorBrush;
            if (solidColorBrush == null)
            {
                return null;
            }
            if (IsWhiteTheme(solidColorBrush.Color))
            {
                return "/Pixytech.Desktop.Presentation;component/AvalonDock/Themes/ModernUI/Images/PinDocMenu_Black.png";
            }
            return "/Pixytech.Desktop.Presentation;component/AvalonDock/Themes/ModernUI/Images/PinDocMenu_White.png";
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            return new NotImplementedException();
        }

        private bool IsWhiteTheme(Color color)
        {
            return (color.R + color.G + color.B)/3 > 128;
        }
    }
}

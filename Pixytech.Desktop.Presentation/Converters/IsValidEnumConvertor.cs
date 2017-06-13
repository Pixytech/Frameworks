using System;
using System.Diagnostics;
using System.Windows.Data;

namespace Pixytech.Desktop.Presentation.Converters
{
    public class IsValidEnumConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            if (parameter == null || value == null)
            {
                return false;
            }

            if (parameter.GetType().IsEnum && value.GetType().IsEnum)
            {
                var p = (Enum)Enum.Parse(parameter.GetType(), parameter.ToString());
                var e = (Enum)Enum.Parse(value.GetType(), value.ToString());
                var result = e.ToString().Equals(p.ToString(),StringComparison.OrdinalIgnoreCase);// e.HasFlag(p);
                return result;
            }

            return false;
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}

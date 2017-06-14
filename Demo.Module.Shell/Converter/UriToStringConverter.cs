using System;
using System.Globalization;
using System.Windows.Data;

namespace Demo.Module.Shell.Converter
{
    public class UriToStringConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            var input = value as Uri;
            return input == null ? String.Empty : input.ToString();
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            var input = value as string;
            return String.IsNullOrWhiteSpace(input) ? null : new Uri(input, UriKind.Absolute);
        }
    }
}
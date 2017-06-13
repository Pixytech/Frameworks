using System;
using System.ComponentModel;
using System.Windows.Data;

namespace Pixytech.Desktop.Presentation.Converters
{
    class MultiplicationFactorConvertor : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            if (value != null)
            {
                var targetDataType = value.GetType();
                var factor = double.Parse(string.Format("{0}", parameter));
                var convertor = TypeDescriptor.GetConverter(targetDataType);
                var valueConverted = double.Parse(string.Format("0{0}", value));
                var result = valueConverted * factor;
                var convertedResult = convertor.ConvertTo(result, targetDataType);
                return convertedResult;
            }
            return value;
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}

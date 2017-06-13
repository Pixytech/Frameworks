using System;
using System.Globalization;

namespace Pixytech.Core.Utilities
{
    public static class UniversalDateParser
    {
        public static DateTime Parse(string value)
        {
            return DateTime.ParseExact(value, "yyyy-MM-dd", null, DateTimeStyles.AssumeUniversal).ToUniversalTime();
        }
    }
}

using System;
using System.Linq.Expressions;
using Pixytech.Core.Properties;

namespace Pixytech.Core
{
    public static class  PropertySupport
    {
        public static string ExtractPropertyName<T>(Expression<Func<T>> propertyExpression)
        {
            if (propertyExpression == null)
            {
                throw new ArgumentNullException("propertyExpression");
            }

            var memberExpression = propertyExpression.Body as MemberExpression;
            if (memberExpression == null)
            {
                throw new ArgumentException(Resources.PropertySupport_ExtractPropertyName_Invalid_expression, "propertyExpression");
            }
            return memberExpression.Member.Name;
        }

        public static string ExtractPropertyName<T, TProp>(Expression<Func<T, TProp>> propertyExpression)
        {
            if (propertyExpression == null)
            {
                throw new ArgumentNullException("propertyExpression");
            }

            var memberExpression = propertyExpression.Body as MemberExpression;
            if (memberExpression == null)
            {
                throw new ArgumentException(Resources.PropertySupport_ExtractPropertyName_Invalid_expression, "propertyExpression");
            }
            return memberExpression.Member.Name;
        }
    }
}

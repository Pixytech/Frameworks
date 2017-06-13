using System;
using System.Linq.Expressions;
using System.Reflection;
using Pixytech.Core.Properties;

namespace Pixytech.Core.IoC.Internal
{
    /// <summary>
    /// Provides strong-typed reflection of the <typeparamref name="TTarget" /> 
    /// type.
    /// </summary>
    /// <typeparam name="TTarget">Type to reflect.</typeparam>
    internal static class Reflect<TTarget>
    {
        /// <summary>
        /// Gets the property represented by the lambda expression.
        /// </summary>
        /// <exception cref="T:System.ArgumentNullException">The <paramref name="property" /> is null.</exception>
        /// <exception cref="T:System.ArgumentException">The <paramref name="property" /> is not a lambda expression or it does not represent a property access.</exception>
        public static PropertyInfo GetProperty(Expression<Func<TTarget, object>> property)
        {
            var info = GetMemberInfo(property, false) as PropertyInfo;
            if (info == null)
            {
                throw new ArgumentException("Member is not a property");
            }
            return info;
        }

        /// <summary>
        /// Gets the property represented by the lambda expression.        
        /// </summary>
       public static PropertyInfo GetProperty(Expression<Func<TTarget, object>> property, bool checkForSingleDot)
        {
            return GetMemberInfo(property, checkForSingleDot) as PropertyInfo;
        }
        /// <summary>
        /// Returns a MemberInfo for an expression containing a call to a property.
        /// </summary>
        private static MemberInfo GetMemberInfo(Expression member, bool checkForSingleDot)
        {
            if (member == null)
            {
                throw new ArgumentNullException("member");
            }
            var lambda = member as LambdaExpression;
            if (lambda == null)
            {
                throw new ArgumentException(Resources.Reflect_GetMemberInfo_Not_a_lambda_expression, "member");
            }
            MemberExpression memberExpr = null;
            if (lambda.Body.NodeType == ExpressionType.Convert)
            {
                memberExpr = (((UnaryExpression)lambda.Body).Operand as MemberExpression);
            }
            else
            {
                if (lambda.Body.NodeType == ExpressionType.MemberAccess)
                {
                    memberExpr = (lambda.Body as MemberExpression);
                }
            }
            if (memberExpr == null)
            {
                throw new ArgumentException(Resources.Reflect_GetMemberInfo_Not_a_member_access, "member");
            }
            if (!checkForSingleDot)
            {
                return memberExpr.Member;
            }
            if (memberExpr.Expression is ParameterExpression)
            {
                return memberExpr.Member;
            }
            throw new ArgumentException(Resources.Reflect_GetMemberInfo_Argument_passed_contains_more_than_a_single_dot_which_is_not_allowed__ + member, "member");
        }
    }
}

using System;
using System.Linq.Expressions;
using System.Reflection;

namespace Pixytech.Core.Logging
{
    internal static class TypeExtensions
    {
        public static Func<object, T> GetInstancePropertyDelegate<T>(this Type type, string propertyName)
        {
            PropertyInfo propertyInfo = type.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public);
            if (propertyInfo == null)
            {
                throw new InvalidOperationException(string.Format("Could not find property {0} on type {1}", propertyName, type));
            }
            ParameterExpression instanceParam = Expression.Parameter(typeof(object));
            MemberExpression expr = Expression.Property(Expression.Convert(instanceParam, type), propertyInfo);
            return Expression.Lambda<Func<object, T>>(expr, new[]
			{
				instanceParam
			}).Compile();
        }
        public static Action<object, TParam1> GetInstanceMethodDelegate<TParam1>(this Type type, string methodName)
        {
            MethodInfo methodInfo = type.GetMethod(methodName, BindingFlags.Instance | BindingFlags.Public, null, new[]
			{
				typeof(TParam1)
			}, null);
            if (methodInfo == null)
            {
                throw new InvalidOperationException(string.Format("Could not find method {0} on type {1}", methodName, type));
            }
            ParameterExpression instanceParam = Expression.Parameter(typeof(object));
            ParameterExpression param = Expression.Parameter(typeof(TParam1));
            MethodCallExpression expr = Expression.Call(Expression.Convert(instanceParam, type), methodInfo, new Expression[]
			{
				param
			});
            return Expression.Lambda<Action<object, TParam1>>(expr, new[]
			{
				instanceParam,
				param
			}).Compile();
        }
        public static Action<object, TParam1, TParam2> GetInstanceMethodDelegate<TParam1, TParam2>(this Type type, string methodName)
        {
            MethodInfo methodInfo = type.GetMethod(methodName, BindingFlags.Instance | BindingFlags.Public, null, new[]
			{
				typeof(TParam1),
				typeof(TParam2)
			}, null);
            if (methodInfo == null)
            {
                throw new InvalidOperationException(string.Format("Could not find method {0} on type {1}", methodName, type));
            }
            ParameterExpression instanceParam = Expression.Parameter(typeof(object));
            ParameterExpression param = Expression.Parameter(typeof(TParam1));
            ParameterExpression param2 = Expression.Parameter(typeof(TParam2));
            MethodCallExpression expr = Expression.Call(Expression.Convert(instanceParam, type), methodInfo, new Expression[]
			{
				param,
				param2
			});
            return Expression.Lambda<Action<object, TParam1, TParam2>>(expr, new[]
			{
				instanceParam,
				param,
				param2
			}).Compile();
        }
        public static Func<T, TReturn> GetStaticFunctionDelegate<T, TReturn>(this Type type, string methodName)
        {
            MethodInfo methodInfo = type.GetMethod(methodName, BindingFlags.Static | BindingFlags.Public, null, new[]
			{
				typeof(T)
			}, null);
            if (methodInfo == null)
            {
                throw new InvalidOperationException(string.Format("Could not find method {0} on type {1}", methodName, type));
            }
            ParameterExpression param = Expression.Parameter(typeof(T));
            return Expression.Lambda<Func<T, TReturn>>(Expression.Call(methodInfo, param), new[]
			{
				param
			}).Compile();
        }
    }
}

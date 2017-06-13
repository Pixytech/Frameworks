using System;
using System.Linq;
using System.Reflection;

namespace Pixytech.Core.Logging
{
    internal static class ReflectionExtensions
    {
        public static object SetStaticProperty(this Type type, string propertyName, object val)
        {
            return type.InvokeMember(propertyName, BindingFlags.Static | BindingFlags.Public | BindingFlags.SetProperty, null, null, new[]
			{
				val
			});
        }
        public static object GetStaticProperty(this Type type, string propertyName)
        {
            return type.InvokeMember(propertyName, BindingFlags.Static | BindingFlags.Public | BindingFlags.GetProperty, null, null, null);
        }
        public static object GetStaticField(this Type type, string fieldName, bool ignoreCase = false)
        {
            BindingFlags bindingFlags = BindingFlags.Static | BindingFlags.Public | BindingFlags.GetField;
            if (ignoreCase)
            {
                bindingFlags |= BindingFlags.IgnoreCase;
            }
            return type.InvokeMember(fieldName, bindingFlags, null, null, null);
        }
        public static object InvokeStaticMethod(this Type type, string methodName, params object[] args)
        {
            Type[] argTypes = (
                from x in args
                select x.GetType()).ToArray<Type>();
            MethodInfo methodInfo = type.GetMethod(methodName, BindingFlags.Static | BindingFlags.Public, null, argTypes, null);
            if (methodInfo == null)
            {
                throw new InvalidOperationException(string.Format("Could not find static method {0} on type {1}", methodName, type));
            }
            return methodInfo.Invoke(null, args);
        }
    }
}

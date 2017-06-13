using System;
using System.IO;
using System.Reflection;
using System.Security;
using System.Windows;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry
{
    public sealed class AssemblyPart : DependencyObject
    {
        /// <summary>Identifies the <see cref="P:System.Windows.AssemblyPart.Source" /> dependency property.</summary>
        /// <returns>The identifier for the <see cref="P:System.Windows.AssemblyPart.Source" /> dependency property.</returns>
        public static readonly DependencyProperty SourceProperty = DependencyProperty.Register("Source", typeof(string),typeof(AssemblyPart));
        /// <summary>Gets the <see cref="T:System.Uri" /> that identifies an assembly as an assembly part.</summary>
        /// <returns>A <see cref="T:System.String" /> that is the assembly, which is identified as an assembly part.</returns>
        public string Source
        {
            get
            {
                return (string)GetValue(SourceProperty);
            }
            set
            {
                SetValue(SourceProperty, value);
            }
        }
      
        /// <summary>Converts a <see cref="T:System.IO.Stream" /> to an <see cref="T:System.Reflection.Assembly" /> that is subsequently loaded into the current application domain.</summary>
        /// <returns>The <see cref="T:System.Reflection.Assembly" /> that is subsequently loaded into the current application domain.</returns>
        /// <param name="assemblyStream">The <see cref="T:System.IO.Stream" /> to load into the current application domain.</param>
        [SecuritySafeCritical]
        public void Save(string moduleName, string partName, Stream assemblyStream)
        {
            
            assemblyStream.Position = 0L;

            var moduleDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Components", moduleName);

            if (!Directory.Exists(moduleDir))
            {
                Directory.CreateDirectory(moduleDir);
            }

            var assemblyName = Path.Combine(moduleDir, partName);
            
            try
            {
                if (File.Exists(assemblyName))
                {
                    File.Delete(assemblyName);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(string.Format("Exception while extracting component {0} part {1}, {2}",moduleName,partName, ex));
            }

            if (!File.Exists(assemblyName))
            {

                using (Stream file = File.Create(assemblyName))
                {
                    assemblyStream.CopyTo(file);
                }
            }
        }
    }
}

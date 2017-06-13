using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using System.Xml.Linq;

namespace Pixytech.Desktop.Presentation.Infrastructure.Modulatiry.Tools
{
    public static class ModulePackager
    {
        public static void Copy(string sourceDirectory, string targetDirectory)
        {
            DirectoryInfo diSource = new DirectoryInfo(sourceDirectory);
            DirectoryInfo diTarget = new DirectoryInfo(targetDirectory);

            CopyAll(diSource, diTarget);
        }

        public static void CopyAll(DirectoryInfo source, DirectoryInfo target)
        {
            Directory.CreateDirectory(target.FullName);

            // Copy each file into the new directory.
            foreach (FileInfo fi in source.GetFiles())
            {
                fi.CopyTo(Path.Combine(target.FullName, fi.Name), true);
            }

            // Copy each subdirectory using recursion.
            foreach (DirectoryInfo diSourceSubDir in source.GetDirectories())
            {
                DirectoryInfo nextTargetSubDir =
                    target.CreateSubdirectory(diSourceSubDir.Name);
                CopyAll(diSourceSubDir, nextTargetSubDir);
            }
        }


        public static void CreateXapFile(string xapFilePath)
        {
            try
            {
                // arg1 - path to target output
                var localZip = string.Format("{0}.xap", xapFilePath);

                var tempCompressed = Path.GetTempFileName() + ".zip";

                if (File.Exists(tempCompressed))
                {
                    File.Delete(tempCompressed);
                }

                var dirPath = Path.GetDirectoryName(xapFilePath);

               
                if (File.Exists(localZip))
                {
                    Console.WriteLine("Deleting old xap file {0} ", localZip);
                    File.Delete(localZip);
                }

                var tempDirPath = Path.Combine(Path.GetTempPath(), string.Format("ModulePackager_{0}\\", Path.GetFileNameWithoutExtension(xapFilePath)));

                Console.WriteLine(tempDirPath);

                if (Directory.Exists(tempDirPath))
                {
                    Directory.Delete(tempDirPath,true);
                }

                Copy(dirPath, tempDirPath);

                Console.WriteLine("Packaging {0} to {1}", dirPath, localZip);

                var moduleFileName = Path.Combine(tempDirPath, Path.GetFileName(xapFilePath));

                CreateAppManifest(xapFilePath,moduleFileName);

                System.IO.Compression.ZipFile.CreateFromDirectory(tempDirPath, tempCompressed);

                File.Copy(tempCompressed, localZip, true);

                File.Delete(tempCompressed);

                Directory.Delete(tempDirPath,true);
                //File.Delete(manifestFile);
            }
            catch (Exception exception)
            {
                Console.Error.WriteLine(exception.ToString());
                Environment.Exit(1);
            }
        }

        private static string CreateAppManifest(string sourcePath, string targetPath)
        {

            var manifestFile = string.Format("{0}\\AppManifest.xaml", Path.GetDirectoryName(targetPath));


            if (File.Exists(manifestFile))
            {
                File.Delete(manifestFile);
            }

            var modulePackagerFile = string.Format("{0}\\ModulePackager.xml", Path.GetDirectoryName(targetPath));
            var filesToExclude = new List<string>();
            if (File.Exists(modulePackagerFile))
            {
                filesToExclude.AddRange(GetFilesToExclude(modulePackagerFile));
                File.Delete(modulePackagerFile);
            }

            var assemblyName = AssemblyName.GetAssemblyName(sourcePath);

            var assembly = Assembly.Load(assemblyName);

            var moduleAttribute = GetModuleAttribute(assembly);

            if (moduleAttribute == null)
            {
                throw new InvalidDataException(string.Format("Assembly {0} does not conatins a ModuleAssemblyAttribute", Path.GetFileName(sourcePath)));
            }

            var moduleTypeName = moduleAttribute.EntryPointModuleType.FullName;

            var moduleName = moduleAttribute.ModuleName;


            XNamespace xmlns = XNamespace.Get("http://schemas.microsoft.com/client/2007/deployment");

            var x = XNamespace.Get("http://schemas.microsoft.com/winfx/2006/xaml");

            var doc = new XDocument(new XDeclaration("1.0", "utf-8", null));

            var deployment = new XElement(xmlns + "Deployment", new XAttribute(XNamespace.Xmlns + "x", x.ToString()));
            deployment.Add(new XAttribute("EntryPointAssembly", Path.GetFileNameWithoutExtension(sourcePath)));
            deployment.Add(new XAttribute("EntryPointType", moduleTypeName));
            deployment.Add(new XAttribute("ModuleName", moduleName));
            deployment.Add(new XAttribute("RuntimeVersion", assembly.ImageRuntimeVersion));

            doc.Add(deployment);


            var deploymentParts = new XElement("Deployment.Parts");

            deployment.Add(deploymentParts);

            var rootPath = Path.GetDirectoryName(targetPath) + "//";

            foreach (var filePart in Directory.EnumerateFiles(rootPath, "*.*", SearchOption.AllDirectories))
            {
                var fileName = Path.GetFileNameWithoutExtension(filePart);
                if (filesToExclude.Contains(fileName, StringComparer.Create(CultureInfo.CurrentCulture, true)))
                {
                    if (File.Exists(filePart))
                    {
                        File.Delete(filePart);
                    }
                    Console.WriteLine("Module packager skipped file {0}", fileName);
                    continue;
                }
                var assemblyPart = new XElement("AssemblyPart");

                assemblyPart.Add(new XAttribute("Source", GetRelativePath(rootPath, filePart)));

                deploymentParts.Add(assemblyPart);
            }

            doc.Save(manifestFile);

            Console.WriteLine("Creating Manifest file {0}", manifestFile);

            return manifestFile;
        }

        private static IEnumerable<string> GetFilesToExclude(string modulePackagerFile)
        {
            var result = new List<string> {Path.GetFileName(modulePackagerFile)};
            var modulePackager = XElement.Load(modulePackagerFile, LoadOptions.None);
            var excludeAssemblies = modulePackager.Element("ExcludeAssemblies");
            if (excludeAssemblies != null)
            {
                var namesData = excludeAssemblies.Value;
                if (!string.IsNullOrEmpty(namesData))
                {
                    var names = namesData.Split(new[] {"\n", Environment.NewLine}, StringSplitOptions.RemoveEmptyEntries);
                    result.AddRange(names.Select(name => name.Trim()).Where(trimmed => !string.IsNullOrEmpty(trimmed)));
                }
            }

            return result;
        }

        private static ModuleAssemblyAttribute GetModuleAttribute(Assembly assembly)
        {
            // we have to do this to avoid versioning issues ModuleAssemblyAttribute. since this is packed inside the resources
            var moduleAttributeData = assembly.CustomAttributes.FirstOrDefault(x => x.AttributeType.FullName.Equals(typeof(ModuleAssemblyAttribute).FullName));

            if (moduleAttributeData != null)
            {

                var moduleAttribute = assembly.GetCustomAttributes(moduleAttributeData.AttributeType, false).FirstOrDefault();
                if (moduleAttribute != null)
                {
                    var moduleAttributeType = moduleAttribute.GetType();
                    var moduleNameProperty = moduleAttributeType.GetProperties().First(x => x.Name == GetPropertyName<ModuleAssemblyAttribute>(p => p.ModuleName));
                    var entryPointModuleTypeProperty = moduleAttributeType.GetProperties().First(x => x.Name == GetPropertyName<ModuleAssemblyAttribute>(p => p.EntryPointModuleType));

                    return new ModuleAssemblyAttribute((string)moduleNameProperty.GetValue(moduleAttribute),
                        (Type)entryPointModuleTypeProperty.GetValue(moduleAttribute));
                }
            }
            return null;
        }

        private static string GetPropertyName<TObject>(Expression<Func<TObject, object>> action)
        {
            var expression = (MemberExpression)action.Body;
            string name = expression.Member.Name;
            return name;
        }

        private static string GetRelativePath(string rootPath, string filePart)
        {
            var baseUri = new Uri(rootPath);
            var destinationUri = new Uri(filePart);
            var relativePath = baseUri.MakeRelativeUri(destinationUri);
            return Uri.UnescapeDataString(relativePath.ToString());
        }

        private static string GetModuleAssemblyQualifiedName(Assembly assembly)
        {
            ;
            foreach (var type in assembly.GetTypes())
            {
                var prismModule = type.GetInterface("Microsoft.Practices.Prism.Modularity.IModule");
                if (prismModule != null)
                {
                    return type.AssemblyQualifiedName;
                }
            }
            return string.Empty;
        }
    }
}

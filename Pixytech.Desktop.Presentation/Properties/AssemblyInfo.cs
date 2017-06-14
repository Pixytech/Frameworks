using System.Reflection;
using System.Runtime.CompilerServices;
using System.Runtime.InteropServices;
using System.Security;
using System.Windows;
using System.Windows.Markup;

// General Information about an assembly is controlled through the following
// set of attributes. Change these attribute values to modify the information
// associated with an assembly.
[assembly: AssemblyTitle("Pixytech.Desktop.Presentation")]
[assembly: AssemblyDescription("")]
[assembly: AssemblyConfiguration("")]
[assembly: AssemblyCompany("")]
[assembly: AssemblyProduct("Pixytech.Desktop.Presentation")]
[assembly: AssemblyCopyright("Copyright ©  2017")]
[assembly: AssemblyTrademark("")]
[assembly: AssemblyCulture("")]

// Setting ComVisible to false makes the types in this assembly not visible
// to COM components.  If you need to access a type in this assembly from
// COM, set the ComVisible attribute to true on that type.
[assembly: ComVisible(false)]

// The following GUID is for the ID of the typelib if this project is exposed to COM
[assembly: Guid("9d679b46-3629-4143-b77f-abd6e0ac4490")]

// Version information for an assembly consists of the following four values:
//
//      Major Version
//      Minor Version
//      Build Number
//      Revision
//
// You can specify all the values or you can default the Build and Revision Numbers
// by using the '*' as shown below:
// [assembly: AssemblyVersion("1.0.*")]
[assembly: AssemblyFileVersion("1.0.0.0")]

//In order to begin building localizable applications, set 
//<UICulture>CultureYouAreCodingWith</UICulture> in your .csproj file
//inside a <PropertyGroup>.  For example, if you are using US english
//in your source files, set the <UICulture> to en-US.  Then uncomment
//the NeutralResourceLanguage attribute below.  Update the "en-US" in
//the line below to match the UICulture setting in the project file.

//[assembly: NeutralResourcesLanguage("en-US", UltimateResourceFallbackLocation.Satellite)]


[assembly: ThemeInfo(
    ResourceDictionaryLocation.SourceAssembly, //where theme specific resource dictionaries are located
                                               //(used if a resource is not found in the page, 
                                               // or application resource dictionaries)
    ResourceDictionaryLocation.SourceAssembly //where the generic resource dictionary is located
                                              //(used if a resource is not found in the page, 
                                              // app, or any theme specific resource dictionaries)
)]

[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.Behaviors")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.AvalonDock")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.Bindings")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.Controls")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.Converters")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.DataVisualization")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.Interactivity")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.AvalonDock.Themes")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.AvalonDock.Controls")]
[assembly: XmlnsDefinition("http://www.pixytech.com/presentation", "Pixytech.Desktop.Presentation.AvalonDock.Layout")]


[assembly: AllowPartiallyTrustedCallers]
[assembly: SecurityRules(SecurityRuleSet.Level1)]
[assembly: XmlnsPrefix("http://www.pixytech.com/presentation", "corepresentation")]
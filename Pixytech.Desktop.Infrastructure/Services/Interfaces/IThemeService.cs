using System.Collections.Generic;

namespace Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces
{
    public interface IThemeService
    {
        ICollection<ITheme> Themes { get; }
        ITheme CurrenTheme { get; set; }
        
        ITheme GetSavedTheme(string name);
        void SaveTheme(string name, ITheme theme);

        bool CustomizeTheme();
    }
}

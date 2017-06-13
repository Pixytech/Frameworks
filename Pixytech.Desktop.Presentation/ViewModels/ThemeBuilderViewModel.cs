using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Media;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure.Commands;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;

namespace Pixytech.Desktop.Presentation.ViewModels
{
    /// <summary>
    /// A simple view model for configuring theme, font and accent colors.
    /// </summary>
    public class ThemeBuilderViewModel : ViewModelBase
    {
        private const string FontSmall = "Small";

        private const string FontLarge = "Large";

        private readonly IThemeService _themeService;

        // 9 accent colors from metro design principles
        /*private Color[] accentColors = new Color[]{
            Color.FromRgb(0x33, 0x99, 0xff),   // blue
            Color.FromRgb(0x00, 0xab, 0xa9),   // teal
            Color.FromRgb(0x33, 0x99, 0x33),   // green
            Color.FromRgb(0x8c, 0xbf, 0x26),   // lime
            Color.FromRgb(0xf0, 0x96, 0x09),   // orange
            Color.FromRgb(0xff, 0x45, 0x00),   // orange red
            Color.FromRgb(0xe5, 0x14, 0x00),   // red
            Color.FromRgb(0xff, 0x00, 0x97),   // magenta
            Color.FromRgb(0xa2, 0x00, 0xff),   // purple            
        };*/

        // 20 accent colors from Windows Phone 8
        private readonly Color[] _accentColors =
            {
                Color.FromRgb(0xa4, 0xc4, 0x00), // lime
                Color.FromRgb(0x60, 0xa9, 0x17), // green
                Color.FromRgb(0x00, 0x8a, 0x00), // emerald
                Color.FromRgb(0x00, 0xab, 0xa9), // teal
                Color.FromRgb(0x1b, 0xa1, 0xe2), // cyan
                Color.FromRgb(0x00, 0x50, 0xef), // cobalt
                Color.FromRgb(0x6a, 0x00, 0xff), // indigo
                Color.FromRgb(0xaa, 0x00, 0xff), // violet
                Color.FromRgb(0xf4, 0x72, 0xd0), // pink
                Color.FromRgb(0xd8, 0x00, 0x73), // magenta
                Color.FromRgb(0xa2, 0x00, 0x25), // crimson
                Color.FromRgb(0xe5, 0x14, 0x00), // red
                Color.FromRgb(0xfa, 0x68, 0x00), // orange
                Color.FromRgb(0xf0, 0xa3, 0x0a), // amber
                Color.FromRgb(0xe3, 0xc8, 0x00), // yellow
                Color.FromRgb(0x82, 0x5a, 0x2c), // brown
                Color.FromRgb(0x6d, 0x87, 0x64), // olive
                Color.FromRgb(0x64, 0x76, 0x87), // steel
                Color.FromRgb(0x76, 0x60, 0x8a), // mauve
                Color.FromRgb(0x87, 0x79, 0x4e) // taupe
            };
        private readonly IDialogService _dialogService;

        public ThemeBuilderViewModel(IThemeService themeService, IDialogService dialogService)
        {
            _dialogService = dialogService;
            _themeService = themeService;
            SelectedTheme = _themeService.CurrenTheme;
            SelectedFontSize = themeService.CurrenTheme.FontSize == FontSize.Large ? FontLarge : FontSmall;
            SaveCommand = new DelegateCommand(OnSave);
        }

        private void OnSave()
        {
            _dialogService.Close(this,true);
        }

        public IEnumerable<ITheme> Themes { get { return _themeService.Themes; } }

        public string[] FontSizes
        {
            get
            {
                return new[] { FontSmall, FontLarge };
            }
        }

        public Color[] AccentColors
        {
            get
            {
                return _accentColors;
            }
        }

        public ITheme SelectedTheme
        {
            get
            {
                return GetProperty<ITheme>();
            }

            set
            {
                if (SetProperty(value))
                {
                    _themeService.CurrenTheme = value;
                }
            }
        }

        public string SelectedFontSize
        {
            get
            {
                return _themeService.CurrenTheme.FontSize.ToString();
            }

            set
            {
                _themeService.CurrenTheme.FontSize = (value == FontLarge ? FontSize.Large : FontSize.Small);
                OnPropertyChanged("SelectedFontSize");
            }
        }

        public Color SelectedAccentColor
        {
            get
            {
                return
                    ((SolidColorBrush) (new BrushConverter().ConvertFrom(_themeService.CurrenTheme.AccentColor))).Color;
            }

            set
            {
                _themeService.CurrenTheme.AccentColor = value.ToString();
                OnPropertyChanged("SelectedAccentColor");
            }
        }

        public DelegateCommand SaveCommand { get; private set; }
    }
}

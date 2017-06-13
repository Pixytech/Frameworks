using System;
using System.Reflection;
using System.Windows;
using System.Windows.Media;
using Microsoft.Practices.Prism.PubSubEvents;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;

namespace Pixytech.Desktop.Presentation.Services
{
    public class Theme : ViewModelBase, ITheme
    {
        /// <summary>
        /// The resource key for the accent color.
        /// </summary>
        public const string KeyAccentColor = "AccentColor";

        /// <summary>
        /// The resource key for the accent brush.
        /// </summary>
        public const string KeyAccent = "Accent";

        /// <summary>
        /// The resource key for the default font size.
        /// </summary>
        public const string KeyDefaultFontSize = "DefaultFontSize";

        /// <summary>
        /// The resource key for the fixed font size.
        /// </summary>
        public const string KeyFixedFontSize = "FixedFontSize";


        private readonly IResourceAggregator _resourceAggregator;
        private readonly IEventAggregator _eventAggregator;
        public Theme(string name, Uri source, IResourceAggregator resourceAggregator, IEventAggregator eventAggregator)
        {
            var currentResource = string.Format("{0}", source);
            if (!currentResource.ToLower().Contains(";component/"))
            {
                var callingAssembly = Assembly.GetCallingAssembly();
                var assemblyName = callingAssembly.GetName().Name;

                source = new Uri(string.Format("/{0};component/{1}", assemblyName, source),
                    UriKind.RelativeOrAbsolute);
            }

            Name = name;
            Source = source;
            _resourceAggregator = resourceAggregator;
            _eventAggregator = eventAggregator;
        }

        public string Name { get; private set; }

        public Uri Source { get; private set; }

        public FontSize FontSize
        {
            get { return GetFontSize(); }
            set
            {
                SetFontSize(value);
                OnPropertyChanged(()=>FontSize);
            }
        }

        public string AccentColor
        {
            get
            {
                Color accentColor = GetAccentColor();
                return accentColor.ToString();
            }
            set
            {
                SetProperty(value);
                 var color = ((SolidColorBrush) (new BrushConverter().ConvertFrom(value))).Color;
                ApplyAccentColor(color);
                OnPropertyChanged(()=>AccentColor);
                _eventAggregator.GetEvent<ThemeChanged>().Publish(null);
            }
        }

        private Color GetAccentColor()
        {
            var accentColor = Application.Current.Resources[KeyAccentColor] as Color?;

            if (accentColor.HasValue)
            {
                return accentColor.Value;
            }

            // default color: teal
            return Color.FromArgb(0xff, 0x1b, 0xa1, 0xe2);
        }

        private void ApplyAccentColor(Color accentColor)
        {
            var app = Application.Current;
            // set accent color and brush resources
            if (_resourceAggregator.TryUpdateResource(KeyAccentColor, accentColor))
            {
                if (app != null)
                {
                    app.Resources[KeyAccentColor] = accentColor;
                }
            }

            if (_resourceAggregator.TryUpdateResource(KeyAccent, new SolidColorBrush(accentColor)))
            {
                if (app != null)
                {
                    app.Resources[KeyAccent] = new SolidColorBrush(accentColor);
                }
            }
        }

        private FontSize GetFontSize()
        {
            double defaultFontSize;

            if (_resourceAggregator.TryGetResource(KeyDefaultFontSize, out defaultFontSize))
            {
                return defaultFontSize == 12D ? FontSize.Small : FontSize.Large;
            }

            // default large
            return FontSize.Large;
        }

        private void SetFontSize(FontSize fontSize)
        {
            if (this.GetFontSize() == fontSize)
            {
                return;
            }

            var defFontSize = fontSize == FontSize.Small ? 12D : 13D;
            var fixedfontSize = fontSize == FontSize.Small ? 10.667D : 13.333D;

            var app = Application.Current;

            if (_resourceAggregator.TryUpdateResource(KeyDefaultFontSize, defFontSize))
            {
                if (app != null)
                {
                    app.Resources[KeyDefaultFontSize] = defFontSize;
                }
            };

            if (_resourceAggregator.TryUpdateResource(KeyFixedFontSize, fixedfontSize))
            {
                if (app != null)
                {
                    app.Resources[KeyFixedFontSize] = fixedfontSize;
                }
            };

            _eventAggregator.GetEvent<ThemeChanged>().Publish(null);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Windows;
using Pixytech.Core.IoC;
using Microsoft.Practices.Prism.PubSubEvents;
using Pixytech.Desktop.Presentation.Infrastructure;
using Pixytech.Desktop.Presentation.Infrastructure.Services.Interfaces;
using Pixytech.Desktop.Presentation.ViewModels;

namespace Pixytech.Desktop.Presentation.Services
{
    public class ThemeService : ViewModelBase, IThemeService
    {
        private readonly IResourceAggregator _resourceAggregator;
        private readonly IDialogService _dialogService;
        private readonly IEventAggregator _eventAggregator;

        public ThemeService(IResourceAggregator resourceAggregator, IDialogService dialogService, IEventAggregator eventAggregator)
        {
            _resourceAggregator = resourceAggregator;
            _dialogService = dialogService;
            _eventAggregator = eventAggregator;
            Themes = new Collection<ITheme>
            {
                new Theme("Dark",
                    new Uri("Assets/ModernUI.Dark.xaml", UriKind.RelativeOrAbsolute),_resourceAggregator,eventAggregator),
                new Theme("Light",
                    new Uri("Assets/ModernUI.Light.xaml",
                        UriKind.RelativeOrAbsolute),_resourceAggregator,eventAggregator)
            };

            CurrenTheme = Themes.FirstOrDefault();
        }

        public ICollection<ITheme> Themes { get; private set; }

        public ITheme CurrenTheme
        {
            get { return GetCurrentTheme(); }
            set
            {
                var previousTheme = CurrenTheme;
                RemoveTheme(previousTheme);
                SetThemeSource(value, true);
            }
        }

        private ITheme GetCurrentTheme()
        {
            foreach (var theme in Themes)
            {
                ResourceDictionary resourceDictionary;
                if (_resourceAggregator.TryGetResourceDictionary(theme.Source.ToString(), out resourceDictionary))
                {
                    return theme;
                }
            }
            return null;
        }

        private void RemoveTheme(ITheme previousTheme)
        {
            if (previousTheme != null)
            {
                _resourceAggregator.TryRemoveResource(previousTheme.Source.ToString());
            }
        }

        private void SetThemeSource(ITheme theme, bool useThemeAccentColor)
        {
            if (theme == null)
            {
                throw new ArgumentNullException("theme");
            }

            _resourceAggregator.AddResource(theme.Source.ToString());
            var accentColor = theme.AccentColor;
            if (useThemeAccentColor )
            {
                theme.AccentColor = accentColor;
            }

            _eventAggregator.GetEvent<ThemeChanged>().Publish(null);
        }

        public ITheme GetSavedTheme(string name)
        {
           // get theme from isolated storage
            return null;
        }

        public void SaveTheme(string name, ITheme theme)
        {
            // save theme to isolated storage
        }

        public bool CustomizeTheme()
        {
            var themeBuilder = ObjectFactory.Builder.Build<ThemeBuilderViewModel>();
            return _dialogService.ShowDialog(themeBuilder,
                new DialogOptions
                {
                    ActivateParentAfterClose = true,
                    AutoHideHeader = false,
                    IsHeaderVisible = true,
                    IsTitleVisible = true,
                    Title = "Visual Theme Editor",
                    ShowInTaskbar = false,
                    ShowActivated = true
                }) == true;
        }
    }
}

﻿/*************************************************************************************

   Extended WPF Toolkit

   Copyright (C) 2007-2013 Xceed Software Inc.

   This program is provided to you under the terms of the Microsoft Public
   License (Ms-PL) as published at http://wpftoolkit.codeplex.com/license 

   For more features, controls, and fast professional support,
   pick up the Plus Edition at http://xceed.com/wpf_toolkit

   Stay informed: follow @datagrid on Twitter or Like http://facebook.com/datagrids

  ***********************************************************************************/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Windows.Data;
using Pixytech.Desktop.Presentation.AvalonDock.Layout;
using Pixytech.Desktop.Presentation.AvalonDock.Controls;

namespace Pixytech.Desktop.Presentation.AvalonDock.Converters
{
    public class AutoHideCommandLayoutItemFromLayoutModelConverter : IValueConverter
    {
        public object Convert(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            //when this converter is called layout could be constructing so many properties here are potentially not valid
            var layoutModel = value as LayoutContent;
            if (layoutModel == null)
                return null;
            if (layoutModel.Root == null)
                return null;
            if (layoutModel.Root.Manager == null)
                return null;

            var layoutItemModel = layoutModel.Root.Manager.GetLayoutItemFromModel(layoutModel) as LayoutAnchorableItem;
            if (layoutItemModel == null)
                return Binding.DoNothing;

            return layoutItemModel.AutoHideCommand;
        }

        public object ConvertBack(object value, Type targetType, object parameter, System.Globalization.CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}

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
using System.Windows;

namespace Pixytech.Desktop.Presentation.AvalonDock.Controls
{
    internal interface IOverlayWindowHost
    {
        bool HitTest(Point dragPoint);

        IOverlayWindow ShowOverlayWindow(LayoutFloatingWindowControl draggingWindow);

        void HideOverlayWindow();

        IEnumerable<IDropArea> GetDropAreas(LayoutFloatingWindowControl draggingWindow);

        DockingManager Manager { get; }
    }
}
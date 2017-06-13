using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;

namespace Pixytech.Desktop.Presentation.Controls.Sketch
{
    public class SketchBorder : ContentControl
    {
        static SketchBorder()
        {
            BackgroundProperty.OverrideMetadata(typeof(SketchBorder), new FrameworkPropertyMetadata(Brushes.White));
            BorderBrushProperty.OverrideMetadata(typeof(SketchBorder), new FrameworkPropertyMetadata(Brushes.Black));
            DefaultStyleKeyProperty.OverrideMetadata(typeof(SketchBorder), new FrameworkPropertyMetadata(typeof(SketchBorder)));
        }
        public SketchBorder()
        {
            Content = null;
        }
    }
}

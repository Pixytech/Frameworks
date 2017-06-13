using System;
using System.Windows;
using System.Windows.Media;

namespace Pixytech.Desktop.Presentation.Controls.Sketch
{
    public class SketchRectangle : SketchBase
    {
        public static readonly DependencyProperty RadiusProperty;
        public double Radius
        {
            get
            {
                return (double)GetValue(RadiusProperty);
            }
            set
            {
                SetValue(RadiusProperty, Math.Max(value, 0.0));
            }
        }

        static SketchRectangle()
        {
            RadiusProperty = DependencyProperty.Register("Radius", typeof(double), typeof(SketchRectangle), new FrameworkPropertyMetadata(0.0, FrameworkPropertyMetadataOptions.AffectsRender, null, CoerceRadiusValue));
            BackgroundProperty.OverrideMetadata(typeof(SketchRectangle), new FrameworkPropertyMetadata(Brushes.White));
            BorderBrushProperty.OverrideMetadata(typeof(SketchRectangle), new FrameworkPropertyMetadata(Brushes.Black));
        }

        protected static object CoerceRadiusValue(DependencyObject sender, object value)
        {
            var sketchRectangleUc = sender as SketchRectangle;
            if (value is double && sketchRectangleUc != null)
            {
                if (!double.IsNaN(sketchRectangleUc.Width))
                {
                    value = Math.Min((double)value, sketchRectangleUc.Width / 2.0);
                }
                if (!double.IsNaN(sketchRectangleUc.Height))
                {
                    value = Math.Min((double)value, sketchRectangleUc.Height / 2.0);
                }
                value = Math.Max((double)value, 0.0);
            }
            return value;
        }

        protected override void OnPropertyChanged(DependencyPropertyChangedEventArgs e)
        {
            base.OnPropertyChanged(e);
            if (e.Property == RadiusProperty || e.Property == WidthProperty || e.Property == HeightProperty)
            {
                CoerceValue(RadiusProperty);
                IsDirty = true;
            }
        }
        protected override Size ArrangeOverride(Size arrangeBounds)
        {
            if (OldSize != arrangeBounds || IsDirty)
            {
                OldSize = arrangeBounds;
                IsDirty = false;
                DrawPath.Stroke = BorderBrush;
                DrawPath.StrokeThickness = StrokeWidth;
                DrawPath.StrokeStartLineCap = PenLineCap.Round;
                DrawPath.StrokeEndLineCap = PenLineCap.Round;
                DrawPath.StrokeLineJoin = PenLineJoin.Round;
                DrawPath.StrokeThickness = 0.0;
                ClipToBounds = false;
                DrawPath.ClipToBounds = false;
                if (Math.Abs(Radius) < 0.0)
                {
                    double num = arrangeBounds.Width - StrokeWidth;
                    double num2 = arrangeBounds.Height - StrokeWidth;
                    num2 = Math.Max(num2, 0.0);
                    num = Math.Max(num, 0.0);
                    var rect = new Rect(StrokeWidth / 2.0, StrokeWidth / 2.0, num, num2);
                    var point = new Point(rect.Left, rect.Top);
                    var point2 = new Point(rect.Left + num, rect.Top);
                    var point3 = new Point(rect.Left + num, rect.Top + num2);
                    var point4 = new Point(rect.Left, rect.Top + num2);
                    var pathGeometry = new PathGeometry();
                    DrawSegment(point, point2, pathGeometry);
                    DrawSegment(point2, point3, pathGeometry);
                    DrawSegment(point3, point4, pathGeometry);
                    DrawSegment(point4, point, pathGeometry);
                    if (ExtensionLength + ExtensionVariance > 0.0)
                    {
                        DrawExtensions(point, point4, point2, pathGeometry);
                        DrawExtensions(point2, point, point3, pathGeometry);
                        DrawExtensions(point3, point2, point4, pathGeometry);
                        DrawExtensions(point4, point3, point, pathGeometry);
                    }
                    DrawPath.Data = pathGeometry;
                }
                else
                {
                    double num3 = arrangeBounds.Width - StrokeWidth;
                    double num4 = arrangeBounds.Height - StrokeWidth;
                    num4 = Math.Max(num4, 0.0);
                    num3 = Math.Max(num3, 0.0);
                    var rect2 = new Rect(StrokeWidth / 2.0, StrokeWidth / 2.0, num3, num4);
                    var rectangleGeometry = new RectangleGeometry(rect2, Radius, Radius);
                    var flattenedPathGeometry = rectangleGeometry.GetFlattenedPathGeometry();
                    DrawPath.Data = BuildWiggledGeometry(flattenedPathGeometry);
                }
            }
            return base.ArrangeOverride(arrangeBounds);
        }
    }
}

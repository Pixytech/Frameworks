using System;
using System.Collections.Generic;
using System.Windows;
using System.Windows.Media;

namespace Pixytech.Desktop.Presentation.Controls.Sketch
{
    public class SketchCircle : SketchBase
    {
        public static readonly DependencyProperty SegmentsProperty;
        public int Segments
        {
            get
            {
                return (int)GetValue(SegmentsProperty);
            }
            set
            {
                SetValue(SegmentsProperty, value);
            }
        }
        static SketchCircle()
        {
            SegmentsProperty = DependencyProperty.Register("Segments", typeof(int), typeof(SketchCircle), new FrameworkPropertyMetadata(20, FrameworkPropertyMetadataOptions.AffectsRender));
            BackgroundProperty.OverrideMetadata(typeof(SketchCircle), new FrameworkPropertyMetadata(Brushes.White));
            BorderBrushProperty.OverrideMetadata(typeof(SketchCircle), new FrameworkPropertyMetadata(Brushes.Black));
        }
        protected override Size ArrangeOverride(Size arrangeBounds)
        {
            double num = arrangeBounds.Width - StrokeWidth;
            double num2 = arrangeBounds.Height - StrokeWidth;
            if (num2 < 0.0 || num < 0.0)
            {
                return base.ArrangeOverride(arrangeBounds);
            }
            var list = new List<Point>();
            double num3 = 6.2831853071795862 / Segments;
            double num4 = num / 2.0;
            double num5 = num2 / 2.0;
            for (int i = 0; i < Segments; i++)
            {
                var item = new Point(num4 * Math.Cos(i * num3) + arrangeBounds.Width / 2.0, num5 * Math.Sin(i * num3) + arrangeBounds.Height / 2.0);
                list.Add(item);
            }
            var pathGeometry = new PathGeometry();
            for (var j = 0; j < list.Count; j++)
            {
                Point point;
                Point point2;
                if (j == list.Count - 1)
                {
                    point = new Point(list[j].X, list[j].Y);
                    point2 = new Point(list[0].X, list[0].Y);
                }
                else
                {
                    point = new Point(list[j].X, list[j].Y);
                    point2 = new Point(list[j + 1].X, list[j + 1].Y);
                }
                DrawSegment(point, point2, pathGeometry);
            }
            DrawPath.Data = pathGeometry;
            return base.ArrangeOverride(arrangeBounds);
        }
    }
}

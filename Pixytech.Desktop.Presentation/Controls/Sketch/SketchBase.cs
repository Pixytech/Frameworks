using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Media;
using System.Windows.Shapes;

namespace Pixytech.Desktop.Presentation.Controls.Sketch
{
    public abstract class SketchBase : Control
    {
        public static readonly DependencyProperty SegmentLengthProperty = DependencyProperty.Register("SegmentLength", typeof(double), typeof(SketchBase), new FrameworkPropertyMetadata(10.0, FrameworkPropertyMetadataOptions.AffectsMeasure | FrameworkPropertyMetadataOptions.AffectsRender));
        public static readonly DependencyProperty ExtensionLengthProperty = DependencyProperty.Register("ExtensionLength", typeof(double), typeof(SketchBase), new FrameworkPropertyMetadata(0.0, FrameworkPropertyMetadataOptions.AffectsMeasure | FrameworkPropertyMetadataOptions.AffectsRender));
        public static readonly DependencyProperty ExtensionVarianceProperty = DependencyProperty.Register("ExtensionVariance", typeof(double), typeof(SketchBase), new FrameworkPropertyMetadata(0.0, FrameworkPropertyMetadataOptions.AffectsMeasure | FrameworkPropertyMetadataOptions.AffectsRender));
        public static readonly DependencyProperty SegmentVarianceProperty = DependencyProperty.Register("SegmentVariance", typeof(double), typeof(SketchBase), new FrameworkPropertyMetadata(0.2, FrameworkPropertyMetadataOptions.AffectsMeasure | FrameworkPropertyMetadataOptions.AffectsRender));
        public static readonly DependencyProperty SegmentOffsetProperty = DependencyProperty.Register("SegmentOffset", typeof(double), typeof(SketchBase), new FrameworkPropertyMetadata(0.15, FrameworkPropertyMetadataOptions.AffectsMeasure | FrameworkPropertyMetadataOptions.AffectsRender));
        public static readonly DependencyProperty StrokeWidthProperty = DependencyProperty.Register("StrokeWidth", typeof(double), typeof(SketchBase), new FrameworkPropertyMetadata(3.0, FrameworkPropertyMetadataOptions.AffectsRender));
        private Random _rand = new Random(0);
        private Path _drawPath;
        [Browsable(false), Category("Sketch Parameters")]
        public double SegmentLength
        {
            get
            {
                return (double)GetValue(SegmentLengthProperty);
            }
            set
            {
                SetValue(SegmentLengthProperty, value);
            }
        }
        [Browsable(false), Category("Sketch Parameters")]
        public double ExtensionLength
        {
            get
            {
                return (double)GetValue(ExtensionLengthProperty);
            }
            set
            {
                SetValue(ExtensionLengthProperty, value);
            }
        }
        [Browsable(false), Category("Sketch Parameters")]
        public double ExtensionVariance
        {
            get
            {
                return (double)GetValue(ExtensionVarianceProperty);
            }
            set
            {
                SetValue(ExtensionVarianceProperty, value);
            }
        }
        [Browsable(false), Category("Sketch Parameters")]
        public double SegmentVariance
        {
            get
            {
                return (double)GetValue(SegmentVarianceProperty);
            }
            set
            {
                SetValue(SegmentVarianceProperty, value);
            }
        }
        [Browsable(false), Category("Sketch Parameters")]
        public double SegmentOffset
        {
            get
            {
                return (double)GetValue(SegmentOffsetProperty);
            }
            set
            {
                SetValue(SegmentOffsetProperty, value);
            }
        }
        [Category("Appearance")]
        public double StrokeWidth
        {
            get
            {
                return (double)GetValue(StrokeWidthProperty);
            }
            set
            {
                SetValue(StrokeWidthProperty, value);
            }
        }
        protected Size OldSize
        {
            get;
            set;
        }
        protected bool IsDirty
        {
            get;
            set;
        }
        protected Random Rand
        {
            get
            {
                return _rand;
            }
            set
            {
                _rand = value;
            }
        }
        public Path DrawPath
        {
            get
            {
                return _drawPath;
            }
            set
            {
                _drawPath = value;
            }
        }
        protected SketchBase()
        {
            _drawPath = new Path();
            OldSize = default(Size);
            IsDirty = true;
            _drawPath.Data = new PathGeometry();
        }
        protected Point GetWiggle(Point point)
        {
            return new Point(point.X + 1.0 + (2.0 * _rand.NextDouble() - 1.0) * SegmentVariance * 2.0, point.Y + 1.0 + (2.0 * _rand.NextDouble() - 1.0) * SegmentVariance * 2.0);
        }
        protected Point[] GetWiggles(Point point1, Point point2)
        {
            var vector = new Vector(point2.X - point1.X, point2.Y - point1.Y);
            double lengthSquared = vector.LengthSquared;
            int num = (int)(vector.Length / SegmentLength) + 1;
            var vector2 = new Vector(vector.X / num, vector.Y / num);
            double lengthSquared2 = vector2.LengthSquared;
            if (num <= 0)
            {
                return new[]
				{
					point1,
					point2
				};
            }
            var list = new List<Point> {point1};
            var vector3 = new Vector(point1.X, point1.Y);
            double num2 = 0.0;
            for (int i = 1; i < num - 1; i++)
            {
                double num3 = 1.0 + (2.0 * _rand.NextDouble() - 1.0) * SegmentVariance;
                num2 += num3;
                vector3 += vector2 * num3;
                var point3 = new Point(vector3.X, vector3.Y);
                point3 = CreateOrthoVector(vector2, point3);
                if (num2 * lengthSquared2 > lengthSquared)
                {
                    break;
                }
                list.Add(point3);
            }
            list.Add(point2);
            return list.ToArray();
        }
        protected Point[] GetExtensions(Point corner, Point left, Point right)
        {
            Vector vector = corner - left;
            vector.Normalize();
            Vector vector2 = corner - right;
            vector2.Normalize();
            return new[]
			{
				corner + vector * ((_rand.NextDouble() - 0.5) * ExtensionVariance + ExtensionLength),
				corner,
				corner + vector2 * ((_rand.NextDouble() - 0.5) * ExtensionVariance + ExtensionLength)
			};
        }
        protected Point CreateOrthoVector(Vector dir, Point point)
        {
            var vector = new Vector(dir.Y, -dir.X);
            vector *= SegmentOffset * (_rand.NextDouble() - 0.5);
            return point + vector;
        }
        protected void DrawExtensions(Point corner, Point left, Point right, PathGeometry geometry)
        {
            Point[] extensions = GetExtensions(corner, left, right);
            var value = new PolyLineSegment(extensions, true);
            var pathFigure = new PathFigure {StartPoint = extensions[0]};
            pathFigure.Segments.Add(value);
            pathFigure.IsFilled = false;
            geometry.Figures.Add(pathFigure);
        }
        protected void DrawSegment(Point point1, Point point2, PathGeometry geometry)
        {
            var wiggles = GetWiggles(point1, point2);
            var value = new PolyLineSegment(wiggles, true);
            if (geometry.Figures.Count == 0)
            {
                var pathFigure = new PathFigure {StartPoint = point1, IsClosed = true};
                geometry.Figures.Add(pathFigure);
            }
            var pathFigure2 = geometry.Figures[0];
            pathFigure2.Segments.Add(value);
        }
        protected PathGeometry BuildWiggledGeometry(Geometry geometry)
        {
            var pathGeometry = new PathGeometry();
            var flattenedPathGeometry = geometry.GetFlattenedPathGeometry();
            foreach (PathFigure current in flattenedPathGeometry.Figures)
            {
                Point point = GetWiggle(current.StartPoint);
                foreach (PathSegment current2 in current.Segments)
                {
                    var polyLineSegment = current2 as PolyLineSegment;
                    if (polyLineSegment != null)
                    {
                        foreach (Point current3 in polyLineSegment.Points)
                        {
                            Point wiggle = GetWiggle(current3);
                            DrawSegment(point, wiggle, pathGeometry);
                            point = wiggle;
                        }
                    }
                }
            }
            if (pathGeometry.Figures.Count > 0)
            {
                int num = pathGeometry.Figures[0].Segments.Count - 1;
                if (num > 0)
                {
                    pathGeometry.Figures[0].Segments.RemoveAt(num);
                }
            }
            return pathGeometry;
        }

        /// <summary>
        /// Invoked whenever the effective value of any dependency property on this <see cref="T:System.Windows.FrameworkElement"/> has been updated. The specific dependency property that changed is reported in the arguments parameter. Overrides <see cref="M:System.Windows.DependencyObject.OnPropertyChanged(System.Windows.DependencyPropertyChangedEventArgs)"/>.
        /// </summary>
        /// <param name="e">The event data that describes the property that changed, as well as old and new values.</param>
        protected override void OnPropertyChanged(DependencyPropertyChangedEventArgs e)
        {
            if (e.Property == BackgroundProperty || e.Property == BorderBrushProperty)
            {
                InvalidateVisual();
            }
            base.OnPropertyChanged(e);
        }

        /// <summary>
        /// When overridden in a derived class, participates in rendering operations that are directed by the layout system. The rendering instructions for this element are not used directly when this method is invoked, and are instead preserved for later asynchronous use by layout and drawing. 
        /// </summary>
        /// <param name="drawingContext">The drawing instructions for a specific element. This context is provided to the layout system.</param>
        protected override void OnRender(DrawingContext drawingContext)
        {
            drawingContext.DrawGeometry(Background, new Pen(BorderBrush, StrokeWidth), _drawPath.Data);
            base.OnRender(drawingContext);
        }

        /// <summary>
        /// Called to arrange and size the content of a <see cref="T:System.Windows.Controls.Control"/> object. 
        /// </summary>
        /// <returns>
        /// The size of the control.
        /// </returns>
        /// <param name="arrangeBounds">The computed size that is used to arrange the content.</param>
        protected override Size ArrangeOverride(Size arrangeBounds)
        {
            DrawPath.Arrange(new Rect(0.0, 0.0, arrangeBounds.Width, arrangeBounds.Height));
            return base.ArrangeOverride(arrangeBounds);
        }
    }
}

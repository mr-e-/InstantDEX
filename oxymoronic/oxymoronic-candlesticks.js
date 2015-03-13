/**
 * Using this plugin will enable "Oxymoronic" candlesticks.
 *
 * Author: Roland Banguiran
 * Email: banguiran@gmail.com
 *
 * Usage: Set oxymoronic:false in the candlestick plotOptions to disable.
 * Default: true
 */
 
// JSLint options:
/*global Highcharts*/

(function (H) {
    'use strict';
    var each = H.each,
        merge = H.merge;

    H.wrap(H.Series.prototype, 'render', function (proceed) {

        // Run the original proceed method
        proceed.apply(this, Array.prototype.slice.call(arguments, 1));

        var series = this,
            chart = series.chart,
            backgroundColor = chart.options.chart.backgroundColor || '#ffffff',
            points = series.points,
            options = series.options,
            isOxy = options.oxymoronic !== undefined ? options.oxymoronic : true,
            type = options.type;

        if (isOxy && (type === 'candlestick' || type === 'ohlc' || type === 'column')) {
            each(points, function (point, i) {
                var open = point.open,
                    close = point.close,
                    isFirstPoint = (i === 0) ? true : false,
                    prevClose = !isFirstPoint ? points[i - 1].close : null,
                    graphic = point.graphic,
                    attribute = point.pointAttr,
                    color = options.color,
                    lineColor = options.lineColor,
                    upColor = options.upColor,
                    upLineColor = options.upLineColor,
                    isDayUp,
                    isEqual,
                    isCloseUp,
                    strokeColor,
                    fillColor,
                    prevStrokeColor = !isFirstPoint ? points[i - 1].graphic.stroke : null;

                isCloseUp = close > open;
                isEqual = close === prevClose;
                isDayUp = isFirstPoint ? isCloseUp : close > prevClose;

                strokeColor = !isEqual ? (isDayUp ? upLineColor : lineColor) : prevStrokeColor;
                fillColor = strokeColor === upLineColor ? (isCloseUp ? backgroundColor : backgroundColor) : (isCloseUp ? color : color);
				
				if (type === 'column'){
					var otherPoint = chart.series[0].points[i]
					//console.log(i)
					strokeColor = otherPoint.open > otherPoint.close ? "#d00" : "#0c0";
					fillColor = otherPoint.open > otherPoint.close ? '#a80808' : backgroundColor;

		            point.pointAttr = merge(attribute, {
		                '': {
                        stroke: strokeColor,
		                    //borderColor: strokeColor,
		                    fill: fillColor
		                },
		                hover: {
                        stroke: strokeColor,
		                    borderColor: strokeColor,
		                    fill: fillColor
		                },
		                select: {
                        stroke: strokeColor,
		                    borderColor: strokeColor,
		                    fill: fillColor
		                }
		            });
                graphic.attr('stroke', strokeColor);
                graphic.attr('fill', fillColor);

				}
				else {
					strokeColor = point.open > point.close ? "#d00" : "#0c0";
					fillColor = point.open > point.close ? '#a80808' : backgroundColor;
                // replace default attributes
                point.pointAttr = merge(attribute, {
                    '': {
                        stroke: strokeColor,
                        fill: fillColor
                    },
                    hover: {
                        stroke: strokeColor,
                        fill: fillColor
                    },
                    select: {
                        stroke: strokeColor,
                        fill: fillColor
                    }
                });

                graphic.attr('stroke', strokeColor);
                graphic.attr('fill', fillColor);
				}

                // update SVG elements color attribute
            });
        }

    });
}(Highcharts));





var IDEX = (function(IDEX, $, undefined) 
{


	var textAttr = {
		"fill":"#D3D3D3",
		"font-family":"Roboto",
		"font-size":"13px"
	}
	
	var boxAttr = {
		"fill":"#black",
		"stroke":"#a5a5a5",
		"stroke-width":1
	}
	
	
	
	
	

	Sleuthcharts = (function(Sleuthcharts) 
	{
		
		
		var Renderer = Sleuthcharts.Renderer = function()
		{
			this.init.apply(this, arguments)
		}
		
		Renderer.prototype = 
		{
			
		}
		
		
		
		
		
		return Sleuthcharts;
		
		
	}(Sleuthcharts || {}));
	

	
	
	function drawMarketInfo(chart, closestPoint)
	{
		//var insideTimeX = insideX - xAxis.padding.left;
		//var time = xAxis.getXVal(insideTimeX);
		//time = Math.floor(time);
		var $marketNameEl = $(chart.node).find(".cur-market")
		var marketNameBbox = d3.select($marketNameEl.get()[0]).node().getBBox();
		var leftPos = marketNameBbox.x + marketNameBbox.width + 10;
		var topPos = marketNameBbox.y + marketNameBbox.height - 3;

		//console.log(marketNameBbox)
		
		var fontSize = chart.marketInfoFontSize
		var textAttr = {
			"fill":"#bbbbbb",
			"font-family":"Roboto",
			"font-size":fontSize
		}
		
		var priceAxis = chart.yAxis[0];
		var $candleInfoEl = $(chart.node).find(".candleInfo");
		
		var pad = 7
		//"Date: " + String("a") + 
		var openStr = "O: " + IDEX.formatNumWidth(Number(closestPoint.phase.open))
		var highStr = "H: " + IDEX.formatNumWidth(Number(closestPoint.phase.high))
		var lowStr = "L: " + IDEX.formatNumWidth(Number(closestPoint.phase.low))
		var closeStr = "C: " + IDEX.formatNumWidth(Number(closestPoint.phase.close))
		var volStr = "V: " + IDEX.formatNumWidth(Number(closestPoint.phase.vol))
		
		var str = ""
		str += padString(openStr)
		str += padString(highStr)
		str += padString(lowStr)
		str += padString(closeStr)
		str += padString(volStr)

		//var a = formatNumWidth(Number(closestPoint.phase.vol))
		//console.log(a)
		//var textWidth = priceAxis.ctx.measureText(openStr).width;
		//var move = (width - textWidth) / 2
		
		d3.select($candleInfoEl.get()[0])
		.text(str)
		.attr("y", topPos)
		.attr("x", leftPos)
		.attr(textAttr)
	}


	
	function highLowPrice(chart)
	{
		if (!chart.xAxis.length)
			return
		
		
		var points = chart.pointData
		var highestPrice = null;
		var lowestPrice = null;

		for (var i = 0; i < points.length; ++i)
		{
			if (chart.chartType == "candlestick" || chart.chartType == "ohlc")
			{
				if (highestPrice === null || points[i].phase.high >= highestPrice.phase.high)
				{
					highestPrice = points[i]
				}
				if (lowestPrice === null || points[i].phase.low <= lowestPrice.phase.low)
				{
					lowestPrice = points[i]
				}
			}
			else if (chart.chartType == "line" || chart.chartType == "area")
			{
				if (highestPrice === null || points[i].phase.close >= highestPrice.phase.close)
				{
					highestPrice = points[i]
				}
				if (lowestPrice === null || points[i].phase.close <= lowestPrice.phase.close)
				{
					lowestPrice = points[i]
				}
			}
		}
				
		var fontAttr = {
			"fill": "#B0B0B0",
			"font-family": "Roboto",
			"font-size": "13px"
		}
		
		if (chart.chartType == "line" || chart.chartType == "area")
		{
			var topPos = highestPrice.phase.close > highestPrice.phase.open ? highestPrice.pos.topBody : highestPrice.pos.bottomBody 
			var bottomPos = lowestPrice.phase.close > lowestPrice.phase.open ? lowestPrice.pos.topBody : lowestPrice.pos.bottomBody 
		}
		else if (chart.chartType == "candlestick" || chart.chartType == "ohlc")
		{
			var topPos = highestPrice.pos.topLeg - 2
			var bottomPos = lowestPrice.pos.bottomLeg + 2
		}
		
		var $highestPriceEl = $(chart.node).find(".highestPrice");
		var $lowestPriceEl = $(chart.node).find(".lowestPrice");

		$highestPriceEl
		.text("- " + String(highestPrice.phase.high))
		.attr('x', highestPrice.pos.middle)
		.attr('y', topPos)
		.attr(fontAttr)
		
		$lowestPriceEl
		.text("- " + String(lowestPrice.phase.low))
		.attr('x', lowestPrice.pos.middle)
		.attr('y', bottomPos)
		.attr(fontAttr)
	}
	
	

	
	
	
	
	
	function drawMarketName(chart, settings)
	{
		var both = settings.pair.split("_")
		var b = both[0]
		var r = both[1]
		var a = getNames(b, r)
		var pair = a[0] + "_" + a[1]
		
		var $el = $(chart.node).find(".cur-market")
		d3.select($el.get()[0])
		.text(pair.toUpperCase() + " - " + settings.exchange.toUpperCase())
		.attr("y", 20)
		.attr("x", 20)
		.attr(textAttr)
		.attr("fill", "#bbbbbb")
		.attr("font-size", "11px")
	}
	
	
	
	function drawXLine(chart, yPos)
	{
		if (!chart.isCrosshair)
			return
		
		var priceAxis = chart.yAxis[0];
		var width = priceAxis.pos['left']; //+ priceAxis.width
		var $cursor_follow_x = $(chart.node).find(".cursor_follow_x");

		$cursor_follow_x
		.attr("x1", 0)
		.attr("x2", width)
		.attr("y1", yPos + 0.5)
		.attr("y2", yPos + 0.5)
		.attr("stroke-width", 1)
		.attr("stroke", "#a5a5a5")
		.attr("pointer-events", "none");
	}
	
	function drawYLine(chart, closestPoint)
	{
		if (!chart.isCrosshair)
			return
		
		var xAxis = chart.xAxis[0];
		var height = xAxis.pos['bottom'];
		var $cursor_follow_y = $(chart.node).find(".cursor_follow_y");
	
		$cursor_follow_y
		.attr("x1", closestPoint.pos.middle)
		.attr("x2", closestPoint.pos.middle)
		.attr("y1", 0)
		.attr("y2", height)
		.attr("stroke-width", 1)
		.attr("stroke", "#a5a5a5")
		.attr("pointer-events", "none");
	}
	
	
	function drawYAxisFollow(mousePosY, chart, axis)
	{
	
		var axisNum = String(chart.yAxis.indexOf(axis) + 1)

		var $followWrap = $(chart.node).find(".yAxis-follow[data-axisnum='"+axisNum+"']");
		var $followBackbox = $followWrap.find(".yAxis-follow-backbox");
		var $followText = $followWrap.find(".yAxis-follow-text");
		
		var fontSize = chart.marketInfoFontSize
		var textAttr = {
			"fill":"#D3D3D3",
			"font-family":"Roboto",
			"font-size":fontSize
		}
		
		var topPos = axis.pos.top;
		var leftPos = axis.pos.left;
		var width = axis.width;
		
		var insidePriceY = mousePosY - topPos
		var price = axis.getPriceFromY(insidePriceY)
		price = IDEX.formatNumWidth(Number(price))
		
		var textWidth = axis.ctx.measureText(price).width;
		var move = (width - textWidth) / 2
	
		$followText
		.text(price)
		.attr("y", mousePosY + 5)
		.attr("x", leftPos + move)
		.attr(textAttr)

		
		var backboxRect = d3.select($followText.get()[0]).node().getBBox();
		var rightPos = axis.pos.right - 1;
		var leftPos = axis.pos.left;
		var topPos = backboxRect.y - 3;
		var bottomPos = topPos + backboxRect.height + 6;
		var yMiddlePos = topPos + ((bottomPos - topPos) / 2) + 0.5
		var leftPosPad = leftPos + 7
		
		var d = 
		[
			"M", rightPos, topPos, 
			"L", leftPosPad, topPos, 
			"L", leftPos, yMiddlePos, 
			"L", leftPosPad, bottomPos, 
			"L", rightPos, bottomPos, 
			"L", rightPos, topPos, 
		]


		d3.select($followBackbox.get()[0])
		.attr("d", d.join(" "))
		.attr("stroke", "#D3D3D3")
		.attr("stroke-width", 0.5)
	
		$followWrap.show()
	}
	
	
	function drawTimeBox(mousePosX, time, chart)
	{
		var $followWrap = $(chart.node).find(".xAxis-follow");
		var $followBackbox = $followWrap.find(".xAxis-follow-backbox");
		var $followText = $followWrap.find(".xAxis-follow-text");
		
		var xAxis = chart.xAxis[0];
		
		var topPos = xAxis.pos.top;
		var height = xAxis.height;
		
		time = IDEX.formatTimeDate(new Date(time))
							
		$followText
		.text(time)
		.attr("y", topPos + 15)
		.attr("x", mousePosX - 37)
		.attr(textAttr)

		//var timerect = d3.select($cursor_follow_time.get()[0]).node().getBBox();
		d3.select($followBackbox.get()[0])
		.attr("x", mousePosX - 55)
		.attr("y", topPos)
		.attr("width", 110)
		.attr("height", height)
		.attr(boxAttr)
		
		$followWrap.show()
	}
	
	
	
	
	function hideRenders(chart)
	{
		var $candleInfoEl = $(chart.node).find(".candleInfo");
		var $cursor_follow_x = $(chart.node).find(".cursor_follow_x");
		var $cursor_follow_y = $(chart.node).find(".cursor_follow_y");
		var $priceFollowWrap = $(chart.node).find(".yAxis-follow[data-axisNum='1']");
		var $volFollowWrap = $(chart.node).find(".yAxis-follow[data-axisNum='2']");
		var $timeFollowWrap = $(chart.node).find(".xAxis-follow");

		
		$cursor_follow_x.attr("stroke-width", 0);
		$cursor_follow_y.attr("stroke-width", 0);

		$priceFollowWrap.hide()
		$volFollowWrap.hide()
		$timeFollowWrap.hide()
		
		$candleInfoEl.text(""); 
	}
	
	
	
	
	
	function getNames(baseID, relID)
	{
		
		var nxtass = "5527630"
		
		var base = IDEX.user.getAssetInfo("assetID", baseID)
		var rel = IDEX.user.getAssetInfo("assetID", relID)
		
		if (!($.isEmptyObject(base)))
		{
			var basename = base.name
		}
		else
		{
			var basename = baseID
		}

		if (!($.isEmptyObject(rel)))
		{
			var relname = rel.name
		}
		else
		{
			var relname = relID
		}
		
		return [basename, relname]
	}
	
	
	
	function padString(string)
	{
		var numSpaces = 20;
		
		var needed = 20 - string.length
		if (needed < 0)
			needed = 0;
		
		for (i = 0; i < needed; i++)
			string += " "
		
		return string;
	}
	
	
	
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));

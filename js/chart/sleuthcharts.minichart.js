
var IDEX = (function(IDEX, $, undefined) 
{
	
	var allMiniCharts = {
		"mini_svg_1":null,
		"mini_svg_2":null,
		"mini_svg_3":null,
		"mini_svg_4":null
	};


    var isDragging = false;
	var draggingPos = 0;
	
	var skynetKeysTick = [2,3,4,5,6]
	var skynetKeys = [3,4,5,6,7]
	
	
	
	function getData(options)
	{
		var dfd = new $.Deferred();
		var id = options['id']
		var len = options['len']
		
        var obj = {}
        obj['run'] = "quotes";
        obj['section'] = "crypto";
        obj['mode'] = "bars";
        obj['exchg'] = "nxtae";
        obj['pair'] = id+"_NXT";
        obj['num'] = "600"
        obj['bars'] = "tick"
        obj['len'] = len
	

        var params = new IDEX.SkyNETParams(obj)
        var url = params.makeURL()

		$.getJSON(url, function(data)
		{
			dfd.resolve(data)	
		})
		
		return dfd.promise()
	}

	
	IDEX.makeMiniChart = function(baseID, relID, divid)
	{
		//var baseNXT = baseID == IDEX.snAssets.nxt.assetID
		//if (baseNXT)
		//	baseID = relID

		var baseNXT = false
		var node =  "#" + $("#" + divid).find("svg").attr("id")
		$(node).unbind()
		var curChart = new IDEX.Chart();
		allMiniCharts[divid] = curChart;
		
		getData({"id":baseID,"len":"10"}).done(function(data)
		{
			console.log(data)
			
			data = data.results
			var both = IDEX.getStepOHLC(data);
			var ohlc = both[0]
			var vol = both[1]
			

			curChart.node = node;
			curChart.barWidth = "600"
			curChart.phases = ohlc
			
			IDEX.makeMini(curChart)
			resizeAxis(curChart);
			updateAxisPos(curChart)
			curChart.redraw = redraw
			curChart.resizeAxis = resizeAxis
			curChart.updateAxisPos = updateAxisPos
			IDEX.initXAxis(curChart);
			redraw(curChart)
			
			resizeAxis(curChart);
			updateAxisPos(curChart)
			redraw(curChart)
			IDEX.addWheel(curChart)
			IDEX.addMove(curChart)
			IDEX.addMousedown(curChart)
			IDEX.addMouseup(curChart)
			
		})
	}
	
	
	function drawInd(curChart)
	{
		var $selector = $(curChart.node).find(".mainline")
		var rawSelector = $selector.get()[0]
		var indic = curChart.phases
		var priceAxis = curChart.yAxis[0]
		var xAxis = curChart.xAxis[0]
		
		$selector.empty()

		var color = "#FFB669"
		var colortwo = color // orange

		var colorone = "#425A70" // blue
		var colortwo = "#6797c5"
		
		var colorone = "#2B8714" // green
		var colortwo = "#54BF39"
		
		var colorone = "#8B2696" // pink
		var colortwo = "#C927DB"

		var visInd = indic.slice(xAxis.minIndex, xAxis.maxIndex+1)
		var flow = []
		var positions = []

		for (var i = 0; i < visInd.length; i++)
		{
			var candle = curChart.pointData[i];
			var price = visInd[i].close;
			var pos = Math.floor(priceAxis.getPos(price));
			positions.push({"x":candle.pos.middle, "y":pos})
		}
		
		var lineFunc = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate("basis")

		var area = d3.svg.area()
			.x(function(d) { return d.x; })
			.y0(priceAxis.pos.bottom)
			.y1(function(d) { return d.y; })
			.interpolate("basis");
				

		if (curChart.node == "#mini_svg_3")
		{
			var colortwo = "#9D24C9"
		}
		
				
		if (true)
		{
			d3.select(rawSelector)
			.append("path")
			.attr("d", area(positions))
			.attr("stroke-width", 0)
			.attr("fill", colorone)
			.attr("fill-opacity", 0.7)
		}
		
		d3.select(rawSelector)
		.append("path")
		.attr("d", lineFunc(positions))
		.attr("stroke", colortwo)
		.attr("stroke-width", "1.5px")
		.attr("fill", "none")
		
		//.attr("shape-rendering", "crispEdges");
	}

	
	function resizeAxis(chart)
	{
		chart.yAxis[0].resizeYAxis()
		chart.xAxis[0].resizeXAxis()
	}
	
	
	
	function updateAxisPos(chart)
	{
		var priceAxis = chart.yAxis[0];
		var xAxis = chart.xAxis[0]
		
		priceAxis.pos['top'] = priceAxis.padding['top'];
		priceAxis.pos['bottom'] = priceAxis.pos['top'] + priceAxis.height;
		priceAxis.pos['left'] = xAxis.pos['left'] + xAxis.width + priceAxis.padding['left'];
		priceAxis.pos['right'] = priceAxis.pos['left'] + priceAxis.width;
		
		xAxis.pos['top'] = priceAxis.pos['bottom'] + xAxis.padding['top'];
		xAxis.pos['bottom'] = xAxis.pos['top'] + xAxis.height;
		xAxis.pos['left'] = xAxis.padding['left'];
		xAxis.pos['right'] = xAxis.pos['left'] + xAxis.width;	
		
	}
	
	
	function redraw(curChart)
	{
		if (!curChart.xAxis.length)
			return
		
		IDEX.getPointPositions(curChart);
		
		curChart.yAxis[0].makeYAxis();
		curChart.xAxis[0].makeXAxis();
		
		curChart.yAxis[0].drawYAxisLines();
		curChart.xAxis[0].drawXAxisLines();
		
		
		drawInd(curChart);
	}
	

	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

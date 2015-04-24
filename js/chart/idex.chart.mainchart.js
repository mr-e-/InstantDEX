
var IDEX = (function(IDEX, $, undefined) 
{	
	IDEX.ohlcTimeout;
	var datau = []
	var datab = []
	var latestTrade;
	var prevIndex;
	var btcwKeys = [3,5,6,4,7]
	var skynetKeys = [3,4,5,6,8]

	IDEX.OHLC = function(obj) 
	{
		var __construct = function(that) 
		{
			that.x = obj[0]
			that.open = obj[1]
			that.high = obj[2]
			that.low = obj[3]
			that.close = obj[4]
		}(this)
	}
	
	IDEX.Chart = function(obj) 
	{
		this.baseid = "6854596569382794790"
		this.relid = "6932037131189568014"
		this.basename = "SkyNET"
		this.relname = "jl777hodl"
		this.numticks = "5"
		this.numbars = "100"
		this.isvirtual = false
		this.flip = false
		this.isNew = false
		
		var __construct = function(that) 
		{
			if (obj)
			{
				for (var key in obj)
				{
					that[key] = obj[key]
				}
			}
		}(this)
	}
	
	var currentChart = new IDEX.Chart()

	var statAttr=
	{
		'stroke-width': 1,
		stroke: '#999',
		zIndex: 7
	}

	var highLowAttr=
	{
		'stroke-width': 0,
		'font-family':'Consolas, Monospace',
		'font-size':'10px',
		fill: '#CCC',
		zIndex: 10,
		useHTML:true,
	}

	Highcharts.setOptions(Highcharts.theme);

	function getStepOHLC(data, baseNXT)
	{
		var ohlc = []
		var volume = []
		var dataLength = data.length
		var keys = skynetKeys
		
		for (var i = 0; i < dataLength; i++) 
		{
			var pointDate = data[i][0]*1000;
			if (baseNXT)
			{

				var open = data[i][keys[0]]
				var high = data[i][keys[1]]
				var low = data[i][keys[2]]
				var close = data[i][keys[3]]
				var volu = data[i][keys[4]]

				data[i][keys[0]] =  Number((1 / close).toFixed(6))
				data[i][keys[1]] =  Number((1 / low).toFixed(6))
				data[i][keys[2]] =  Number((1 / high).toFixed(6))
				data[i][keys[3]] =  Number((1 / open).toFixed(6))
				data[i][keys[4]] =  Number((close * volu).toFixed(6))

				data[i] = ((i!= 0) && (data[i][keys[2]] < data[i-1][keys[2]]/5)) ? data[i-1] : data[i] // spike
			}
			else
			{
				data[i] = ((i!= 0) && (data[i][keys[1]] > data[i-1][keys[1]]*5)) ? data[i-1] : data[i] // spike
			}
			ohlc.push(new IDEX.OHLC([pointDate,data[i][keys[0]],data[i][keys[1]],data[i][keys[2]],data[i][keys[3]]]))
			volume.push({x:pointDate, y:data[i][keys[4]]});
		}

		return [ohlc, volume]
	}
	

	function getData(options)
	{
		var dfd = new $.Deferred();
		var id = flipCheck("base", "id")
		var id = id == "5527630" ? flipCheck("rel", "id") : flipCheck("base", "id")

		var url = "http://idex.finhive.com/v1.0/run.cgi?run=qts&mode="+"bars"+"&exchange=ex_nxtae&pair="+id+"_"+"NXT"+"&type=tick&len="+options.numticks+"&num="+options.numbars
			
		$.getJSON(url, function(data)
		{
			dfd.resolve(data)	
		})
		
		return dfd.promise()
	}
	
	function flipCheck(baseRel, nameID)
	{
		if (currentChart.flip)
			baseRel = baseRel == "base" ? "rel" : "base"
		
		return currentChart[baseRel+nameID]
	}

	IDEX.makeChart =  (function make(siteOptions) 
	{
		siteOptions = (typeof siteOptions === "undefined") ? {} : siteOptions;
		currentChart = new IDEX.Chart(siteOptions)
	
		if (currentChart.isNew)
		{
			resetDropdown();
			currentChart.isNew = false;
		}
		var baseNXT = flipCheck("base", "name") == "NXT";
		var titleName = flipCheck("base", "name") + "/NXT";
		if (baseNXT)
			titleName = flipCheck("base", "name") + "/" + flipCheck("rel", "name")

		getData(currentChart).done(function(data)
		{
			data = data.results.bars
			if (!data.length)
			{
				$("#chartLoading span").text("Not enough data");
				return
			}
			var both = getStepOHLC(data, baseNXT)
			var ohlc = both[0]
			var volume = both[1]

			latestTrade = String(data[data.length-1][2])
			datau = ohlc
			datab = volume

			var chart1 = new Highcharts.StockChart(
			{
				chart:
				{
					renderTo:"chartArea",
					events:
					{
						load:chartLoadHander,
						redraw:drawDivideLine
					},
				},
				
				navigator:
				{
					enabled:false,
					adaptToUpdatedData:true,
					baseSeries:1,
					series:
					{
						type: 'areaspline',
						borderWidth:0,
					},
					xAxis: 
					{
						/*labels: 
						{
							align: 'center',
							y:0,
							x:0
						},*/
						//top:"50%",
						left:6
					},
				},
				
				plotOptions: 
				{
					areaspline:
					{
						color: '#a80808',
						//fillColor:"black",
					}
				},
				
				title: 
				{
					useHTML:true,
					style:
					{
						color: '#CCC',
					},
					text:titleName,
					x:40,
				},
				
				rangeSelector: 
				{
					enabled:false,
					inputEnabled:false,
				},
				
				scrollbar:
				{
					enabled:false,
					height:5,
				},

				tooltip:
				{
					enabled:false,
					followPointer:false,	
					shared:true,
					crosshairs:[false,false],
				},

				yAxis: [
				{
					labels: 
					{
						align: 'left',
						y:3.3,
					},
					top:"5%",
					height: '60%',
					offset:10,
					startOnTick:true,
					//endOnTick:true,
					showFirstLabel:true,
					showLastLabel:true,
					minPadding:0.00,
					maxPadding:0.00,
				}, 
				{
					labels: 
					{
						align: 'left',
						y:3.3,
					},
					top: '75%',
					height: '20%',
					offset: 10,
					startOnTick:true,
					//endOnTick:true,
					showLastLabel:true,
				}],
				
				xAxis: [
				{
					labels: 
					{
						align: 'center',
						y:0
					},
					events:{afterSetExtremes: highLowPrice},
					startOnTick:false,
					endOnTick:false,
					showLastLabel:true,
				}],
				
				series: [
				{
					type: 'candlestick',
					borderWidth:0,
					turboThreshold:10000,
					data: ohlc,
					dataGrouping: 
					{
						enabled:false,
					}
				}, 
				{
					type: 'column',
					borderWidth:0,
					turboThreshold:10000,
					data: volume,
					yAxis: 1,
					dataGrouping: 
					{
						enabled:false,
					}
				}]

			}, function(chart)
			   {
					chart.crossLinesX = chart.renderer.path().attr(statAttr).add();
					chart.crossLinesY = chart.renderer.path().attr(statAttr).add();
					chart.crossLabelX = chart.renderer.text().attr(statAttr).add();
					chart.crossLabelY = chart.renderer.text().attr(statAttr).add();
					chart.highestPrice = chart.renderer.text().attr(highLowAttr).add();
					chart.lowestPrice = chart.renderer.text().attr(highLowAttr).add();
					chart.marketInfo = chart.renderer.text().attr(statAttr).add();
					chart.splitLine = chart.renderer.path().attr({'stroke-width': 0.5,stroke: '#999',}).add();
					$("#chartLoading").hide();
					$(chart.container).on("mousemove",buildChartRenders)
			   }
			);
		});
		
		return make
	})();


	
	
	function buildChartRenders(event)
	{
		var chart = $('#chartArea').highcharts()
		var offset = $('#chartArea').offset();
		var x = event.pageX - offset.left;
		var y = event.pageY - offset.top	
		if (IDEX.isInsidePlot(event))
		{
			var pointRange = chart.series[0].pointRange
			var closestTime = Number(chart.xAxis[0].toValue(x).toFixed())
			var closestPoint = getPoint(0, closestTime)
			var index = chart.series[0].data.indexOf(closestPoint)
			
			if ((index != prevIndex && index > 0) && (closestTime % pointRange <= pointRange/2))
			{
				var d = new Date(closestPoint.x)
				var xPos = closestPoint.clientX
				var crossPathX = [
				'M', xPos, 0,
				'L', xPos, chart.plotTop + chart.plotHeight];
			 
				chart.crossLinesX.attr({d: crossPathX}).show()
				
				chart.crossLabelX.attr(
				{
					x: xPos-15,
					y: chart.plotTop+chart.plotHeight,
					text: formatTime(d)
				}).show()
				
				var vol = chart.series[1].data[index].y
				var marketInfoText = "Open: "+closestPoint.open+"  High: "+closestPoint.high+"	Low: "+closestPoint.low+"  Close: "+closestPoint.close+"  Volume: "+vol+"<br>Date: "+String(d)

				chart.marketInfo.attr(
				{
					y: chart.plotBox.y-27,
					x: chart.plotBox.x+5,
					text: marketInfoText
				}).show()
			
				prevIndex = index
			}
			
			var crossPathY = [
			'M', chart.plotLeft, y,
			'L', chart.plotLeft + chart.chartWidth, y]

			chart.crossLinesY.attr({d: crossPathY}).show()

			var yText = ""
			if (y >= chart.yAxis[1].top && y <= chart.yAxis[1].top + chart.yAxis[1].height)
			{
				var val = properDecimals(chart.yAxis[1], y)
				yText = val
			}
			else if (y >= chart.plotBox.y && y <= chart.yAxis[0].top + chart.yAxis[0].height)
			{
				var val = properDecimals(chart.yAxis[0], y)
				yText = val
			}

			chart.crossLabelY.attr({
				y: y+6,
				x:chart.plotLeft+chart.plotWidth,
				text: yText
			}).show()
		}
		else
		{
			if (prevIndex != -2)
				destroyChartRenders(0)
			var crossPathX = [
			'M', x, 0,
			'L', x, chart.plotTop + chart.chartHeight];
			 
			chart.crossLinesX.attr({d: crossPathX}).show()
				
			var crossPathY = [
			'M', chart.plotLeft, y,
			'L', chart.plotLeft + chart.chartWidth, y]

			chart.crossLinesY.attr({d: crossPathY}).show()
		}
	}
	
	function properDecimals(axis, pos)
	{
		var price = String(axis.max).split(".")
		var len = 0;
		if (price.length == 1)
			len = 1
		else
			len = price[1].length
		var testcount = 0
		var val = 0.0
		while (val <= 0 || testcount < len+2)
		{
			val = axis.toValue(pos).toFixed(testcount)
			testcount++;
		}
		
		return val
	}


	function highLowPrice()
	{
		var chart = $('#chartArea').highcharts()
		if (chart)
		{
			var points = chart.series[0].points
			var highestPrice = null;
			var lowestPrice = null;

			for (var i = 0; i < points.length; ++i)
			{
				if (highestPrice === null || points[i].high >= highestPrice.high)
				{
					highestPrice = points[i]
				}
				if (lowestPrice === null || points[i].low <= lowestPrice.low)
				{
					lowestPrice = points[i]
				}
			}
			
			chart.highestPrice.attr({'text':"←"+" "+String(highestPrice.high),'x':chart.xAxis[0].toPixels(highestPrice.x),'y':chart.yAxis[0].toPixels(highestPrice.high)})
			chart.lowestPrice.attr({'text':"←"+" "+String(lowestPrice.low),'x':chart.xAxis[0].toPixels(lowestPrice.x),'y':chart.yAxis[0].toPixels(lowestPrice.low)+2})
		}
	}


	function getPoint(seriesIndex, value) 
	{
		var val = null;
		var chart = $('#chartArea').highcharts()
		var points = chart.series[seriesIndex].points;

		if (value >= points[points.length-1].x)
		{
			val = points[points.length-1]
		}
		else if (value <= points[0].x)
		{
			val = points[0]
		}
		else
		{
			for (var i = 0; i < points.length; i++) 
			{
				if (points[i].x >= value) 
				{
					val = points[i-1]
					break;
				}
			}
		}

		return val;
	}

	function formatTime(d)
	{
		var hours = String(d.getHours())
		var minutes = d.getMinutes()
		
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
		
		return hours+":"+minutes
	}


	$("#chartArea").on("mouseleave", destroyChartRenders)

	function destroyChartRenders(event)
	{
		var chart = $('#chartArea').highcharts()
		
		if (!chart)
			return

		chart.crossLinesX.hide()
		chart.crossLinesY.hide()
		chart.crossLabelX.hide()
		chart.crossLabelY.hide()
		chart.marketInfo.hide()
		prevIndex = -2
	}

	function updateOHLC(OHLC, price)
	{
		OHLC.close = price

		if (price > OHLC.high)
			OHLC.high = price
		else if (price < OHLC.low)
			OHLC.low = price

		return OHLC
	}

	function updateData()
	{
		return
		
		var chart = $('#chartArea').highcharts()
		var volSeries = chart.series[1];
		var ohlcSeries = chart.series[0];
		var mStep = ohlcSeries.pointRange
		
		//var url = "http://idex.finhive.com/v1.0/run.cgi?run=qts&mode="+"bars"+"&exchange=ex_nxtae&pair="+siteOptions.baseid+"_"+"NXT"+"&type=tick&len="+"5"+"&num="+"100"

		IDEX.ohlcTimeout = setTimeout(function () 
		{
			var curPointOHLC = datau[datau.length - 1]
			var curPointVol = datab[datab.length - 1]
			var curOHLC = new testOHLC([curPointOHLC.x, curPointOHLC.open, curPointOHLC.high, curPointOHLC.low, curPointOHLC.close])
			var curVol = {y:curPointVol.y, x:curPointOHLC.x}
			
			$.getJSON('https://s5.bitcoinwisdom.com/trades?since='+latestTrade+'&symbol=bitfinexbtcusd&nonce=', function (data) 
			{
				var tempFind = 0;
				
				if (Date.now()-curPointOHLC.x >= mStep)
				{
					var nextDate = curPointOHLC.x+mStep
					curOHLC = new testOHLC([nextDate, curOHLC.close, curOHLC.close, curOHLC.close, curOHLC.close])
					curVol = {y:0, x:nextDate}
					ohlcSeries.addPoint(curOHLC, false, false);						
					volSeries.addPoint(curVol, false, false);
				}
				
				for (var i = data.length-1; i > -1; --i)
				{
					var price = data[i]['price']
					var amount = data[i]['amount']
					var tid = data[i]['tid']
					var index = datau.length -1
					
					if (tid < curOHLC.x)
						index--
						
					datau[index] = updateOHLC(datau[index], price)
					datab[index].y += amount 
					tempFind = tempFind > tid ? tempFind : tid
				}
			
				latestTrade =  tempFind > 0 ? String(tempFind) : latestTrade
				ohlcSeries.setData(datau, false, true, true)
				volSeries.setData(datab, false, true, true)
				chart.xAxis[0].setExtremes(chart.xAxis[0].min, chart.xAxis[0].max, true);
				//if (!$.isEmptyObject(candle) && !$.isEmptyObject(vol))
				updateData();
			})

		}, 3000);
	}

	

	$(".dropdown-option").on("click", function(e)
	{
		$(this).closest("ul").find(".dropdown-option").removeClass("active")
		$(this).addClass("active")		
	})
	
	function resetDropdown()
	{
		$(".dropdown-option").removeClass("active")
		$("#numbars .dropdown-option").first().addClass("active")	
		$("#numticks .dropdown-option").first().addClass("active")			
		$("#flip .dropdown-option").first().addClass("active")			
	}
	
	$("#numbars .dropdown-option").on("click", function(e)
	{
		var chart = $('#chartArea').highcharts()
		
		if (chart)
		{
			currentChart.numbars = $(this).text()
			IDEX.killChart()
			IDEX.makeChart(currentChart)
		}
	})
	
	$("#numticks .dropdown-option").on("click", function(e)
	{
		var chart = $('#chartArea').highcharts()
		
		if (chart)
		{
			currentChart.numticks = $(this).text()
			IDEX.killChart()
			IDEX.makeChart(currentChart)
		}
	})

	$("#flip .dropdown-option").on("click", function(e)
	{
		var chart = $('#chartArea').highcharts()

		if (chart)
		{
			var text = $(this).text();
			if (text == "Base")
			{
				currentChart.flip = false
			}
			else if (text == "Rel")
			{
				currentChart.flip = true
			}
			else if (text == "Virtual")
			{
				return
			}
			
			IDEX.killChart()
			IDEX.makeChart(currentChart)
		}
	})


	function drawDivideLine()
	{
		var chart = $('#chartArea').highcharts()
		var offset = $('#chartArea').offset();
		if (chart)
		{
			var path = ['M', 0, chart.plotTop+chart.series[0].yAxis.height+offset.top/2+20,
			'L', 0 + $("#chartArea")[0].clientWidth, chart.plotTop+chart.series[0].yAxis.height+(offset.top/2)+20]
			chart.splitLine.attr({d:path})
		}
	}
	
	IDEX.killChart = function()
	{
		var chart = $('#chartArea').highcharts()

		if (chart)
		{
			chart.destroy()
			$("#chartLoading span").text("Loading...").parent().show();
		}
		if (IDEX.ohlcTimeout)
		{
			clearTimeout(IDEX.ohlcTimeout)
		}
	}

	function chartLoadHander()
	{
		drawDivideLine()
		highLowPrice()
		updateData()
	}

	$(window).resize(function()
	{
		setTimeout(function()
		{
			highLowPrice()
		},250)
		drawDivideLine()
	})

	
	
	return IDEX;
	
}(IDEX || {}, jQuery));


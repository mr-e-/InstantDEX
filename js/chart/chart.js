
var IDEX = (function(IDEX, $, undefined) 
{	
	IDEX.ohlcTimeout;
	var datau = []
	var datab = []
	var latestTrade;
	var prevIndex;
	var btcwKeys = [3,5,6,4,7]
	var skynetKeys = [3,4,5,6,8]

	function testOHLC(obj) 
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
	
	function chartVar(obj) 
	{
		this.baseid = "6854596569382794790"
		this.relid = "6932037131189568014"
		this.basename = "SkyNET"
		this.relname = "jl777hodl"
		this.numticks = "5"
		this.numbars = "100"
		this.isvirtual = false
		this.flip = false
		
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
	
	var currentChart = new chartVar()

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

	function getStepOHLC(data)
	{
		var ohlc = []
		var volume = []
		var dataLength = data.length
		var keys = skynetKeys
		
		for (var i = 0; i < dataLength; i++) 
		{
			var pointDate = data[i][0]*1000;
			data[i] = ((i!= 0) && (data[i][keys[1]] > data[i-1][keys[1]]*5)) ? data[i-1] : data[i] // spike
			
			ohlc.push(new testOHLC([pointDate,data[i][keys[0]],data[i][keys[1]],data[i][keys[2]],data[i][keys[3]]]))
			volume.push({x:pointDate, y:data[i][keys[4]]});
		}

		return [ohlc, volume]
	}
	

	function getData(options)
	{
		var dfd = new $.Deferred();
		var id = options.flip ? options.relid : options.baseid
		var url = "http://idex.finhive.com/v1.0/run.cgi?run=qts&mode="+"bars"+"&exchange=ex_nxtae&pair="+id+"_"+"NXT"+"&type=tick&len="+options.numticks+"&num="+options.numbars
			
		$.getJSON(url, function(data)
		{
			dfd.resolve(data)	
		})
		
		return dfd.promise()
	}

	IDEX.makeChart =  (function make(siteOptions) 
	{
		siteOptions = (typeof siteOptions === "undefined") ? {} : siteOptions;
		if ('flip' in siteOptions && siteOptions.flip && siteOptions.relname == "NXT")
		{
			siteOptions.flip = false
		}
		currentChart = new chartVar(siteOptions)
		var titleName = currentChart.flip ? currentChart.relname+"/NXT" : currentChart.basename+"/NXT"
		
		getData(currentChart).done(function(data)
		{
			data = data.results.bars
			if (!data.length)
				return
			var both = getStepOHLC(data)
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
					enabled:true,
					adaptToUpdatedData:true,
					baseSeries:1,
				},
				
				title: 
				{
					useHTML:true,
					style:
					{
						color: '#CCC'
					},
					text:titleName,
					
				},
				
				rangeSelector: 
				{
					enabled:false,
					inputEnabled:false,
				},
				
				scrollbar:
				{
					enabled:false
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
					startOnTick:true,
					endOnTick:true,
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
					$(chart.container).on("mousemove",buildChartRenders)
			   }
			);
		});
		
		return make
	})();


	IDEX.makeMiniChart = function(asset, divid)
	{
		var url = "http://idex.finhive.com/v1.0/run.cgi?run=qts&mode=bars&exchange=ex_nxtae&pair="+asset+"_NXT&type=tick&len=10&num=300"
			
		$.getJSON(url, function(data)
		{
			var price = []
			var minPrice = -1;
			var maxPrice = -1;
			data = data.results.bars
			for (var i = 0; i < data.length; ++i)
			{
				data[i] = ((i!= 0) && (data[i][6] > data[i-1][6]*5)) ? data[i-1] : data[i] // spike
				price.push({x:data[i][0]*1000, y:data[i][6]});
				
				minPrice = (data[i][6] < minPrice || minPrice == -1) ? data[i][6] : minPrice
				maxPrice = (data[i][6] > maxPrice || maxPrice == -1) ? data[i][6] : maxPrice
			}
			var change = (Math.round(((data[data.length-1][6]/data[data.length-2][6])-1)*100)/100)*100
			priceAddClass = change >= 0 ? "text-green" : "text-red"
			priceRemoveClass = priceAddClass == "text-green" ? "text-red" : "text-green"
			var ss = data[0][0]
			var ee = data[data.length-1][0]
			var range = ((((ee-ss)/60)/60)/24)/2
			$("#"+divid).prev().removeClass(priceRemoveClass).addClass(priceAddClass).text(data[data.length-1][6]).prev().text(String(change)+"%")
			var chart2 = new Highcharts.StockChart(
			{
				chart:
				{
					renderTo:divid,
					spacingBottom:0,
					borderWidth:0,
					panning:true,
					zoomType:"",
					//width:"100%"
				},
				
				navigator:
				{
					enabled:false,
					adaptToUpdatedData:true,
					baseSeries:0,
					height:1,
				},
				
				title: 
				{
					text:"",
					enabled:false,
				},
				
				rangeSelector: 
				{
					enabled:false,
					inputEnabled:false,
				},
				
				scrollbar:
				{
					enabled:false
				},
				

				tooltip:
				{
					enabled:true,
					backgroundColor:'black',
					followPointer:false,	
					shared:true,
					crosshairs:[false,false],
					borderWidth:0,
					shadow:false,
					headerFormat:"",
					pointFormat:"<b>{point.y}</b>",
					style:{"height":"100px","padding":"0px","color":"#D8D8D8"},
				},

				yAxis: [
				{
					labels: 
					{
						enabled:false,
					},
					//height:"100%",
					maxPadding:0.0,
					minPadding:0.0,
					//min:minPrice - ((maxPrice-minPrice)/10),
					//max:maxPrice,
					endOnTick:false,
					startOnTick:false
					//showLastLabel:true,
				}],
				
				xAxis: [
				{
					labels: 
					{
						enabled:true,
						useHTML:true,
						align: 'left',
						y:0,
						style:{color:"#D8D8D8","whiteSpace":"nowrap"},
						autoRotation:false,
						formatter: function () 
						{
							if (this.isLast)
								b = Highcharts.dateFormat('<span style="float:right;margin-right:50px">%b %d</span>',this.value)
							else if (this.isFirst)
								b = Highcharts.dateFormat('<span style="float:right;padding-right:0px">%b %d</span>',this.value)
							else
								b = Highcharts.dateFormat('<span style="float:right;padding-right:25px">%b %d</span>',this.value)

							return b
						}
						//step:1
					},
					tickLength:5,
					ordinal:true,
					endOnTick:false,
					range: range*24*3600*1000,
					minRange: (range*24 * 3600 * 1000)/5,
					startOnTick:false,
					tickPositioner: function (a, b) 
					{
						var positions = []						
						positions.push(a)
						positions.push(Math.floor(a+((b-a)/2)))
						positions.push(b)
						return positions;
					}
				}],
				
				plotOptions: 
				{
					series:
					{
						minPointLength:1,
						pointPadding:1,
						states:
						{
							hover:{enabled:true},
							select:{enabled:true}
						},
						lineWidth: 0,
						animation:false,
					}
				},	 
				series: [
				{
					type: 'areaspline',
					name:"test",
					borderWidth:0,
					turboThreshold:10000,
					data: price,
					dataGrouping: 
					{
						enabled:false,
					}
				}]

			}, function(chart)
			   {
				   
			   }
			)	
		})
		
	}
	
	
	function buildChartRenders(event)
	{
		var chart = $('#chartArea').highcharts()
		var offset = $('#chartArea').offset();
		var x = event.pageX - offset.left;
		var y = event.pageY - offset.top	
		
		if (isInsidePlot(event))
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
				yText = chart.yAxis[1].toValue(y).toFixed(2)
			}
			else if (y >= chart.plotBox.y && y <= chart.yAxis[0].top + chart.yAxis[0].height)
			{
				yText = chart.yAxis[0].toValue(y).toFixed(2)
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


	function highLowPrice()
	{
		var chart = $('#chartArea').highcharts()
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

	

	
	function isInsidePlot(event, chart2)
	{
		var chart =	 $('#chartArea').highcharts()
		if (typeof chart2 !== "undefined")
		{
			chart = chart2
		}
		var container = $(chart.container);
		var offset = container.offset();
		var x = event.clientX - chart.plotLeft - offset.left;
		var y = event.clientY - chart.plotTop - offset.top;
		
		return chart.isInsidePlot(x, y);
	}

	$(".stepButton > .numbars > button").on("click", function(e)
	{
		e.preventDefault() 
		var chart = $('#chartArea').highcharts()
		
		if (chart)
		{
			currentChart.numbars = $(this).text()
			IDEX.killChart()
			IDEX.makeChart(currentChart)
		}
	})
	
	$(".stepButton > .numticks > button").on("click", function(e)
	{
		e.preventDefault() 
		var chart = $('#chartArea').highcharts()
		
		if (chart)
		{
			currentChart.numticks = $(this).text()
			IDEX.killChart()
			IDEX.makeChart(currentChart)
		}
	})

	$(".stepButton > .flip > button").on("click", function(e)
	{
		e.preventDefault() 
		var chart = $('#chartArea').highcharts()

		if (chart)
		{
			var text = $(this).text();
			if (text == "base")
			{
				currentChart.flip = false
			}
			else if (text == "rel")
			{
				currentChart.flip = true
			}
			else if (text == "virt")
			{
				return
			}
			
			IDEX.killChart()
			IDEX.makeChart(currentChart)
		}
	})

	$("#chartArea, .mini-chart-area-4").on('mousewheel DOMMouseScroll', function(event) 
	{
		event.preventDefault()
		var chart =	 $('#chartArea').highcharts()
		chart = $(this).highcharts()
		if (!chart)
			return
		
		if ("type" in event && event.type == "DOMMouseScroll")
		{
			event = event['originalEvent']
			event['originalEvent'] = {}
			if (event['detail'] > 0 )
			{
				event['originalEvent']['wheelDeltaY'] = -1
			}
			else
			{
				event['originalEvent']['wheelDeltaY'] = 1
			}
		}
		
		if (isInsidePlot(event, chart))
		{
			var curMax = chart.xAxis[0]['max']
			var curMin = chart.xAxis[0]['min']
			var dataMax = chart.xAxis[0]['dataMax']
			var dataMin = chart.xAxis[0]['dataMin']
			var diff = curMax - curMin
			diff /= 10				   
			if (event.originalEvent.wheelDeltaY < 0)
			{
				chart.xAxis[0].setExtremes((curMin-diff > dataMin) ? curMin-diff : dataMin, curMax, true, false);
			}
			else if (event.originalEvent.wheelDeltaY > 0)
			{
				chart.xAxis[0].setExtremes((curMin+diff < curMax) ? curMin+diff : curMin, curMax, true, false);
			}
		}
	});

	function drawDivideLine()
	{
		var chart = $('#chartArea').highcharts()
		var offset = $('#chartArea').offset();
		var path = ['M', 0, chart.plotTop+chart.series[0].yAxis.height+offset.top/2+40,
		'L', 0 + $("#chartArea")[0].clientWidth, chart.plotTop+chart.series[0].yAxis.height+offset.top/2+40]

		chart.splitLine.attr({d:path})
	}
	
	IDEX.killChart = function()
	{
		var chart = $('#chartArea').highcharts()

		if (chart)
		{
			chart.destroy()
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
		drawDivideLine()
	})
	
	$(window).load(function()
	{

	})
	


	
	
	return IDEX;
	
}(IDEX || {}, jQuery));


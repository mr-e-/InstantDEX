var datau = []
var datab = []
var ohlcTimeout;
var latestTrade;

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

var statAttr=
{
	'stroke-width': 1,
	stroke: '#999',
	zIndex: 10
}


Highcharts.setOptions(Highcharts.theme);

var makeChart =  (function make(step) 
{
	step = (typeof step === "undefined") ? "60" : step;
    $.getJSON('https://s5.bitcoinwisdom.com/period?step='+step+'&symbol=bitfinexbtcusd&nonce=', function (data) 
    //$.getJSON('http://idex.finhive.com/v1.0/run.cgi?run=qts&mode=bars&exchange=ex_nxtae&pair=12071612744977229797_NXT&type=tick&len=25&num=100', function (data) 
	//ohlc.push([tempDate,data[i][3],data[i][5],data[i][6],data[i][4]])
	//volume.push([cycleDate,data[i][7]])
    {
        var ohlc = []
        var volume = []
        var dataLength = data.length
        var mStep = Number(step)*1000

        for (var i = 0; i < dataLength; i += 1) 
        {
            var pointDate = data[i][0]*1000;
            var diff = (i == 0) ? 0 : pointDate - data[i-1][0]*1000
            
            if ((diff >= mStep) && (i != 0))
            {
                var cycles = diff/mStep

                for (var j = 1; j < cycles; ++j)
                {
					var cycleDate = (data[i-1][0]*1000) + (mStep*j)
                	var close = data[i-1][4]
                    ohlc.push(new testOHLC([cycleDate,close,close,close,close]))
				    volume.push({x:cycleDate,y:0});
                }
            }

            ohlc.push({
                x:pointDate,
                open:data[i][3],
                high:data[i][5],
                low:data[i][6],
                close:data[i][4]
            });
            volume.push({
                x:pointDate,
                y:data[i][7]
            });
        }
		
        var diff = Date.now() - data[data.length-1][0]*1000
		if (diff >= mStep)
		{
            var cycles = diff/mStep	

            for (var j = 1; j < cycles; ++j)
            {
				var cycleDate = (data[i-1][0]*1000) + (mStep*j)
            	var close = data[i-1][4]
                ohlc.push(new testOHLC([cycleDate,close,close,close,close]))
			    volume.push({x:cycleDate,y:0});
            }
		}
		
		latestTrade = String((data[data.length-1][2]+1))
        datau = ohlc
        datab = volume

        var $chart1 = new Highcharts.StockChart(
        {
            chart:
            {
            	renderTo:"mainChart",
                events:
				{
					load:chartLoadHander,
				},
                alignTicks: true,
                spacingLeft:0,
            },
            
            title: 
            {
                useHTML:true,
				text:"&nbsp;",
            },
            
            credits:
            {
                text:""
            },

		    exporting: 
			{
				enabled:true,
		        buttons: 
				{
		            a:{
						onclick:fifteenMinuteGrouping,
		            },
		            b: {
						onclick:fiveMinuteGrouping,
		            },
		            c: {
						onclick:threeMinuteGrouping,
		            },
		            d: {
						onclick:oneMinuteGrouping,
		            },
		        }
		    },
		    
            navigator:
            {
                enabled:true,
                adaptToUpdatedData:true,
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
				minPadding:0.2,
				maxPadding:0.2,
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
            	startOnTick:true,
            	endOnTick:true,
                range: 100* 60 * 1000,
				minRange: 15 * 60 * 1000,
            }],

            
            series: [
            {
                type: 'candlestick',
				borderWidth:0,
                turboThreshold:8000,
                data: ohlc,
                dataGrouping: 
                {
                    enabled:false,
                }
            }, 
            {
                type: 'column',
				borderWidth:0,
                turboThreshold:8000,
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
				chart.marketInfo = chart.renderer.text().attr(statAttr).add();
				$(chart.container).on("mousemove",buildChartRenders)
           }
        );
    });
    
    return make
})();


//$("#mainChart").on("mousemove", buildChartRenders)

var prevIndex;

function buildChartRenders(event)
{
    
	if (isInsidePlot(event))
	{
		var chart = $('#mainChart').highcharts()
		var offset = $('#mainChart').offset();
		var x = event.pageX - offset.left;
		var y = event.pageY - offset.top
		var pointRange = chart.series[0].pointRange
		var closestTime = Number(chart.xAxis[0].toValue(x).toFixed())
		var closestPoint = getPoint(0, closestTime)
		var index = chart.series[0].data.indexOf(closestPoint)
		
		if ((index != prevIndex && index > 0) && (closestTime % pointRange <= pointRange/2))
		{
			var d = new Date(closestPoint.x)
			var xPos = closestPoint.clientX
			var crossPathX = [
		    'M', xPos, chart.plotTop,
		    'L', xPos, chart.plotTop + chart.plotHeight];
         
			chart.crossLinesX.attr({d: crossPathX}).show()
			
			chart.crossLabelX.attr(
			{
			    x: xPos-15,
			    y: chart.plotTop+chart.plotHeight,
			    text: formatTime(d)
			}).show()
			
			var vol = chart.series[1].data[index].y
			var marketInfoText = "Open: "+closestPoint.open+"  High: "+closestPoint.high+"  Low: "+closestPoint.low+"  Close: "+closestPoint.close+"  Volume: "+vol+"<br>Date: "+String(d)

			chart.marketInfo.attr(
			{
				y: chart.plotBox.y-25,
				x: chart.plotBox.x+2,
				text: marketInfoText
			}).show()
		
			prevIndex = index
		}
		
		var crossPathY = [
		'M', chart.plotLeft, y,
        'L', chart.plotLeft + chart.plotWidth, y]

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
}


function getPoint(seriesIndex, value) 
{
    var val = null;
	var chart = $('#mainChart').highcharts()
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


$("#mainChart").on("mouseleave", destroyChartRenders)

function destroyChartRenders(event)
{
	var chart = $('#mainChart').highcharts()
	
	if (!chart)
		return

	chart.crossLinesX.hide()
	chart.crossLinesY.hide()
	chart.crossLabelX.hide()
	chart.crossLabelY.hide()
	chart.marketInfo.hide()
	prevIndex = -2
}

var sinceCount;

function dataSim(point, mstep)
{
    var dfd = new $.Deferred();	
    var OHLC = 
    {
        x: point.x,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close
    }
    var vol = 
    {
        x:OHLC.x,
        y:datab[datab.length - 1].y
    }

	var curDate = point.x

	if (!sinceCount)
	{
		sinceCount = String(datau[datau.length - 1].x +1)
	}
	
    $.getJSON('https://s5.bitcoinwisdom.com/trades?since='+latestTrade+'&symbol=bitfinexbtcusd&nonce=', function (data) 
    {
		var pastArr = []
		var futureArr = []
		var pastPoints = []
		var futurePoints = []

		if (data.length)
		{
			var pastVol = vol.y
			var futureVol = 0
			var tempFind = 0;
			for (var i = 0; i < data.length; ++i)
			{
				tempFind = tempFind > data[i]['tid'] ? tempFind : data[i]['tid']
			}
			latestTrade = String(tempFind)

			for (var i = data.length-1; i > -1; --i)
			{
				var loopDate = data[i]['date']*1000
				var timeOffset = loopDate - curDate	
		
				if (timeOffset >= mstep)
				{
					if (i < data.length-1)
					{
						futureArr = data.slice(0,i+1)
						pastArr = data.slice(i+1);
					}
					else
					{
						futureArr = data.slice(0)
					}
					break;
				} 
				else if (i == 0)
				{
					pastArr = data.slice(0);
				}
			}

			if (pastArr.length)
			{
				var pastPrice = pastArr[0]['price']
				OHLC = updateOHLC(OHLC, pastPrice)
				vol.y += volCount(pastArr)
				pastPoints.push(OHLC)
				pastPoints.push(vol)
			}

			if (futureArr.length)
			{
				var both = makeBothPoints(point, mstep)
				var futureOHLC = both[0]
				var futureVol = both[1]
				var futurePrice = futureArr[0]['price']

				futureOHLC = updateOHLC(futureOHLC, futurePrice)
				futureVol.y = volCount(futureArr)
				futurePoints.push(futureOHLC)
				futurePoints.push(futureVol)
			}

		}

		dfd.resolve([pastPoints,futurePoints])
    })

    return dfd.promise()
}


function makeBothPoints(point, mstep)
{
	var nextDate = point.x+mstep
	var OHLC = new testOHLC([nextDate, point.close, point.close, point.close, point.close])
	var vol = {y:0, x:nextDate}
	
	return [OHLC, vol]
}

function volCount(data)
{
	var vol = 0;

	for (var i = 0; i < data.length; ++i)
	{
    	vol += data[i]['amount']
	}

	return vol
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
    var chart = $('#mainChart').highcharts()
    var volSeries = chart.series[1];
    var ohlcSeries = chart.series[0];
    var mstep = ohlcSeries.pointRange

    ohlcTimeout = setTimeout(function () 
    {
    	var curPointOHLC = datau[datau.length - 1]
    	var curPointVol = datab[datab.length - 1]

        dataSim(curPointOHLC).done(function(both)
		{
		    var pastArr = both[0]
		    var futureArr = both[1]

			//if (!$.isEmptyObject(candle) && !$.isEmptyObject(vol))
			if (pastArr.length)
			{
				var pastCandle = pastArr[0]
				var pastVol = pastArr[1]

				if (volSeries.data.length == datau.length)
				{
				    volSeries.data[volSeries.data.length -1].update(pastVol, false, true);
				    ohlcSeries.data[ohlcSeries.data.length -1].update(pastCandle, true, true);
				}
				else
				{
				    datau.pop()
				    datab.pop()
				    datau.push(pastCandle)
				    datab.push(pastVol)
				    volSeries.setData(datab,false,true,true)
				    ohlcSeries.setData(datau,true,true,true)
				}
			}

			if (Number(sinceCount) - curPointOHLC.x >= mstep)
			{
				if (futureArr.length)
				{
					var futureCandle = futureArr[0]
					var futureVol = futureArr[1]
					ohlcSeries.addPoint(futureCandle, false, false);
					volSeries.addPoint(futureVol, false, false);
					chart.xAxis[0].setExtremes(chart.xAxis[0].min, chart.xAxis[0].max);
				}
				else
				{
					var emptyPoints = makeBothPoints(curPointOHLC, mstep)

					ohlcSeries.addPoint(emptyPoints[0], false, false);						
					volSeries.addPoint(emptyPoints[1], false, false);
					chart.xAxis[0].setExtremes(chart.xAxis[0].min, chart.xAxis[0].max);
				}
			}
			sinceCount = String(Date.now())
			updatePlotPos()
		    updateData();
		})

    }, 3000);
}


function updatePlotPos()
{
    var chart = $('#mainChart').highcharts()

	var curMax = chart.xAxis[0]['max']
	var curMin = chart.xAxis[0]['min']
	var dataMax = chart.xAxis[0]['dataMax']
	var dataMin = chart.xAxis[0]['dataMin']
	var oldDataMax = chart.xAxis[0]['dataMax']

	if (curMax == oldDataMax || curMax == dataMax)
	{
		chart.xAxis[0].setExtremes(curMin, dataMax);
	}
}


function chartLoadHander()
{
	drawDivideLine()
	updateData()
}

function oneMinuteGrouping()
{
    var chart = $('#mainChart').highcharts()
    chart.destroy()
    clearTimeout(ohlcTimeout)
    makeChart("60")
}

function threeMinuteGrouping()
{
    var chart = $('#mainChart').highcharts()
    chart.destroy()
    clearTimeout(ohlcTimeout)
    makeChart("180")
}
function fiveMinuteGrouping()
{
    var chart = $('#mainChart').highcharts()
    chart.destroy()
    clearTimeout(ohlcTimeout)
    makeChart("300")
}
function fifteenMinuteGrouping()
{
    var chart = $('#mainChart').highcharts()
    chart.destroy()
    clearTimeout(ohlcTimeout)
    makeChart("900")
}

$(window).resize(function()
{
	drawDivideLine()
})

function drawDivideLine()
{
    var chart = $('#mainChart').highcharts()
	var offset = $('#mainChart').offset();
    var path = ['M', 0, chart.plotTop+chart.series[0].yAxis.height+offset.top,
    'L', 0 + $("#mainChart")[0].clientWidth, chart.plotTop+chart.series[0].yAxis.height+offset.top]

    chart.splitLine = chart.renderer.path(path).attr(
    {
        'stroke-width': 0.5,
        stroke: '#999',
    }).add();
 
}

function isInsidePlot(event)
{
	var chart =  $('#mainChart').highcharts()
    var container = $(chart.container);
    var offset = container.offset();
    var x = event.clientX - chart.plotLeft - offset.left;
    var y = event.clientY - chart.plotTop - offset.top;
    
    return chart.isInsidePlot(x, y);
}

$("#mainChart").on('mousewheel', function(event) 
{
	event.preventDefault()
	var chart =  $('#mainChart').highcharts()
    if (isInsidePlot(event))
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




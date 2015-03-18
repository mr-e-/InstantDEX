
var IDEX = (function(IDEX, $, undefined) {

var datau = []
var datab = []
IDEX.ohlcTimeout;
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

function getStepOHLC(data, mStep, dataSite)
{
    var ohlc = []
    var volume = []
    var dataLength = data.length
	var diff = 0;
	var keys = (dataSite == "skynet") ? skynetKeys : btcwKeys
	
    for (var i = 0; i < dataLength; i++) 
    {
        var pointDate = data[i][0]*1000;
		data[i] = ((i!= 0) && (data[i][keys[1]] > data[i-1][keys[1]]*5)) ? data[i-1] : data[i] // skynet spike
		
        ohlc.push(new testOHLC([pointDate,data[i][keys[0]],data[i][keys[1]],data[i][keys[2]],data[i][keys[3]]]))
        volume.push({
            x:pointDate,
            y:data[i][keys[4]]
        });
        
        if (dataSite != "skynet")
        {
		    var nextDate = (i == data.length-1) ? Date.now() : data[i+1][0]*1000
			var diff = nextDate - pointDate
			if (diff > mStep)
			{
				var cycles = diff/mStep
				for (var j = 1; j < cycles; ++j)
				{
					var cycleDate =  pointDate + mStep*j
					var close = data[i][keys[3]]
					ohlc.push(new testOHLC([cycleDate,close,close,close,close]))
					volume.push({x:cycleDate,y:0});
				}
			}
		}
    }

    return [ohlc, volume]
}


IDEX.makeChart =  (function make(siteOptions) 
{
	siteOptions = (typeof siteOptions === "undefined") ? {} : siteOptions;
	var step = ('step' in siteOptions) ? siteOptions.step : "60";
	var dataSite = ('dataSite' in siteOptions) ? siteOptions.dataSite : "btcw";
    var mStep = Number(step)*1000
	
	if (dataSite == "btcw")
		var url = "https://s5.bitcoinwisdom.com/period?step="+step+"&symbol=bitfinexbtcusd&nonce="
	else if (dataSite == "skynet")
		var url = "http://idex.finhive.com/v1.0/run.cgi?run=qts&mode="+"bars"+"&exchange=ex_nxtae&pair="+siteOptions.baseid+"_"+"NXT"+"&type=tick&len="+"5"+"&num="+"100"

    $.getJSON(url, function (data)
    {
    	if (dataSite == "skynet")
    		data = data.results.bars
		var both = getStepOHLC(data, mStep, dataSite)
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
				text:(('baseid' in siteOptions) ? (String(siteOptions.baseid)+" / NXT") : "Bitfinex"),
				
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
                events:{afterSetExtremes: highLowPrice},
            	startOnTick:true,
            	endOnTick:true,
                range: ((dataSite == "btcw") ? (100 * mStep) : null),
				minRange: 15 * mStep,
            }],
            
            series: [
            {
                type: 'candlestick',
                name: dataSite,
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
			var marketInfoText = "Open: "+closestPoint.open+"  High: "+closestPoint.high+"  Low: "+closestPoint.low+"  Close: "+closestPoint.close+"  Volume: "+vol+"<br>Date: "+String(d)

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
    var chart = $('#chartArea').highcharts()
    var volSeries = chart.series[1];
    var ohlcSeries = chart.series[0];
    if (ohlcSeries.name == "skynet")
    	return
    var mStep = ohlcSeries.pointRange
    
    IDEX.ohlcTimeout = setTimeout(function () 
    {
    	var curPointOHLC = datau[datau.length - 1]
    	var curPointVol = datab[datab.length - 1]
		var curOHLC = new testOHLC([curPointOHLC.x, curPointOHLC.open, curPointOHLC.high, curPointOHLC.low, curPointOHLC.close])
		var curVol = {y:curPointVol.y, x:curPointOHLC.x}
		
    	$.getJSON('https://s5.bitcoinwisdom.com/trades?since='+latestTrade+'&symbol=bitfinexbtcusd&nonce=', function (data) 
		{
			var tempFind = 0;
			
			var sinceCount = String(Date.now())
			if (sinceCount-curPointOHLC.x >= mStep)
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
				tempFind = tempFind > data[i]['tid'] ? tempFind : data[i]['tid']
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

function isInsidePlot(event)
{
	var chart =  $('#chartArea').highcharts()
    var container = $(chart.container);
    var offset = container.offset();
    var x = event.clientX - chart.plotLeft - offset.left;
    var y = event.clientY - chart.plotTop - offset.top;
    
    return chart.isInsidePlot(x, y);
}

$(".stepButton > button").on("click", function(e)
{
	e.preventDefault() 
	
	var chart = $('#chartArea').highcharts()
	if (chart)
	{
		var stepStr = $(this).text().match(/(\d+|[^\d]+)/g)
		var num = Number(stepStr[0])
		var mult = stepStr[1]

		if (mult == 'd'){
			num = num * 24 * 60 * 60
		}
		else if (mult == 'h'){
			num = num * 60 * 60
		}
		else if (mult == 'm'){
			num = num * 60
		}
	
		chart.destroy()
		clearTimeout(IDEX.ohlcTimeout)
		IDEX.makeChart({'step':String(num),'dataSite':'btcw'})
    }
	
})

$("#chartArea").on('mousewheel', function(event) 
{
	event.preventDefault()
	var chart =  $('#chartArea').highcharts()
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

function drawDivideLine()
{
    var chart = $('#chartArea').highcharts()
	var offset = $('#chartArea').offset();
    var path = ['M', 0, chart.plotTop+chart.series[0].yAxis.height+offset.top/2,
    'L', 0 + $("#chartArea")[0].clientWidth, chart.plotTop+chart.series[0].yAxis.height+offset.top/2]

    chart.splitLine = chart.renderer.path(path).attr(
    {
        'stroke-width': 0.5,
        stroke: '#999',
    }).add();
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


	return IDEX;
}(IDEX || {}, jQuery));


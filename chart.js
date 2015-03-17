var datau = []
var datab = []
var ohlcTimeout;
var latestTrade;
var groupingUnits = [
[
    'minute',           
    [1, 2, 3, 4]                           
]]

function testOHLC(obj) 
{
    var __construct = function(that) 
    {
		that.open = obj.open
		that.high = obj.high
		that.low = obj.low
		that.close = obj.close
		that.x = obj.date
    }(this)
    
    this.next = function() {
        return this
    };
}

/*
function skynet() 
{
    var dfd = new $.Deferred();
    var params = {'run':'qts','mode':'bars','exchange':'ex_nxtae','pair':'12071612744977229797_NXT','type':'tick','len':'25','num':'100'}
    //var params = JSON.stringify(params);
    var turl = "http://idex.finhive.com/v1.0/run.cgi?run=qts&mode=bars&exchange=ex_nxtae&pair=12071612744977229797_NXT&type=tick&len=25&num=100"
	$.ajax
    ({
	  type: "GET",
	  url: turl,
	  	async:true,
	  crossDomain:true,
	  //data: "run=qts&mode=bars&exchange=ex_nxtae&pair=12071612744977229797_NXT&type=tick&len=25&num=100&callback=?",
	  dataType:"jsonp",
	  //jsonp:false,
	  //jsonpCallback:jsonCallback,
	  contentType:"text/javascript",
	  success:function(json, a){
	  	console.log(typeof a)
	  },
	  error:function(json, a, c){
	  	console.log('bb')
	  	json.always(function(a,b){ console.log(b)})
	  	console.log(a)
	  	console.log(c)
	  }
      //contentType: 'application/json'
	})
	
    return dfd.promise()
}
*/


Highcharts.setOptions(Highcharts.theme);

var makeChart =  (function make(step) 
{
	step = (typeof step === "undefined") ? "60" : step;
	//var sock = new WebSocket("ws://idex.finhive.com/socket");
    $.getJSON('https://s5.bitcoinwisdom.com/period?step='+step+'&symbol=bitfinexbtcusd&nonce=', function (data) 
    //$.getJSON('http://idex.finhive.com/v1.0/run.cgi?run=qts&mode=bars&exchange=ex_nxtae&pair=12071612744977229797_NXT&type=tick&len=25&num=100', function (data) 
    {
    	//console.log(data)
		var curDate = String(Date.now())
        var ohlc = []
        var volume = []
        var dataLength = data.length
        var mStep = Number(step)*1000
        
        //var test = new testOHLC({'open':'a'})
        var i = 0;
        var prevTempDate = 0;

        for (i = 0; i < dataLength; i += 1) 
        {
            var colr = ((data[i][3] > data[i][4]) ? "#c00" : "#0c0")
            var tempDate = data[i][0]*1000;
            var diff = tempDate - prevTempDate

            if ((diff != mStep) && (prevTempDate != 0))
            {
                var cycles = diff/mStep

                for (var j = 1; j < cycles; ++j)
                {
		            var tempObj = {}
					var cycleDate = (data[i-1][0]*1000) + (mStep*j)
					tempObj['open'] = data[i-1][4]
					tempObj['high'] = data[i-1][4]
					tempObj['low'] = data[i-1][4]
					tempObj['close'] = data[i-1][4]
					tempObj['x'] = cycleDate
					var tt = data[i-1][4]
                    //ohlc.push([cycleDate,tt,tt,tt,tt])
                    //volume.push([cycleDate,0])
                    ohlc.push(tempObj)
				    volume.push(
					{
				        color:colr,
				        x:cycleDate,
				        y:0
				    });
                }
            }

			//ohlc.push([tempDate,data[i][3],data[i][5],data[i][6],data[i][4]])
			//volume.push([cycleDate,data[i][7]])
            ohlc.push(
			{
                x:tempDate,
                open:data[i][3],
                high:data[i][5],
                low:data[i][6],
                close:data[i][4]
            });
            volume.push({
                color:colr,
                x:tempDate,
                y:data[i][7]
            });

            prevTempDate = tempDate
        }

		latestTrade = String((data[data.length-1][2]+1))
        var tempDate = data[data.length-1][0]*1000;
        var diff = curDate - tempDate
		if (diff >= mStep)
		{
            var cycles = diff/mStep
            for (var j = 1; j <= cycles; ++j)
            {
	            var tempObj = {}
				var cycleDate = (data[data.length-1][0]*1000) + (mStep*j)
				tempObj['open'] = data[data.length-1][4]
				tempObj['high'] = data[data.length-1][4]
				tempObj['low'] = data[data.length-1][4]
				tempObj['close'] = data[data.length-1][4]
				tempObj['x'] = cycleDate

                ohlc.push(tempObj)
			    volume.push({
			        //name:"point",
			        //color:colr,
			        x:cycleDate,
			        y:0
			    });
            }		
		}

        datau = ohlc
        datab = volume

        $('#mainChart').highcharts('StockChart', 
        {
            chart:
            {
                events:
				{
					load:chartLoadHander,
					redraw:changeColours
				},
                alignTicks: true
				//renderTo:'#mainChart',
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
                selected: 0
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
                //startOnTick:true,
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
                //startOnTick:true,
                //endOnTick:true,
				showLastLabel:true,
				//minPadding:0.125,
				//maxPadding:0.125,
            }],
            
            xAxis: [
            {
            	//startOnTick:true,
            	            	//endOnTick:true,
                labels: 
                {
                    align: 'center',
                    y:0
                },
                range: 100* 60 * 1000,
				minRange: 15 * 60 * 1000,
                events:
                {
                    //afterSetExtremes: changeColours
                }
            }],


            plotOptions: 
            {
                candlestick:
                {

				    //minPointLength:0.1,
                    //pointRange: 10,
                }, 
                column:
                {
                	minPointLength:0.1,
					borderRadius:0,
                },
                series:
                {
                pointPadding:0.1,
                //groupPadding:0.8
               	//grouping:false,

                }
            },   
            
            
            series: [
            {
                yAxis:0,
				xAxis:0,
                type: 'candlestick',
                name: 'AAPL',
                turboThreshold:8000,
                data: ohlc,
				borderWidth:0.0,
                dataGrouping: 
                {
                    enabled:false,
                    //units: groupingUnits
                }
            }, 
            {
				//borderColor:"black",
                type: 'column',
                name: 'Volume',
				borderWidth:0.5,
                turboThreshold:8000,
                data: volume,
                xAxis:0,
                yAxis: 1,
                dataGrouping: 
                {
                    enabled:false,
                    //units: groupingUnits
                }
            }]

        }, function(chart)
           {

           }
        );
    });
    return make
})();



$("#mainChart").on("mousemove", buildChartRenders)

function buildChartRenders(event)
{
	var chart = $('#mainChart').highcharts()
	var offset = $('#mainChart').offset();

	if (!chart || !chart.hasRendered)
	{
		return
	}
    var insideX = event.clientX - chart.plotLeft - offset.left;
    var insideY = event.clientY - chart.plotTop - offset.top;
    var isInside = chart.isInsidePlot(insideX, insideY);
	if (!isInside)
	{
		return
	}

    var x = event.pageX - offset.left;
    var y = event.pageY - offset.top

    var path = ['M', chart.plotLeft, y,
            'L', chart.plotLeft + chart.plotWidth, y,
            'M', x, chart.plotTop,
            'L', x, chart.plotTop + chart.plotHeight];

    if (chart.crossLines) 
	{
        chart.crossLines.attr({
            d: path
        });
    } 
	else 
	{
        chart.crossLines = chart.renderer.path(path).attr({
            'stroke-width': 1,
            stroke: '#999',
            zIndex: 10
        }).add();
    }
    
    if (chart.crossLabel) 
	{
        chart.crossLabel.attr({
            y: y+6,
            'stroke-width': 1,
            stroke: '#999',
            text: chart.yAxis[0].toValue(y).toFixed(2)
        });
    } 
	else 
	{
        chart.crossLabel = chart.renderer.text(chart.yAxis[0].toValue(y).toFixed(2), chart.plotLeft+chart.plotWidth, y+6).add();
    }

	
	var dd = Number(chart.xAxis[0].toValue(x).toFixed())
	dd += chart.xAxis[0].minPointOffset
	var d = new Date(dd)
	var hours = String(d.getHours())
	var minutes = d.getMinutes()
	minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
	var dString = hours+":"+minutes
    if (chart.crossLabelX) 
	{
        chart.crossLabelX.attr({
            x: x-15,
            'stroke-width': 1,
            stroke: '#999',
            text: dString
        });
    } 
	else 
	{
        chart.crossLabelX = chart.renderer.text(dString, x, chart.plotTop+chart.plotHeight).add();
    }

	   
	var closest = Number(chart.xAxis[0].toValue(x).toFixed())
	closest += chart.xAxis[0].minPointOffset	
	var b = getPoint(0, closest)
	var index = chart.series[0].data.indexOf(b)
	//console.log(chart.series[0])
	if (index >= 0)
	{
		var vol = chart.series[1].data[index].y
		var d = new Date(b.x)
		var marketInfoText = "Open: "+b.open+"  High: "+b.high+"  Low: "+b.low+"  Close: "+b.close+"  Volume: "+vol+"<br>Date: "+String(d)
		if (chart.marketInfo) 
		{
		    chart.marketInfo.attr(
			{
		        y: chart.plotBox.y-25,
		        'stroke-width': 1,
		        stroke: '#999',
		        text: marketInfoText
		    });
		} 
		else 
		{
		    chart.marketInfo = chart.renderer.text('hello', chart.plotBox.x-5, chart.plotBox.y).add();
		}
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


$("#mainChart").on("mouseleave", destroyChartRenders)

function destroyChartRenders(event)
{
	var chart = $('#mainChart').highcharts()
	if (!chart)
		return
	if (chart.crossLabel)
		chart.crossLabel.destroy()
	if (chart.crossLabelX)
		chart.crossLabelX.destroy()
	if (chart.crossLines)
		chart.crossLines.destroy()
	if (chart.marketInfo)
		chart.marketInfo.destroy()
	chart.crossLabelX = null
	chart.crossLabel = null
	chart.crossLines = null
	chart.marketInfo = null

	chart.redraw()

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
        color: ((OHLC.open >= OHLC.close) ? "#c00" : "#0c0"),
        x:OHLC.x,
        y:datab[datab.length - 1].y
    }

	var curDate = point.x

	if (!sinceCount)
	{
		sinceCount = String(datau[datau.length - 1].x +1)
	}
	
	//console.log(latestTrade + "  1")
	//console.log(datau)
    $.getJSON('https://s5.bitcoinwisdom.com/trades?since='+latestTrade+'&symbol=bitfinexbtcusd&nonce=', function (data) 
    {
		//console.log('1')
		//console.log(data)
		/*$.getJSON('https://s5.bitcoinwisdom.com/trades?since=""&symbol=bitfinexbtcusd&nonce=', function (newData) 
		{
			console.log('2')
			console.log(newData)
			console.log(newData[0])
		})*/
		//sinceCount = String(Date.now())
		//console.log(sinceCount + "  2")
		var pastArr = []
		var futureArr = []
		var pastPoints = []
		var futurePoints = []

		if (data.length)
		{
			latestTrade = String(data[0]['tid'] )
			var pastVol = vol.y
			var futureVol = 0
 			//console.log(data)
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
				//console.log(pastArr)
				var pastPrice = pastArr[0]['price']
				OHLC = updateOHLC(OHLC, pastPrice)
				vol.y += volCount(pastArr)
				pastPoints.push(OHLC)
				pastPoints.push(vol)
			}

			if (futureArr.length)
			{
				//console.log(futureArr)
				var both = makeBothPoints(point, mstep)
				var futureOHLC = both[0]
				var futureVol = both[1]
				var futurePrice = futureArr[0]['price']

				futureOHLC = updateOHLC(futureOHLC, futurePrice)
				futureVol.y = volCount(futureArr)
    			futureVol.color = ((futureOHLC.open >= futureOHLC.close) ? "#c00" : "#0c0");
				futurePoints.push(futureOHLC)
				futurePoints.push(futureVol)
			}

		}

		//console.log(pastPoints)
		//console.log(futurePoints)
		dfd.resolve([pastPoints,futurePoints])
    })

    return dfd.promise()
}


function makeBothPoints(point, mstep)
{
	var OHLC = {}
	var vol = {}
	var nextDate = point.x + mstep
    OHLC.open = point.close
	OHLC.high = point.close
	OHLC.low = point.close
	OHLC.close = point.close
	//OHLC.high = price > OHLC.open ? price : OHLC.open
	//OHLC.low = price > OHLC.open ? OHLC.open : price
	OHLC.x = nextDate

    vol.color = ((OHLC.open >= OHLC.close) ? "#c00" : "#0c0");
	vol.y = 0;
	vol.x = nextDate

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
	{
		OHLC.high = price
	}
	else if (price < OHLC.low)
	{
		OHLC.low = price
	}

	return OHLC
}


function getRandomInt(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function chartLoadHander()
{
	drawDivideLine()
	updateData()
	changeColours()
}

function updateData()
{
    var chart = $('#mainChart').highcharts()
    var volSeries = chart.series[1];
    var ohlcSeries = chart.series[0];
    var mstep = ohlcSeries.pointRange
	//console.log(chart)
	//console.log(chart.xAxis[0])

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
				//console.log(pastArr)
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
	chart.redraw();
}

//ordinal = chart.xAxis[0].ordinalPositions
//pos = ((ordinal && ordinal[1]) ? ordinal[1] : curMin) 


function oneMinuteGrouping()
{
    chart = $('#mainChart').highcharts()
    chart.destroy()
    clearTimeout(ohlcTimeout)
    makeChart("60")
}

function threeMinuteGrouping()
{
    chart = $('#mainChart').highcharts()
    chart.destroy()
    clearTimeout(ohlcTimeout)
    makeChart("180")
}
function fiveMinuteGrouping()
{
    chart = $('#mainChart').highcharts()
    chart.destroy()
    clearTimeout(ohlcTimeout)
    makeChart("300")
}
function fifteenMinuteGrouping()
{
    chart = $('#mainChart').highcharts()
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
	//console.log($("#mainChart"))
    var chart = $('#mainChart').highcharts()
	var offset = $('#mainChart').offset();
    var path = ['M', 0, chart.plotTop+chart.series[0].yAxis.height+offset.top,
            'L', 0 + $("#mainChart")[0].clientWidth, chart.plotTop+chart.series[0].yAxis.height+offset.top]

    if (chart.splitLine) 
	{
        chart.splitLine.attr({
            d: path
        });
    } 
	else 
	{
        chart.splitLine = chart.renderer.path(path).attr({
            'stroke-width': 0.5,
            stroke: '#999',
            zIndex: 10,
			opacity:1,
        }).add();
    }

	//chart.redraw()
}

function changeColours(e)
{
	var chart =  $('#mainChart').highcharts()
	var points = chart.series[0].points;
	var points2 = chart.series[1].points;
   	var obj = {}
   	var xAxis = chart.xAxis[0]

	if ((xAxis.oldMax != xAxis.max) || (xAxis.oldMin != xAxis.min) || ((xAxis.userMax == xAxis.dataMax) && (xAxis.userMin == xAxis.dataMin)) )
	//&& !((xAxis.userMax != xAxis.dataMax) && (xAxis.userMin != xAxis.dataMin))
	{
		var graphic = points2[0].graphic
		var width =	graphic.attr('width')
		var total = points2.length*width
		var a = points[0].graphic.d.split(" ")[1]
		var b = (points[points.length-1].graphic.d.split(" ")[7])
		var c = ((b-a) / points.length)
		var dec = 1 - (points.length / total)
		//console.log(graphic)
		for (var i = 0; i < points.length; ++i)
		{
			graphic = points[i].graphic
			var commands = graphic.d.split(/(?=[LMC])/)
			var sub = graphic.d.split(" ")
			var strokeColor = points[i].open > points[i].close ? "#d00" : "#0c0";
			var pairwidth = Number(sub[7]) - Number(sub[4])

			var diff = (pairwidth - c)
			if (i > points.length-10)
			{
			//	console.log(points[i].graphic.d.split(" ")[4] + "  " + points[i].graphic.d.split(" ")[7]); console.log(diff)
			}
			diff = diff/2
			//if (diff < 0)
				//diff  *= -1
			if (diff > 1 )
				diff = 1
			else if (diff > 0 )
				diff = 0.4
			else if (diff < -0.5)
				diff = -0.2
			else if (diff < 0)
				diff = 0.3
			
			//diff = Number(Math.round(diff * 100000) / 100000).toFixed(5);
			diff = Number(diff)
			sub[1] = String((Number(sub[1])) + (diff))
			sub[4] = String((Number(sub[4])) + (diff))
			sub[7] = String((Number(sub[7])) - (diff))
			sub[10] = String((Number(sub[10])) - (diff))
			graphic.attr({d:sub.join(" ")})
			//graphic.attr({'stroke-width':"0.09em"})
			//graphic.attr({'stroke-linecap':"butt"})
			//graphic.attr({'stroke-opacity':1})
			//graphic.attr({'fill':strokeColor})
			/*if (i > points.length-10 )
			{
				console.log('point len' + String(points.length))
				console.log("pw:  "+String(pairwidth))
				console.log("a: "+String(a))
				console.log("b: "+String(b))
				console.log("c: "+String(c))
				console.log(diff)
				console.log(points[i].graphic.d.split(" ")[1] + "  " + points[i].graphic.d.split(" ")[7])
			}*/
			
			if (points2[i].y < 1 && points2[i].y > 0)
			{
				points2[i].graphic.attr('height', 1)
				points2[i].graphic.attr('y', chart.series[1].yAxis.bottom - (chart.series[1].yAxis.bottom - chart.series[1].yAxis.height))
			}
			var tempgr = points2[i].graphic
			graphic.attr({'stroke':strokeColor})
			graphic.attr('stroke-width', 1)
			//console.log(chart.series[1].yAxis)
			var colWidth = Number(Math.round((points[i].graphic.d.split(" ")[7] - points[i].graphic.d.split(" ")[1]) * 100000) / 100000).toFixed(5)
			if (colWidth < 0.3)
				colWidth = 0.3
			points2[i].graphic.attr('width', colWidth)
			points2[i].graphic.attr('stroke', strokeColor)
			points2[i].graphic.attr('stroke-width', 1)
			//points2[i].graphic.attr('fill', "black")	
		}

		
	}
}


$("#mainChart").on('mousewheel', function(event) 
{
	event.preventDefault()
	
	var chart =  $('#mainChart').highcharts()
    var container = $(chart.container);
    var offset = container.offset();
    var x = event.clientX - chart.plotLeft - offset.left;
    var y = event.clientY - chart.plotTop - offset.top;
    var isInside = chart.isInsidePlot(x, y);
    if (isInside)
    {
        var curMax = chart.xAxis[0]['max']
        curMin = chart.xAxis[0]['min']
        //userMax = chart.xAxis[0]['userMax']
        //if (!userMax)
        //    userMax = curMax
        //userMin = chart.xAxis[0]['userMin']
        //diff = curMax - curMin
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
        //chart.redraw()
    }
});




var datau = []
var datab = []
var latestTrade;
var a = 1;
Highcharts.setOptions({
	global: {
		useUTC: false
	}
});

$(function () 
{
    $.getJSON('https://s5.bitcoinwisdom.com/period?step=60&symbol=bitfinexbtcusd&nonce=', function (data) 
    {
		var curDate = String(Date.now())
		//console.dir(data)
        var ohlc = []
        var volume = []
        var dataLength = data.length

        var groupingUnits = [[
            'minute',           
            [1, 2, 3, 4]                           
        ]]

        var i = 0;
        var prevTempDate = 0;

        for (i = 0; i < dataLength; i += 1) 
        {
            var colr = ((data[i][3] > data[i][4]) ? "#c00" : "#0c0")
            var tempDate = data[i][0]*1000;
            var diff = tempDate - prevTempDate

            if ((diff != 60000 && prevTempDate != 0))
            {
                var cycles = diff/60000

                for (var j = 1; j < cycles; ++j)
                {
		            var tempObj = {}
					var cycleDate = (data[i-1][0]*1000) + (60000*j)
					tempObj['open'] = data[i-1][4]
					tempObj['high'] = data[i-1][4]
					tempObj['low'] = data[i-1][4]
					tempObj['close'] = data[i-1][4]
					tempObj['x'] = cycleDate

                    ohlc.push(tempObj)
				    volume.push({
				        name:"point",
				        color:colr,
				        x:cycleDate,
				        y:0
				    });
                }
            }

            ohlc.push({
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
		if (diff >= 60000)
		{
            var cycles = diff/60000
            for (var j = 1; j <= cycles; ++j)
            {
	            var tempObj = {}
				var cycleDate = (data[data.length-1][0]*1000) + (60000*j)
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
					redraw:function() 
					{
						console.log(a)
						a++
						//$('#mainChart').highcharts().tooltip.refresh($('#mainChart').highcharts().hoverPoints ? );
					}
				},
                backgroundColor: '#000',
                borderColor: '#424242',
                borderWidth: 1,
                plotBorderWidth: 0,
                alignTicks: true
				//renderTo:'#mainChart',
            },

            navigator:
            {
			
                adaptToUpdatedData:true,
                enabled:true,
				height:30,
				//margin:30,
            },

            scrollbar:
            {
                enabled:false
            },

            rangeSelector: 
            {
                enabled:false,
				
                inputEnabled:false,
                selected: 0
            },

            title: 
            {
                useHTML:true,
				text:"&nbsp;",
            },


		    exporting: 
			{
				enabled:true,
		        buttons: 
				{
				//enabled:true,
		            contextButton: 
					{
						enabled:false,
					},
		            a: 
					{
						y:-3,
						align:"right",
				        theme: 
						{
							height:10,
							style:
							{
								color:"silver",
							},
							fill:"black",
				            'stroke-width': 1,
				            stroke: 'silver',
				            r: 0,
				            states: 
							{
				                hover: 
								{
				            		'stroke-width': 1,
				            		stroke: 'silver',
				                    fill: '#424242'
				                },
				                select: 
								{
				            		'stroke-width': 1,
				            		stroke: 'silver',
				                    fill: '#424242'
				                }
				            }
				        },
						symbol:null,
						menuItems:null,
						enabled:true,
						text:"3m",
						onclick:threeMinuteGrouping,
		            },
		            b: 
					{
						align:"right",
						y:-3,
						x:-35,
				        theme: 
						{
							height:10,
							style:
							{
								color:"silver",
							},
							fill:"black",
				            'stroke-width': 1,
				            stroke: 'silver',
				            r: 0,
				            states: 
							{
				                hover: 
								{
				            		'stroke-width': 1,
				            		stroke: 'silver',
				                    fill: '#424242'
				                },
				                select: 
								{
				            		'stroke-width': 1,
				            		stroke: 'silver',
				                    fill: '#424242'
				                }
				            }
				        },
						symbol:null,
						menuItems:null,
						enabled:true,
						text:"1m",
						onclick:oneMinuteGrouping,
		            },
		        }
		    },

            tooltip:
            {
				enabled:false,
                followPointer:false,    
                shared:true,
                crosshairs:[false,false],
                animation:true,
                hideDelay:0.5,
            },

            yAxis: [
            {
                labels: 
                {
                    align: 'left',
					y:3.3,
                },
				top:"5%",
                gridLineWidth:0,
                height: '60%',
                lineWidth: 0,
                tickWidth:0.4,
				offset:10,
                startOnTick:true,
                endOnTick:true,
				showLastLabel:true,
				showFirstLabel:true,
				maxPadding:0.125,
				minPadding:0.125,
            }, 
            {
                labels: 
                {
                    align: 'left',
					y:3.3,
                },
                //endOnTick:true,
				showLastLabel:true,
                //startOnTick:true,
                gridLineWidth:0,
                top: '75%',
                height: '20%',
                offset: 10,
                lineWidth: 0,
                tickWidth:0.4,
				maxPadding:0.255,
				minPadding:0.255,
            }],

            xAxis: [
            {
                labels: 
                {
                    align: 'center',
                    y:0
                },
                //startOnTick:true,
                lineWidth:0,
                gridLineWidth:0,
                tickWidth:1,
                range: 15* 600 * 1000,
				minRange: 15 * 60 * 1000,
                events:
                {
                    afterSetExtremes: changeColours
                }
            }],

            credits:
            {
                text:""
            },

            plotOptions: 
            {
                candlestick:
                {
                    //stickyTracking:false,
                	//enableMouseTracking: false,
                    color: '#a80808',
                    lineColor:'#d00',
                    upLineColor: '#0c0', 
                    pointPadding: 0.1,
                    //pointRange: 10,
                    //groupPadding: 0.1,
                    upColor: '#0c0',
					fillColor:"black",
					minPointLength:0.1,
					
					//grouping:false,
                }, 
                column:
                {
					minPointLength:0.1,
					//borderRadius:1,
					//colorByPoint:false,
                	//enableMouseTracking: false,
                    //stickyTracking:false,
                    pointPadding: 0.1,
                    //groupPadding: 0.1,
					animation:false,
					grouping:false,
                },
                series:
                {
					//events:{mouseOut:destroyChartRenders, mouseOver:buildChartRenders},
					//grouping:false,
					///oxymoronic:true,
					lineWidth: 1,
                }
            },

            series: [
            {
                yAxis:0,
				xAxis:0,
                type: 'candlestick',
                name: 'AAPL',
                turboThreshold:2000,
                data: ohlc,
				borderWidth:0,
                dataGrouping: 
                {
                    enabled:false,
                    //units: groupingUnits
                }
            }, 
            {
				borderColor:"black",
                type: 'column',
                name: 'Volume',
				borderWidth:0.5,
                turboThreshold:2000,
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

                $(chart.container).on('mousewheel', function(event) {
					event.preventDefault()
					//console.log(event)
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
            }
        );
    });
});



$("#mainChart").on("mousemove", buildChartRenders)

function buildChartRenders(event)
{
	var chart = $('#mainChart').highcharts()
	var offset = $('#mainChart').offset();

	while (!chart || !chart.hasRendered)
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

function dataSim(point)
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
		
				if (timeOffset >= 60000)
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
				var both = makeBothPoints(point)
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


function makeBothPoints(point)
{
	var OHLC = {}
	var vol = {}
	var nextDate = point.x + 60000

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
}

function updateData()
{
    var chart = $('#mainChart').highcharts()
    var volSeries = chart.series[1];
    var ohlcSeries = chart.series[0];

    setTimeout(function () 
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

			if (Number(sinceCount) - curPointOHLC.x >= 60000)
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
					var emptyPoints = makeBothPoints(curPointOHLC)

					ohlcSeries.addPoint(emptyPoints[0], false, false);						
					volSeries.addPoint(emptyPoints[1], false, false);
					chart.xAxis[0].setExtremes(chart.xAxis[0].min, chart.xAxis[0].max);
				}
			}
			sinceCount = String(Date.now())
			//console.log(String(Date.now()) + "  3")
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

//ordinal = chart.xAxis[0].ordinalPositions
//pos = ((ordinal && ordinal[1]) ? ordinal[1] : curMin) 


function oneMinuteGrouping()
{
    chart = $('#mainChart').highcharts()

    /*chart.xAxis[0].update({
        min: 142533006000,
        max: 142533006000,
        minRange: 40 * 60 * 1000,
    });*/
    chart.series[0].update({ dataGrouping: { enabled: true, forced: true, units: [ ['minute', [1]] ] } }, false)
    chart.series[1].update({ dataGrouping: { enabled: true, forced: true, units: [ ['minute', [1]] ] } })


}


function threeMinuteGrouping()
{
    chart = $('#mainChart').highcharts()
    /*obj = {
        min: 1425330060000,
        max: 1425336060000,
        minRange: 40 * 180 * 1000,
    }
    chart.xAxis[0].update(obj);*/
    chart.series[0].update({ dataGrouping: { enabled: true, forced: true, units: [ ['minute', [3]] ] } }, false)
    chart.series[1].update({ dataGrouping: { enabled: true, forced: true, units: [ ['minute', [3]] ] } } )
	//chart.redraw()
    //console.dir(chart)
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

var oneTime = 1;
function changeColours(e)
{

	var chart =  $('#mainChart').highcharts()
	var points = chart.series[0].points;
	var points2 = chart.series[1].points;
   	var obj = {}

	if (points.length > 400)
	{
		//obj={borderWidth:0,'stroke-width':"0.6px",}
		//obj={"stroke-alignment":"inner"}
	}
	else
	{
		//obj={borderWidth:0,'stroke-width':1}
	}

	if ((chart.xAxis[0].oldMax != chart.xAxis[0].max) || (chart.xAxis[0].oldMin != chart.xAxis[0].min)) 
	{
		for (var i = 0; i < points.length; ++i)
		{
			//console.log(chart)
			var graphic = points[i].graphic
			var commands = graphic.d.split(/(?=[LMC])/)
			var sub = graphic.d.split(" ")
			strokeColor = points[i].open > points[i].close ? "#d00" : "#0c0";
			//console.log( sub)
			sub[1] = String((Number(sub[1]) + 0.5))
			sub[4] = String((Number(sub[4]) + 0.5))
			sub[7] = String((Number(sub[7]) - 0.5))
			sub[10] = String((Number(sub[10]) - 0.5))
			if (Number(sub[7]) - Number(sub[1]) == 1)
				graphic.attr({d:sub.join(" ")})
			//graphic.attr({'stroke-width':"1px"})
			//console.log(points[i].pointAttr)
			//points[i].pointAttr[""]['stroke'] = strokeColor
			//console.log( graphic.d)
		}

		for (var i = 0; i < points2.length; ++i)
		{
			var graphic = points2[i].graphic
			var width =	graphic.attr('width')
			if (width == 2)
				graphic.attr('width', width-1)
		}
	}
	//chart.redraw()

}







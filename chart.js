var datau = []
var datab = []

$(function () 
{
    $.getJSON('https://s5.bitcoinwisdom.com/period?step=60&symbol=bitfinexbtcusd&nonce=', function (data) 
    {
        // split the data set into ohlc and volume
        var ohlc = [],
        volume = [],
        dataLength = data.length,
            // set the allowed units for data grouping
        groupingUnits = [[
            'week',                         // unit name
            [1]                             // allowed multiples
        ], [
            'month',
            [1, 2, 3, 4, 6]
        ]],

        i = 0;
        tempDate = 1423330020000;

        //for (x = 0; x < 5; x++)
        //{
        for (i = 0; i < dataLength; i += 1) 
        {
            ohlc.push({
                x:tempDate, // the date
                open:data[i][3], // open
                high:data[i][5], // high
                low:data[i][6], // low
                close:data[i][4] // close
            });

            colr = ((data[i][3] > data[i][6]) ? "#c00" : "#0c0")
            //colr = ((data[i][1] > data[i][4]) ? "blue" : "red")
            volume.push({
                name:"point",
                color:colr,
                x:tempDate, // the date
                y:data[i][7] // the volume
            });
            tempDate += 60000;
        }
        //}

		//console.dir(ohlc)
        //console.dir(volume)
        //console.dir(data)
        datau = ohlc
        datab = volume

        // create the chart
        $('#mainChart').highcharts('StockChart', 
        {
            chart:
            {
                events:
				{
				load:updateData,
				redraw:function() {
					//$('#mainChart').highcharts().tooltip.refresh($('#mainChart').highcharts().hoverPoints ? );
					}
				},
                backgroundColor: '#000',
                /*
                backgroundColor: 
                {
                    linearGradient: { x1: 0, y1: 0, x2: 1, y2: 1 },
                    stops: [
                    [0, 'rgb(48, 48, 96)'],
                    [1, 'rgb(0, 0, 0)']
                    ]
                },*/
                borderColor: '#424242',
                borderWidth: 1,
                //plotBackgroundColor: 'rgba(255, 255, 255, .1)',
                plotBorderColor: 'white',
                plotBorderWidth: 0,
                //alignTicks: true
            },


            /*navigation:{
                buttonOptions:
                {
                    enabled:false
                }
            },*/

            navigator:
            {
			
                adaptToUpdatedData:true,
                enabled:true,
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
                text: null
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
                gridLineWidth:0,
                height: '70%',
                lineWidth: 0,
                tickWidth:0.4,
				offset:10,
                startOnTick:true,
                endOnTick:true,
				showLastLabel:true,
				maxPadding:0.055,
				minPadding:0.055,
				//minorTickWidth:1,
				//minorTickInterval:'auto',
                //endOnTick:true,
           		/*crosshair: {
                    color: 'blue',
                    snap: false
                }*/
            }, 
            {
                labels: 
                {
                    align: 'left',
					y:3.3,

                },
                endOnTick:false,
				showLastLabel:true,
                //startOnTick:true,
                gridLineWidth:0,
                top: '75%',
                height: '20%',
                offset: 10,
                lineWidth: 0,
                tickWidth:0.4,
				//tickInterval:1,
				//minorTickWidth:1,
				//minorTickInterval:'auto',
            	/*crosshair: {
                    color: 'blue',
                    snap: false,
                },*/
                //lineColor: 'white',
                //minorGridLineWidth:0.5,
                //minorGridLineColor: 'transparent'
            }],

            xAxis: [
            {
                //type:'datetime',
                labels: 
                {
                    align: 'center',
                    y:0
                },

                /*crosshair: {
                    color: 'white',
                    snap: false,
                },*/
				//maxPadding:10,
                startOnTick:true,
                lineWidth:0,
                gridLineWidth:0,
                tickWidth:1,
                range: 15* 600 * 1000,
				minRange: 5 * 60 * 1000,
                events:
                {
                    afterSetExtremes: changeColours
                }
            }],



            credits:
            {
                text:"CryptoEth"
            },


            plotOptions: 
            {
                candlestick:
                {
                    //borderColor: '#CCCCCC',
                    //borderWidth: 1,

                    stickyTracking:false,
                    color: '#a80808',
                    lineColor:'#d00',
                    upLineColor: '#0c0', // docs
                    pointPadding: 0.1,
                    groupPadding: 0.1,
                    upColor: '#0c0',
					fillColor:"black",
                	//enableMouseTracking: false,
                }, 
                column:
                {
					/*dataLabels:{
						enabled:true
					},*/
					//pointRange:60*1000,
                    //pointPlacement: -0.5,
					borderWidth:1,
					borderRadius:0,
					colorByPoint:false,
                	//enableMouseTracking: false,
                    stickyTracking:false,
                    pointPadding: 0.1,
                    groupPadding: 0.1,
                
                },
                series:
                {
					//events:{mouseOut:destroyChartRenders, mouseOver:buildChartRenders},
					lineWidth: 1,
					//threshold: null,
                }
            },


            series: [
            {
                yAxis:0,
                type: 'candlestick',
                name: 'AAPL',
                turboThreshold:9000,
                data: ohlc,
				borderColor:"white",
				borderWidth:"1",
                dataGrouping: 
                {
                    enabled:false,
                    //units: groupingUnits
                }
            }, 
            {
                type: 'column',
                name: 'Volume',
                turboThreshold:9000,
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
                //console.dir(chart);

                /*
                renderer = chart.renderer

                renderer.rect(10, 10, 100, 50, 5).attr({
                    fill: 'blue',
                    stroke: 'black',
                    'stroke-width': 1
                }).add();


                renderer.circle(100, 100, 50).attr({
                    fill: 'red',
                    stroke: 'black',
                    'stroke-width': 1
                }).add();

                renderer.text('Hello world', 200, 100).attr({
                    rotation: 45
                }).css({
                    fontSize: '16pt',
                    color: 'green'
                }).add();*/

                /*var point = chart.series[0].data[chart.series[0].data.length-2]
                var text = chart.renderer.text(
                        'Max',
                        point.plotX + chart.plotLeft + 10,
                        point.plotY + chart.plotTop - 10
                    ).attr({
                        zIndex: 5
                    }).add(),
                    box = text.getBBox();

                chart.renderer.rect(box.x - 5, box.y - 5, box.width + 10, box.height + 10, 5)
                    .attr({
                        fill: '#FFFFEF',
                        stroke: 'gray',
                        'stroke-width': 1,
                        zIndex: 4
                    })
                    .add();*/

                $(chart.container).on('mousewheel', function(event) {
					event.preventDefault()
		            var container = $(chart.container);
		            var offset = container.offset();
                    var x = event.clientX - chart.plotLeft - offset.left;
                    var y = event.clientY - chart.plotTop - offset.top;
                    var isInside = chart.isInsidePlot(x, y);
                    if (isInside)
                    {
                        //console.dir($("#mainChart").highcharts())
                        //console.dir(chart.xAxis)
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
                    //console.dir( (isInside ? 'inside' : 'outside') + ' the plotarea');
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
		return
    var insideX = event.clientX - chart.plotLeft - offset.left;
    var insideY = event.clientY - chart.plotTop - offset.top;
    var isInside = chart.isInsidePlot(insideX, insideY);
	if (!isInside)
		return

    var x = event.pageX - offset.left;
    var y = event.pageY - offset.top
	//console.dir(chart)

    var path = ['M', chart.plotLeft, y,
            'L', chart.plotLeft + chart.plotWidth, y,
            'M', x, chart.plotTop,
            'L', x, chart.plotTop + chart.plotHeight];
      
    if (chart.crossLines) {
        // update lines
        chart.crossLines.attr({
            d: path
        });
    } else {
        // draw lines
        chart.crossLines = chart.renderer.path(path).attr({
            'stroke-width': 1,
            stroke: '#999',
            zIndex: 10
        }).add();
    }
    
    if (chart.crossLabel) {
        // update label
        chart.crossLabel.attr({
            y: y+6,
            'stroke-width': 1,
            stroke: '#999',
            text: chart.yAxis[0].toValue(y).toFixed(2)
        });
    } else {
        // draw label
        chart.crossLabel = chart.renderer.text(chart.yAxis[0].toValue(y).toFixed(2), chart.plotLeft+chart.plotWidth, y+6).add();
    }

	
	var dd = Number(chart.xAxis[0].toValue(x).toFixed())
	//console.log(dd)
	dd += chart.xAxis[0].minPointOffset
	var d = new Date(dd)
	var hours = String(d.getHours())
	var minutes = d.getMinutes()
	minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
	var dString = hours+":"+minutes
    if (chart.crossLabelX) {
        // update label
        chart.crossLabelX.attr({
            x: x-15,
            'stroke-width': 1,
            stroke: '#999',
            text: dString
        });
    } else {
        // draw label
        chart.crossLabelX = chart.renderer.text(dString, x, chart.plotTop+chart.plotHeight).add();
    }

	   
	var closest = Number(chart.xAxis[0].toValue(x).toFixed())
	closest += chart.xAxis[0].minPointOffset
	var b = getPoint(chart, 0, closest)
	var index = chart.series[0].data.indexOf(b)
	if (index >= 0)
	{
		var vol = chart.series[1].data[index].y
		var d = new Date(b.x)
		var marketInfoText = "Date: "+String(d)+"  Open: "+b.open+"  High: "+b.high+"  Low: "+b.low+"  Close: "+b.close+"  Volume: "+vol
		if (chart.marketInfo) 
		{
		    chart.marketInfo.attr(
			{
		        y: chart.plotBox.y+5,
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


function getPoint(chartObj, seriesIndex, value) 
{
    var val = null;
    var points = chartObj.series[seriesIndex].points;

	if (value >= points[points.length-1].x)
	{
		//console.log(value)
		//console.log(points[points.length-1].x)
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
		    //val = points[i].x;
		}
	}
    return val;
}


$("#mainChart").on("mouseleave", destroyChartRenders)

function destroyChartRenders(event)
{
	var chart = $('#mainChart').highcharts()
	/*var offset = $('#mainChart').offset();
    var insideX = event.clientX - chart.plotLeft - offset.left;
    var insideY = event.clientY - chart.plotTop - offset.top;
    var isInside = chart.isInsidePlot(insideX, insideY);
	if (isInside)
		return*/

	if (chart.crossLabel && chart.crossLines && chart.marketInfo)
	{
		chart.crossLabel.destroy()
		chart.crossLabelX.destroy()
		chart.crossLines.destroy()
		chart.marketInfo.destroy()
	}
	chart.crossLabelX = null
	chart.crossLabel = null
	chart.crossLines = null
	chart.marketInfo = null

	chart.redraw()

}


counter = 0
volSim = getRandomInt(5,10) 

function dataSim(point)
{
    //point = series.data[series.data.length-1]
    var date = point.x
    var OHLC = 
    {
        x: point.x,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close
    }


    var newVal = getRandomInt(282,284)

    OHLC.close = newVal

    if (newVal > OHLC.high)
    {
        OHLC.high = newVal
    }
    else if (newVal < OHLC.low)
    {
        OHLC.low = newVal
    }


    counter += 1
    volSim += getRandomInt(10,15) 
    if (counter > 10)
    {
        counter = 0
        OHLC.x += 60000
        OHLC.open = point.close
        OHLC.close = point.close
        OHLC.high = point.close
        OHLC.low = point.close
        //OHLC.high = newVal > OHLC.open ? newVal : OHLC.open
        //OHLC.low = newVal > OHLC.open ? OHLC.open : newVal
        volSim = getRandomInt(10,30) 
    }

    var vol = 
    {
        name:"point",
        color: ((OHLC.open >= OHLC.close) ? "#c00" : "#0c0"),
        x:OHLC.x, // the date
        y:volSim 
    }

    return [OHLC, vol]
}


function getRandomInt(min, max) 
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


counters = 1
function updateData()
{
    var chart = $('#mainChart').highcharts()
	/*var offset = $('#mainChart').offset();
    chart.renderer.rect(chart.plotLeft+1, chart.plotTop+1, chart.plotWidth-10, chart.plotHeight-1, 0)
        .attr({
            fill: 'transparent',
            zIndex: 44
        }).on("mouseout", destroyChartRenders)
        .add();*/
    var series = chart.series[1];
    var series2 = chart.series[0];
    setTimeout(function () 
    {
		//console.dir(chart);

        var oldDataMax = chart.xAxis[0]['dataMax']
        var pointVOL = datab[datab.length - 1]
        var pointOHLC = datau[datau.length - 1]
        var both = dataSim(pointOHLC)
        var candle = both[0]
        var vol = both[1]
        //datau.push(candle)
        //datab.push(vol)
        //console.log(datau.length)

        if (candle.x > pointOHLC.x)
        {
        //datau.push(candle)
        //datab.push(vol)
            //console.log(counter)
            //console.log("B OLD:"+String(pointOHLC.x))
            //console.log("B CANDLE:"+ String(candle.x))
            //console.log(chart.series[1].data.length)
            //console.dir(chart.xAxis[0].getExtremes())
            //console.log(chart.xAxis[0]['dataMax'])

            series.addPoint(vol, false, false);
            series2.addPoint(candle, false, false);
            //series.setData(datab,true,true,true)
            //series2.setData(datau,true,true,true)

            //console.dir(chart.xAxis[0].getExtremes())
			chart.xAxis[0].setExtremes(chart.xAxis[0].min, chart.xAxis[0].max);
            //chart.xAxis[0].setExtremes(candle.x-(60*15*1000), candle.x);
            //console.dir(chart.xAxis[0].getExtremes())
            /*chart.xAxis[0].update({
                max: candle.x,
            });*/
            //chart.xAxis[0].setExtremes(candle.x-(60*15*1000), pointOHLC.x);

            //console.log(chart.xAxis[0]['dataMax'])
        }
        else
        {
            //console.log(counter)
            //console.log("OLD:"+String(pointOHLC.x))
            //console.log("CANDLE:"+ String(candle.x))
            //console.log(series.data.length)
            //console.log(series2.data.length)
            //console.log(datau.length)
            //console.dir(series2)
            //console.log(series2.data[series2.data.length -1].x)
            if (series.data.length == datau.length)
            {
                series.data[series.data.length -1].update(vol, false, true);
                series2.data[series2.data.length -1].update(candle, true, true);
            }
            else
            {
                datau.pop()
                datab.pop()
                datau.push(candle)
                datab.push(vol)
                series.setData(datab,false,true,true)
                series2.setData(datau,true,true,true)
                //series.addPoint(vol, false, false);
                //series2.addPoint(candle, true, false);
            }
        }

        //chart.redraw()
        //chart.xAxis[0].update({type:'datetime'});
		
        curMax = chart.xAxis[0]['max']
        curMin = chart.xAxis[0]['min']
        dataMax = chart.xAxis[0]['dataMax']
        dataMin = chart.xAxis[0]['dataMin']
        ordinal = chart.xAxis[0].ordinalPositions
        if (curMax == oldDataMax || curMax == dataMax)
        {
            //pos = ((ordinal && ordinal[1]) ? ordinal[1] : curMin) 
            chart.xAxis[0].setExtremes(curMin, dataMax);
            //console.log("hi "+String(series.data.length))
        }
        updateData();
    }, 500);
}


function changeColours(e)
{
    //console.dir(e.target.series)

    /*groupedData = e.target.series[0].groupedData
    if (groupedData)
    {
        len = groupedData.length;
        for (var i = 0; i < len; i++)
        {
            e.target.series[1].groupedData[i].color = groupedData[i].color
        }
    }

    $('#mainChart').highcharts().redraw()*/
}


function initTable() 
{
    //sendPost().done(function(data){
        //len = Object.keys(data['orderbooks']).length;
        //console.dir(len)
        $("table.example tbody").first().empty();
        for(var i=0; i<5; i++)
        {
            var row = $("<tr><td>test"+String(i)+"</td></tr>")
            $("table.example tbody").first().append(row);
        }
    //})
}



$("#t1").on('click', function(e)
{
    chart = $('#mainChart').highcharts()

    chart.xAxis[0].update({
        min: 142533006000,
        max: 142533006000,
        minRange: 40 * 60 * 1000,
    });
    chart.series[0].update({ dataGrouping: { enabled: true, forced: true, units: [ ['minute', [1]] ] } })
    chart.series[1].update({ dataGrouping: { enabled: true, forced: true, units: [ ['minute', [1]] ] } })


})


$("#t2").on('click', function(e){

    chart = $('#mainChart').highcharts()
    //console.dir(chart)
    obj = {
        min: 1425330060000,
        max: 1425336060000,
        minRange: 40 * 180 * 1000,
    }
    //console.dir(obj)
    chart.xAxis[0].update(obj);
    chart.series[0].update({ dataGrouping: { enabled: true, forced: true, units: [ ['minute', [3]] ] } })
    chart.series[1].update({ dataGrouping: { enabled: true, forced: true, units: [ ['minute', [3]] ] } })
    //console.dir(chart)
})


$("#t3").on('click', function(e){

    chart = $('#mainChart').highcharts()
    chart.xAxis[0].update({
        minRange: 40 * 1440 * 1000,
    });
    chart.series[0].update({ dataGrouping: { forced: true, units: [ ['day', [1]] ] } })
    chart.series[1].update({ dataGrouping: { forced: true, units: [ ['day', [1]] ] } })


})


$(document).ready(function () 
{
    //console.dir(1)
    initTable()
});

/*
units: [[
	'millisecond', // unit name
	[1, 2, 5, 10, 20, 25, 50, 100, 200, 500] // allowed multiples
], [
	'second',
	[1, 2, 5, 10, 15, 30]
], [
	'minute',
	[1, 2, 5, 10, 15, 30]
], [
	'hour',
	[1, 2, 3, 4, 6, 8, 12]
], [
	'day',
	[1]
], [
	'week',
	[1]
], [
	'month',
	[1, 3, 6]
], [
	'year',
	null
]]
*/



/*

$(function () {

    function afterSetExtremes(e) {

        var chart = $('#mainChart').highcharts();

        chart.showLoading('Loading data from server...');
        $.getJSON('http://www.highcharts.com/samples/data/from-sql.php?start=' + Math.round(e.min) +
                '&end=' + Math.round(e.max) + '&callback=?', function (data) {

                chart.series[0].setData(data);
                chart.hideLoading();
            });
    }


*/


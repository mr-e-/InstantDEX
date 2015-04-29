
var IDEX = (function(IDEX, $, undefined) 
{
	
	IDEX.loadMiniCharts = function()
	{
		$('.mini-chart').each(function()
		{
			var baseID = $(this).find(".mini-chart-area-1 span").first().attr("data-asset")
			var relID = $(this).find(".mini-chart-area-1 span").first().next().attr("data-asset");
			var divid = $(this).find(".mini-chart-area-4").attr('id');
			
			//if (baseID != "-1" && relID != "-1")
			IDEX.makeMiniChart(baseID, relID, divid);
		})
	}
	
	
	IDEX.makeMiniChart = function(baseID, relID, divid)
	{
		var baseNXT = baseID == IDEX.snAssets.nxt.assetid
		if (baseNXT)
			baseID = relID
		var url = "http://idex.finhive.com/v1.0/run.cgi?run=qts&mode=bars&exchange=ex_nxtae&pair="+baseID+"_NXT&type=tick&len=10&num=300"

		$.getJSON(url, function(data)
		{
			var price = []
			var minPrice = -1;
			var maxPrice = -1;
			
			data = data.results.bars

			for (var i = 0; i < data.length; ++i)
			{
				if (baseNXT)
				{
					data[i][6] = (1 / data[i][6]).toFixed(6)
					data[i] = ((i!= 0) && (data[i][6] < data[i-1][6]/5)) ? data[i-1] : data[i] // spike
				}
				else
				{
					data[i] = ((i!= 0) && (data[i][6] > data[i-1][6]*5)) ? data[i-1] : data[i] // spike
				}
				price.push({x:data[i][0]*1000, y:Number(data[i][6])});

				minPrice = (data[i][6] < minPrice || minPrice == -1) ? data[i][6] : minPrice
				maxPrice = (data[i][6] > maxPrice || maxPrice == -1) ? data[i][6] : maxPrice
			}

			var change = (Math.round(((data[data.length-1][6]/data[data.length-2][6])-1)*100)/100)*100
			var priceAddClass = change >= 0 ? "ok-green" : "ok-red"
			var priceRemoveClass = priceAddClass == "ok-green" ? "ok-red" : "ok-green"
			var ss = data[0][0]
			var ee = data[data.length-1][0]
			var range = ((((ee-ss)/60)/60)/24)/2
			
			$("#"+divid).prev().removeClass(priceRemoveClass).addClass(priceAddClass).text(data[data.length-1][6]).prev()
			$("#"+divid).parent().find(".mini-chart-area-2").text(change.toFixed(2)+"%")
			
			var chart2 = new Highcharts.StockChart(
			{
				chart:
				{
					renderTo:divid,
					spacingBottom:0,
					borderWidth:0,
					spacingRight:4,
					panning:true,
					zoomType:"",
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
					enabled:false,
				},
				
				rangeSelector: 
				{
					enabled:false,
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
					maxPadding:0.0,
					minPadding:0.0,
					width:0,
					tickWidth:0,
					endOnTick:false,
					startOnTick:false
				}],
				
				xAxis: [
				{
					labels: 
					{
						enabled:true,
						useHTML:true,
						align: 'left',
						y:-1,
						style:{color:"#D8D8D8","whiteSpace":"nowrap"},
						autoRotation:false,
						formatter: function () 
						{
							var rightPadding = "30px";
							if (this.isLast) rightPadding = "73px";
							else if (this.isFirst) rightPadding = "0px";
							var html = '<span style="float:right;padding-right:'+rightPadding+'">%b %d</span>'
							
							return Highcharts.dateFormat(html, this.value)
						}
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
						var diff = 0;
						var len = this.ordinalPositions.length;

						for (var i = 0; i<len; ++i)
							if (this.ordinalPositions[i] >= a)
								break;
						
						for (var j = 0; j<len; ++j)
							if (this.ordinalPositions[j] >= b)
								break;
						
						var calc = i + ((j - i)/2)
						
						if (calc % 1 != 0)
						{
							var highMid = this.ordinalPositions[Math.floor(calc)+1]
							var lowMid = this.ordinalPositions[Math.floor(calc)]
							var recalc = Math.floor(lowMid + ((highMid-lowMid)/2))
							diff = recalc
						}
						else
						{
							diff = this.ordinalPositions[Math.floor(calc)]
						}

						//console.log("LEN:"+String(len)+"  CALC:"+String(i + ((j - i)/2)))
						//console.log("I:"+String(i)+"  J:"+String(j))
						//console.log("A:"+String(a)+"  B:"+String(diff)+"  C:"+String(b))					
						positions.push(a)
						positions.push(diff)
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
						},
						lineWidth: 2,
						animation:false,
						fillOpacity:0.45,
						shadow:true,

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
	
	return IDEX;
	
}(IDEX || {}, jQuery));

var IDEX = (function(IDEX, $, undefined) {


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
			priceAddClass = change >= 0 ? "text-green" : "text-red"
			priceRemoveClass = priceAddClass == "text-green" ? "text-red" : "text-green"
			var ss = data[0][0]
			var ee = data[data.length-1][0]
			var range = ((((ee-ss)/60)/60)/24)/2
			$("#"+divid).prev().removeClass(priceRemoveClass).addClass(priceAddClass).text(data[data.length-1][6]).prev()
			var $parent = $(this).parent();
			$parent.find(".mini-chart-area-2").text(change.toFixed(2)+"%")
			
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
								b = Highcharts.dateFormat('<span style="float:right;padding-right:50px">%b %d</span>',this.value)
							else if (this.isFirst)
								b = Highcharts.dateFormat('<span style="float:right;padding-right:0px">%b %d</span>',this.value)
							else
								b = Highcharts.dateFormat('<span style="float:right;padding-right:30px">%b %d</span>',this.value)

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
						var diff = 0;
						var len = this.ordinalPositions.length;

						for (var i = 0; i<len; ++i)
							if (this.ordinalPositions[i] >= a)
								break;
						
						for (var j = 0; j<len; ++j)
							if (this.ordinalPositions[j] >= b)
								break;
						
						//var zz = this.ordinalPositions[i] - a

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
	
	return IDEX;
	
}(IDEX || {}, jQuery));

var skynetKeys = {
	"startTime":0,
	"endTime":1,
	"open":3,
	"high":4,
	"low":5,
	"close":6,
	"vol":7
}

var skynetKeysTime = {
	"startTime":0,
	"endTime":1,
	"open":2,
	"high":3,
	"low":4,
	"close":5,
	"vol":6
}






Sleuthcharts = (function(Sleuthcharts) 
{
	
	
	Sleuthcharts.SkyNETParams = function(obj) 
	{
		this.baseurl = "http://api.finhive.com/v1.0/run.cgi?";
		//this.key = "9cf373ead4858e19bf93ae5ea238c4c796819cc883c877513f528b95721a1085";
		this.key = "beta_test";

		this.section = "";
		this.run = "";
		this.mode = "";
		this.exchg = "";
		this.pair = "";
		this.num = "";
		this.bars = "";
		this.len = "";
		
		Sleuthcharts.constructFromObject(this, obj);
	}


	Sleuthcharts.SkyNETParams.prototype.makeURL = function()
	{
		var arr = []
		for (key in this)
		{
			if (this.hasOwnProperty(key))
				if (key != "baseurl" && String(this[key]).length)
					arr.push(key+"="+this[key])
		}
		var s = arr.join("&")

		return this.baseurl+s
	}

	
	var MarketHandler = Sleuthcharts.MarketHandler = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	MarketHandler.prototype = 
	{
		
		marketSettings:
		{
			baseID: "6854596569382794790",
			relID: "6932037131189568014",
			baseName: "SkyNET",
			relName: "jl777hodl",
			pair: "6932037131189568014_NXT",

			barType: "tick",
			barWidth: "100",

			exchange: "nxtae",

			isVirtual: false,
			isFlipped: false,
		},
		
		
		init: function(chart, userOptions)
		{
			var marketHandler = this;
			
			marketHandler.chart = chart;
			
			marketHandler.phases = [];
			marketHandler.tradeData = [];
			marketHandler.marketData = {};
			
			marketHandler.marketSettings = Sleuthcharts.extend(marketHandler.marketSettings, userOptions.marketSettings);

		},
		
		
		changeMarket: function(newMarket)
		{
			var marketHandler = this;
			var settings = marketHandler.marketSettings;

			//var pair = (newRelID == 5527630) ? newBaseID + "_" + "NXT" : newBaseID + "_" + newRelID;
			var pair = newMarket.baseID + "_" + newMarket.relID;
			

			settings.pair = pair;
			settings.baseID = newMarket.baseID;
			settings.relID = newMarket.relID;
			settings.baseName = newMarket.baseName;
			settings.relName = newMarket.relName;
			settings.exchange = newMarket.exchange;
		},
		
		
		changeSettings: function(newSettings)
		{
			var marketHandler = this;
			var chart = marketHandler.chart;
			var settings = marketHandler.marketSettings;
			
			var configType = newSettings.configType;
			
			if (configType == "time")
			{
				settings.barType = newSettings.configVal;
				settings.barWidth = newSettings.val;
				chart.updateChart();
			}
			else if (configType == "charttype")
			{
				chart.userOptions.series[0].seriesType = newSettings.configVal;
				
				chart.initSeries();
				chart.redraw();
			}
			else if (configType == "depth")
			{
				chart.yAxis[0].minPadding = newSettings.configVal;
				chart.yAxis[0].maxPadding = newSettings.configVal;
				chart.redraw();
			}
			else if (configType == "indicator")
			{
				return;
				
				var indicatorType = newSettings.configVal;
				
				if (indicatorType == "none")
				{
					$(sleuthchart.node).find(".volInd").empty()
					$(sleuthchart.node).find(".candleInd").empty()

					sleuthchart.settings.isInd = false;
					toggleLoading(node, false)
					redraw(sleuthchart)
				}
				else
				{
					sleuthchart.settings.isInd = true;
					settings.candleInd[0].type = indicatorType
					settings.candleInd[1].type = indicatorType
					settings.volInd[0].type = indicatorType
					settings.volInd[1].type = indicatorType
					
					if (indicatorType == "bollin")
					{
						settings.candleInd[0].len = "1|2"
						settings.candleInd[1].len = "1|2"
						settings.volInd[0].len = "1|2"
						settings.volInd[1].len = "1|2"
					}
					else
					{
						settings.candleInd[0].len = "7"
						settings.candleInd[1].len = "20"
						settings.volInd[0].len = "7"
						settings.volInd[1].len = "20"
					}
					
					sleuthchart.settings = settings
					toggleLoading(node, true)
					Sleuthcharts.getBothInds(sleuthchart, settings).done(function()
					{
						toggleLoading(node, false)
						redraw(sleuthchart)
					});
				}
			}
		},
		
		
		getMarketData: function()
		{
			var marketHandler = this;
			var dfd = new $.Deferred();
			
			
			var isTime = marketHandler.marketSettings.barType == "time";

			marketHandler.getSkynetMarketData().done(function(data)
			{
				data = data.results
				
				marketHandler.formatMarketData(data, isTime);
				
				dfd.resolve();
				//var formattedData = marketHandler.marketData;
			
			})
			
			return dfd.promise();
		},
		
		
		getSkynetMarketData: function()
		{
			var dfd = new $.Deferred();
			var marketHandler = this;
			
			var settings = marketHandler.marketSettings;
			
			var obj = {}
			obj.run = "quotes";
			obj.section = "crypto";
			obj.mode = "bars";
			obj.exchg = settings.exchange;
			obj.pair = settings.pair
			obj.num = "500"
			obj.bars = settings.barType
			obj.len = settings.barWidth
			obj.order = "asc"
			

			var params = new Sleuthcharts.SkyNETParams(obj)
			var url = params.makeURL()
			//console.log(url)
			
			$.getJSON(url, function(data)
			{
				dfd.resolve(data)	
			})
			
			return dfd.promise()
		},
		
		
		getSkynetIndicatorData: function()
		{
			var dfd = new $.Deferred();

			var settings = this.settings;
			var indSettings = this.indicatorSettings;
			
			var iret = (indSettings.type == "bollin") ? "solo" : "merge";

	
			var obj = {}
			obj.run = "indicator";
			obj.section = "crypto";
			obj.mode = "bars";
			obj.exchg = settings.exchange;
			obj.pair = settings.pair
			obj.num = "500"
			obj.bars = settings.barType
			obj.len = settings.barWidth
			obj.order = "asc"
			
			obj.icode = "ind_" + indSettings.type
			obj.ion = indSettings.price
			obj.ilen = indSettings.len
			obj.inum = "500"
			obj.iret = iret
			obj.order = "asc"

			var params = new Sleuthcharts.SkyNETParams(obj)
			var url = params.makeURL()
			//console.log(url)
			
			$.getJSON(url, function(data)
			{
				dfd.resolve(data)	
			})
			
			return dfd.promise()
		},
		
		
		
		formatMarketData: function(data, isTime)
		{
			var marketHandler = this;
			
			var ohlc = [];
			var volume = [];
			var dataLength = data.length;
			
			var keys = isTime ? skynetKeysTime : skynetKeys;

			
			for (var i = 0; i < dataLength; i++) 
			{
				var obj = {}
				
				for (key in keys)
				{
					obj[key] = data[i][keys[key]]
				}

				obj.startTime *= 1000;
				obj.endTime *= 1000;
				
				
				ohlc.push(obj)
				volume.push({x:obj.startTime, y:obj.vol});
			}

			marketHandler.marketData.ohlc = ohlc;
			marketHandler.marketData.volume = volume;
		}
		
	}

	
	
	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));







/*

IDEX.OHLC = function(obj) 
{
	this.startTime = ""
	this.endTime = ""
	this.open = ""
	this.high = ""
	this.low = ""
	this.close = ""
	this.vol = ""
	
	IDEX.constructFromObject(this, obj);
}


function fixSpikes()
{
	if (i != 0 && (obj['high'] > ohlc[ohlc.length-1].close * 5 ))
	{
		console.log('no')
		point = data[i-1]
		
		obj = {}
		
		for (key in keys)
		{
			obj[key] = data[i-1][keys[key]]
		}
		
		obj = ohlc[ohlc.length-1]
		
	}
}

function invert()
{
	data[i][keys[0]] =  Number((1 / close).toFixed(6))
	data[i][keys[1]] =  Number((1 / low).toFixed(6))
	data[i][keys[2]] =  Number((1 / high).toFixed(6))
	data[i][keys[3]] =  Number((1 / open).toFixed(6))
	data[i][keys[4]] =  Number((close * vol).toFixed(6))

	data[i] = ((i!= 0) && (data[i][keys[2]] < data[i-1][keys[2]]/5)) ? data[i-1] : data[i] // spike
	
		var startTime = data[i][keys['start']] * 1000;
		var endTime = data[i][keys['end']] * 1000;
		var open = data[i][keys['open']]
		var high = data[i][keys['high']]
		var low = data[i][keys['low']]
		var close = data[i][keys['close']]
		var vol = data[i][keys['volume']]
	
}
*/


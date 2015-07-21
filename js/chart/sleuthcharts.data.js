var IDEX = (function(IDEX, $, undefined) 
{   
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

	
	
	IDEX.SkyNETParams = function(obj) 
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
		
		IDEX.constructFromObject(this, obj);
	}
	

    IDEX.SkyNETParams.prototype.makeURL = function()
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
	
	
	

	
	
	Sleuthcharts = (function(Sleuthcharts) 
	{
		
		
		var MarketData = Sleuthcharts.MarketData = function()
		{
			this.init.apply(this, arguments)
		}
		
		
		MarketData.prototype = 
		{
			
			settings:
			{
				baseID: "6854596569382794790",
				relID: "6932037131189568014",
				baseName: "SkyNET",
				relName: "jl777hodl",
				pair: "6932037131189568014_NXT",

				barType: "tick",
				numTicks: "100",
				barWidth: "100",

				exchange: "nxtae",

				isVirtual: false,
				isFlipped: false,
				tradeData: [],
				phases: [],
			},
			
			
			init: function(a)
			{

			},
			
			
			changeMarket: function(newMarket)
			{
				var settings = this.dataSettings;
				var newBaseID = newMarket.baseID;
				var newRelID = newMarket.relID;
				
				var pair = (newRelID == 5527630) ? newBaseID + "_" + "NXT" : newBaseID + "_" + newRelID
				
	
				settings.pair = pair;
				settings.exchange = obj.exchange;
			},
			
			getMarketData: function()
			{
				var dfd = new $.Deferred();
				
				
				data = data.results
				
				var both = IDEX.getStepOHLC(data, isTime);
				var ohlc = both[0]
				var vol = both[1]
				

				
				var data = chart.marketData.data;
				
				var ohlcData = data.ohlcData
				var volData = data.volumeData;
				chart.phases = ohlc

				
				return dfd.promise();
			},
			
			
			getSkynetMarketData: function()
			{
				var dfd = new $.Deferred();

				var settings = this.settings;
				
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
				

				var params = new IDEX.SkyNETParams(obj)
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

				var params = new IDEX.SkyNETParams(obj)
				var url = params.makeURL()
				//console.log(url)
				
				$.getJSON(url, function(data)
				{
					dfd.resolve(data)	
				})
				
				return dfd.promise()
			},
			
			
			
			formatMarketData: function()
			{
				var data;
				var isTime;
				
				
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

					obj['startTime'] *= 1000;
					obj['endTime'] *= 1000;
					
					
					ohlc.push(obj)
					volume.push({x:obj['startTime'], y:obj['vol']});
				}

				return [ohlc, volume]
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
	
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));

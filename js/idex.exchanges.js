	
	
var IDEX = (function(IDEX, $, undefined) 
{
	
	
	IDEX.snAssets = 
	{
		'nxt':{'name':"NXT",'assetID':"5527630", 'decimals':8}
	};
	
	
	IDEX.exchangeClasses = {};
	IDEX.exchangeList = ["nxtae", "bitfinex", "btc38", "bitstamp", "btce", "poloniex", "bittrex", "huobi", "coinbase", "okcoin", "bityes", "lakebtc", "exmo"];

	
	IDEX.allCoins = [];
	IDEX.allExchanges = {};
	IDEX.allMarkets = [];
	
	
	IDEX.initExchanges = function()
	{
		var dfd = new $.Deferred();
		
		IDEX.initExchangesLoop(0, function()
		{
			IDEX.nxtae = IDEX.allExchanges.nxtae;

			dfd.resolve();
		})
		
		return dfd.promise();
	}
	
	
	
	IDEX.initExchangesLoop = function(exchangeListIndex, callback)
	{
		var exchangeListLength = IDEX.exchangeList.length;
		var exchangeName = IDEX.exchangeList[exchangeListIndex];
		if (exchangeName == "nxtae")
		{
			var exchangeToInit = new IDEX.exchangeClasses[exchangeName]();
		}
		else
		{
			var exchangeToInit = new IDEX.Exchange();
		}
		
		IDEX.allExchanges[exchangeName] = exchangeToInit;
		
		exchangeToInit.initState().done(function()
		{
			exchangeListIndex++;
			
			if (exchangeListIndex < exchangeListLength)
				IDEX.initExchangesLoop(exchangeListIndex, callback)
			else
				callback();
		});
	}
	
	
	
	IDEX.initAllMarkets = function()
	{
		var dfd = new $.Deferred();
		
		if (localStorage.allCoins && localStorage.allMarkets)
		{
			var allCoins = JSON.parse(localStorage.getItem('allCoins'));
			var allMarkets = JSON.parse(localStorage.getItem('allMarkets'));

			IDEX.allCoins = allCoins;
			IDEX.allMarkets = allMarkets;
			
			dfd.resolve();
		}
		
		else
		{
			getExternalExchangeMarkets().done(function(parsedMarkets)
			{				
				var marketsByExchange = parsedMarkets.exchanges;
				console.log(marketsByExchange);
				var nxtaeMarkets = getNxtAEMarkets();
				marketsByExchange.nxtae = nxtaeMarkets;
				
				
				for (exchangeName in IDEX.allExchanges)
				{
					var exchange = IDEX.allExchanges[exchangeName];
					
					if (exchangeName in marketsByExchange)
					{
						exchange.markets = marketsByExchange[exchangeName];
					}
				}
				
				
				var allCoins = [];
				var allMarkets = {};
				
				for (exchangeName in IDEX.allExchanges)
				{
					var exchange = IDEX.allExchanges[exchangeName];
					
					var exchangeMarkets = exchange.markets;
					
					for (var i = 0; i < exchangeMarkets.length; i++)
					{
						var market = exchangeMarkets[i];
						
						var baseRel = market.split("_");
						var base = baseRel[0];
						var rel = baseRel[1];
						
						
						var func = function(name, isAsset) 
						{
							var coinObj = {};
							
							if (isAsset)
							{
								var assetObj = IDEX.nxtae.assets.getAsset("assetID", name);
								
								if (!($.isEmptyObject(assetObj)))
								{
									coinObj.name = assetObj.name;
									coinObj.isAsset = true;
									coinObj.assetID = assetObj.assetID;
								}
								else
								{
									coinObj.name = name.toUpperCase();
									coinObj.isAsset = false;
								}

							}
							else
							{
								coinObj.name = name.toUpperCase();
								coinObj.isAsset = false;
							}
							
							
							return coinObj
						};
						
						var isNxtAE = exchangeName == "nxtae";
						var baseObj = func(base, isNxtAE);
						var relObj = func(rel, isNxtAE);

						
						
						if (market in allMarkets)
						{
							var marketObj = allMarkets[market];
						}
						else
						{
							var marketObj = allMarkets[market] = {};

							marketObj.marketName = baseObj.name + "_" + relObj.name;
							marketObj.base = baseObj;
							marketObj.rel = relObj;
							marketObj.exchanges = [];
						}
						
						marketObj.exchanges.push(exchangeName);

						if (!IDEX.searchListOfObjectsAll(allCoins, baseObj))
						{
							allCoins.push(baseObj)
						}
						
						if (!IDEX.searchListOfObjectsAll(allCoins, relObj))
						{
							allCoins.push(relObj)
						}
					}
				}
				
				for (key in allMarkets)
				{
					var market = allMarkets[key];
					if (market.exchanges.length == 1 && market.exchanges[0] == "nxtae")
					{
						market.isNxtAE = true;
					}
					else
					{
						market.isNxtAE = false;
					}
				}
				
				IDEX.allCoins = allCoins;
				IDEX.allMarkets = allMarkets;
				localStorage.setItem('allCoins', JSON.stringify(allCoins));
				localStorage.setItem('allMarkets', JSON.stringify(allMarkets));

				dfd.resolve();
				
			})
		}
		
		return dfd.promise();

	}

	
	
	function getNxtAEMarkets()
	{
		var nxtae = IDEX.allExchanges.nxtae;
		var allAssets = nxtae.assets.allAssets;
		var markets = [];
		
		for (var i = 0; i < allAssets.length; i++)
		{
			var asset = allAssets[i];
			
			markets.push(asset.assetID + "_" + "nxt");
		}
		
		return markets;
	}

	
	
	function getExternalExchangeMarkets()
	{
		var dfd = new $.Deferred();
		

		var obj = {}
		obj.section = "crypto";
		obj.run = "search";
		obj.field = "pair";
		obj.term = "";
		obj.key = "beta_test";
		obj.filter = "";

		var url = IDEX.makeSkynetURL(obj)

		$.getJSON(url, function(data)
		{
			var parsed = parseSkynetSearch(data.results);
			
			dfd.resolve(parsed);
		})
		
		
		return dfd.promise();
	}
	
	
	
	function parseSkynetSearch(data)
	{
		var markets = {};
		var exchanges = {};
		
		for (pair in data)
		{
			var pairExchanges = data[pair].split('|');
			var isNxtAE = false;
			var marketObj = {};
			
			marketObj.marketName = pair;
			marketObj.exchanges = [];
			
			for (var i = 0; i < pairExchanges.length; i++)
			{
				var exchange = pairExchanges[i];
				
				if (exchange == "nxtae")
					isNxtAE = true;
				
				if (!(exchange in exchanges))
					exchanges[exchange] = [];
				
				exchanges[exchange].push(pair);
				marketObj.exchanges.push(exchange);
				//markets.push({"pair":pair,"exchange":exchange})
			}
			
			markets[pair] = marketObj;
			//if (!isNxtAE)
			//	markets.push(pair);
		}

		return {"exchanges":exchanges, "markets":markets};
	}
	
	

    IDEX.makeSkynetURL = function(obj)
    {
		var baseurl = "http://api.finhive.com/v1.0/run.cgi?"
        var arr = []
		
        for (key in obj)
        {
			arr.push(key+"="+obj[key])
        }
        var s = arr.join("&")

        return baseurl+s
    }
	
	
	
	IDEX.updateExchangeBalances = function()
	{
		
	}
	
	
	
	$(".allExchanges-nav-cell").on("click", function()
	{
		var $wrap = $(this).closest(".allExchangesFullPopup");
		
		var exchange = $(this).attr("data-exchange");
		
		var $trigExchange = $wrap.find(".allExchanges-exchange[data-exchange='"+exchange+"']");
		
		
		$wrap.find(".allExchanges-nav-cell").removeClass("active");
		$wrap.find(".allExchanges-exchange").removeClass("active");
		
		$trigExchange.addClass("active");
		$(this).addClass("active");
		
	})
	
	
	
	$(".allExchanges-exchange-nav-cell").on("click", function()
	{
		var $wrap = $(this).closest(".allExchanges-exchange");
		
		var tab = $(this).attr("data-tab");
		
		var $trigTab = $wrap.find(".allExchanges-exchange-content[data-tab='"+tab+"']");
		
		
		$wrap.find(".allExchanges-exchange-nav-cell").removeClass("active");
		$wrap.find(".allExchanges-exchange-content").removeClass("active");
		
		$trigTab.addClass("active");
		$(this).addClass("active");
		
		
		var exchange = $(this).closest(".allExchanges-exchange").attr("data-exchange");
		
		updateExchangeTab(exchange, $tabWrap);
	})
	
	
	
	function updateExchangeTab(exchange)
	{
		console.log(exchange);
	}
	
	
	
	function updateBalancesTable()
	{
		var $tbody = $(".allMarkets-table table tbody")

	}
	
	

	$(".allExchanges-nav-cell td").on("click", function()
	{
		IDEX.updateMarketTable();
	})
	
	
	
	IDEX.updateMarketTable = function()
	{
		var $tbody = $(".allMarkets-table table tbody")

		IDEX.getAssetTradeInfo().done(function(assetsWithVol)
		{
			assetsWithVol.sort(IDEX.compareProp('quantityNXT')).reverse();
			var list = [];

			for (var i = 0; i < assetsWithVol.length; i++)
			{
				var vols = assetsWithVol[i];
				var assetID = vols.assetID;
				var asset = IDEX.nxtae.assets.getAsset("assetID", assetID);
				
				var market = asset.name + "/NXT";
				var volNXT = vols.quantityNXT / Math.pow(10, 8);
				
				var tr = "<tr><td>"+market+"</td><td>"+assetID+"</td><td>"+volNXT+"</td></tr>";
				
				$tbody.append($(tr));

			}
		});
	}
	
	
	

	

	return IDEX;
	
	
}(IDEX || {}, jQuery));

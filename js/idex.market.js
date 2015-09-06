

var IDEX = (function(IDEX, $, undefined) 
{
	
	function check()
	{
		//if (filterExchanges.length && (filterExchanges.indexOf(exchange) == -1))
		//	continue;
	}



	IDEX.CMHandler = function(forceUpdate, filterExchanges)
	{
		var handler = this;
		var marketExchanges = filterExchanges;
		var market = handler.handlerType == "coin" ? handler.coin : handler.market;
		var retDFD =  new $.Deferred();
		var dfds = [];
		var exchangeUpdaterKey = handler.exchangeUpdaterKey;
		var exchangeUpdaterMethod = handler.exchangeUpdaterMethod;
		
		forceUpdate = typeof forceUpdate == "undefined" ? false : forceUpdate;
		
		for (var i = 0; i < marketExchanges.length; i++)
		{
			var exchange = marketExchanges[i];
			var exchangeHandler = IDEX.allExchanges[exchange];
			var exSubHandler = exchangeHandler[exchangeUpdaterKey];
			dfds.push(exSubHandler[exchangeUpdaterMethod](market, forceUpdate));
		}
		
		if (!dfds.length)
		{
			dfds.push(new $.Deferred());
			dfds[0].resolve();
		}
		
		$.when.apply($, dfds).done(function()
		{
			retDFD.resolve();
		})
		
		return retDFD.promise();
	}
	
	
	
	IDEX.MMarketHistoryHandler = function(market) 
	{	
		var mMarketHistoryHandler = this;
		mMarketHistoryHandler.market = market;
		mMarketHistoryHandler.handlerType = "market";
		
		mMarketHistoryHandler.isUpdating = false;
		mMarketHistoryHandler.postDFD = false;
		mMarketHistoryHandler.exchangeUpdaterKey = "marketTrades";
		mMarketHistoryHandler.exchangeUpdaterMethod = "getMarketTrades";
		
		mMarketHistoryHandler.marketHistoryByExchange = {};
		mMarketHistoryHandler.marketHistory = [];
	};
	
	


	IDEX.MMarketHistoryHandler.prototype.update = function(forceUpdate)
	{
		var mMarketHistoryHandler = this;
		mMarketHistoryHandler.postDFD = new $.Deferred();
		var market = mMarketHistoryHandler.market;
		var marketExchanges = market.exchanges;

		mMarketHistoryHandler.updateExchanges(forceUpdate, marketExchanges).done(function()
		{
			//var exchangeMarketHistory = exMarketHistoryHandler.markets[market.pairID].trades.slice();
			//exchangeHandlerReturns[exchange] = exchangeMarketHistory;
			mMarketHistoryHandler.marketHistoryByExchange = exchangeHandlerReturns;
			mMarketHistoryHandler.marketHistory = [];

			for (key in exchangeHandlerReturns)
			{
				var exchangeMarketHistory = exchangeHandlerReturns[key];
				mMarketHistoryHandler.marketHistory = mMarketHistoryHandler.marketHistory.concat(exchangeMarketHistory);
			}
			
			mMarketHistoryHandler.marketHistory.sort(IDEX.compareProp('timestamp')).reverse();
			mMarketHistoryHandler.postDFD.resolve();
		})
		
				
		return mMarketHistoryHandler.postDFD.promise();
	}
	
	
	
	IDEX.MMarketHistoryHandler.prototype.updateExchanges = IDEX.CMHandler;
	

	
	IDEX.MTradeHistoryHandler = function(market) 
	{	
		var mTradeHistoryHandler = this;
		mTradeHistoryHandler.market = market;
		mTradeHistoryHandler.handlerType = "market";
		
		mTradeHistoryHandler.postDFD = false;
		mTradeHistoryHandler.exchangeUpdaterKey = "accountTrades";
		mTradeHistoryHandler.exchangeUpdaterMethod = "updateTrades";
		
		mTradeHistoryHandler.tradeHistory = [];
	};
	

	
	IDEX.MTradeHistoryHandler.prototype.update = function(forceUpdate, filterExchanges)
	{
		var mTradeHistoryHandler = this;
		var market = mTradeHistoryHandler.market;
		var marketExchanges = market.exchanges;
		mTradeHistoryHandler.postDFD = new $.Deferred();
		filterExchanges = typeof filterExchanges == "undefined" ? [] : filterExchanges;
		var exchangesToUpdate = filterExchanges.length ? filterExchanges : marketExchanges;


		mTradeHistoryHandler.updateExchanges(forceUpdate, marketExchanges).done(function()
		{
			mTradeHistoryHandler.tradeHistory = [];
			
			mTradeHistoryHandler.postDFD.resolve();
		})

		
		
		return mTradeHistoryHandler.postDFD.promise();
	}
	
	
	IDEX.MTradeHistoryHandler.prototype.updateExchanges = IDEX.CMHandler;

	

	

	return IDEX;
	
	
}(IDEX || {}, jQuery));
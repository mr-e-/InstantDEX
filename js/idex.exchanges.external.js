

var IDEX = (function(IDEX, $, undefined)
{
	

	
	var Exchange = IDEX.Exchange = function()
	{
		this.init.apply(this, arguments)
	}
	
	Exchange.prototype = 
	{	
		init: function(exchangeName)
		{
			var exchange = this;
			exchange.exchangeName = exchangeName;
			exchange.balances = new IDEX.Exchange.Balances(exchange);
			exchange.marketTrades = new IDEX.Exchange.MarketTrades(exchange);

			exchange.markets = [];
						
		},
		
		
		initState: function()
		{
			var dfd = new $.Deferred();
			var exchange = this;

			dfd.resolve();
			
			
			return dfd.promise();
		},
		
		
	}
	
	
	var Balances = Exchange.Balances = function()
	{
		this.init.apply(this, arguments)
	}
	
	Balances.prototype = 
	{
		init: function(exchange)
		{
			var balancesHandler = this;
			balancesHandler.exchange = exchange;
			
			//balancesHandler.updater = new IDEX.Updater();
			balancesHandler.balancesLastUpdated = new Date().getTime();
			balancesHandler.balances = {};
			balancesHandler.oneTime = false;
			balancesHandler.asyncDFD = false;

		},
		
		
		getBalance: function(coinName)
		{
			var balancesHandler = this;
			var balances = balancesHandler.balances;
			var exchange = balancesHandler.exchange;
			var balance = {};
			
			if (coinName in balances)
			{
				balance = balances[coinName];
			}
			else
			{
				balance.exchange = exchange.exchangeName;
				balance.available = 0;
				balance.unavailable = 0;
				balance.total = 0;
			}

			return balance;
		},
		
		
		

		updateBalances: function(forceUpdate)
		{
			var balancesHandler = this;			
			var dfd = new $.Deferred();
			var time = new Date().getTime()

			var exchange = balancesHandler.exchange;
			var exchangeName = exchange.exchangeName;
			
			var params = {"method":"balance","exchange":exchangeName};			

			
					
			if (!forceUpdate && time - this.balancesLastUpdated < 2000)
			{
				dfd.resolve([]);
			}
			else
			{
				//console.log(params);
				
				IDEX.sendPost(params, false).done(function(data)
				{					
					var balances = normalizeBalances(data, exchangeName);
					balancesHandler.balances = balances; 
					dfd.resolve();

				})
			}

			balancesHandler.balancesLastUpdated = time;

			return dfd.promise();
		}
	}
	
	var MarketTrades = Exchange.MarketTrades = function()
	{
		this.init.apply(this, arguments)
	}
	
	
	MarketTrades.prototype = 
	{
		
		init: function(exchange)
		{
			var tradesHandler = this;
			
			tradesHandler.exchange = exchange;
			tradesHandler.markets = {};
		
			
		},
		
	
		getMarketTrades: function(market, forceUpdate)
		{
			var tradesHandler = this;
			var exchange = tradesHandler.exchange;
			var exchangeName = exchange.exchangeName;
			var dfd = new $.Deferred();
			var time = new Date().getTime()
			var lastUpdated = tradesHandler.marketHistoryLastUpdated;
		
			
			if (!(market.pairID in tradesHandler.markets))
			{
				var tradesHandlerMarket = tradesHandler.markets[market.pairID] = {};
				tradesHandlerMarket.lastUpdated = -1;
				tradesHandlerMarket.trades = [];
			}
			else
			{
				var tradesHandlerMarket = tradesHandler.markets[market.pairID];
			}
			
		
			if (!forceUpdate && ((time - tradesHandlerMarket.lastUpdated < 30000) && (tradesHandlerMarket.lastUpdated != -1)))
			{
				dfd.resolve();
			}
			else
			{
				var params = {}
				params.key = "beta_test";

				var format = {};
				format.rnum = 30;
				format.sort = "des";
				
				var query = {};
				query.section = "dat";
				query.segment = "qts";
				query.target = "qts_tck";
				query.params = {};
				query.params.exchange = exchangeName;
				query.params.source = "crypto";
				query.params.symbol = IDEX.flipCheckMarket(market, exchangeName);
				params.format = format;
				params.query = query;
			
				IDEX.sendSkynetPost(params).done(function(data)
				{
					var trades = data.results;
					
					var formattedTrades = [];
					
					for (var i = 0; i < trades.length; i++)
					{
						var trade = trades[i];
						var formattedTrade = {};
						
						var timestamp = trade.timestamp;
						var price = trade.price;
						var amount = trade.amount;
						var volume = trade.volume;
						var tradeType = "bid";
						
						formattedTrade.timestamp = timestamp;
						formattedTrade.price = price;
						formattedTrade.amount = amount;
						formattedTrade.exchange = exchangeName;
						formattedTrade.tradeType = tradeType;
						
						formattedTrades.push(formattedTrade);
					}
					
					tradesHandlerMarket.trades = formattedTrades;
					
					dfd.resolve(formattedTrades);
				})
			}
			
			
			tradesHandlerMarket.lastUpdated = time;
			
			return dfd.promise();
		},
		
	}
		
	function normalizeBalances(rawBalances, exchangeName)
	{
		var balances = {};
		
		if (exchangeName == "poloniex")
		{
			for (key in rawBalances)
			{
				var balance = {};
				var rawBalance = rawBalances[key];
				
				balance.available = rawBalance.available;
				balance.unavailable = rawBalance.onOrders;
				balance.total = IDEX.toSatoshi(Number(balance.available) + Number(balance.unavailable));
				balances.name = key;
				balance.exchange = exchangeName;

				balances[key] = balance;
			}
		}
		else if (exchangeName == "bittrex")
		{
			var result = rawBalances.result;
			
			for (var i = 0; i < result.length; i++)
			{
				var rawBalance = result[i];
				var balance = {};
				balance.available = rawBalance.Available;
				balance.total = rawBalance.Balance
				balance.unavailable = IDEX.toSatoshi(balance.total - balance.available);
				balances.name = rawBalance.Currency;
				balance.exchange = exchangeName;
				
				balances[rawBalance.Currency] = balance;
			}
		}
		
		return balances;
	}

	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


	
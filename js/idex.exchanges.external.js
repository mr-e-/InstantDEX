

var IDEX = (function(IDEX, $, undefined)
{
	

	
	var Exchange = IDEX.Exchange = function()
	{
		this.init.apply(this, arguments)
	}
	
	Exchange.prototype = 
	{	
		init: function()
		{
			var exchange = this;
			exchange.balances = new IDEX.Exchange.Balances(exchange);

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
		
		
		getBalance: function(assetID, isNxt)
		{
			var balancesHandler = this;
			var balance = {};


			return balance;
		},
		
		
		

		updateBalances: function(forceUpdate)
		{
			var balancesHandler = this;			
			var dfd = new $.Deferred();

			dfd.resolve();
			
			return dfd.promise();
		}
	}
		

	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


	


var IDEX = (function(IDEX, $, undefined) 
{
	
	var $contentWrap = $("#content_wrap");

	IDEX.allCBalances = [];
	
	
	
	
	IDEX.BalanceCoin = function(coin) 
	{	
		var balanceCoin = this;
		balanceCoin.coin = coin;
		
		balanceCoin.lastUpdated = -1;
		balanceCoin.isUpdating = false;
		balanceCoin.xhr = false;
		balanceCoin.postDFD = false;
		
		balanceCoin.balance = [];
	};
	
	
	IDEX.BalanceCoin.prototype.update = function(forceUpdate)
	{
		var balanceCoin = this;
		balanceCoin.postDFD = new $.Deferred();
		var coin = balanceCoin.coin;
		var time = new Date().getTime();
		var lastUpdatedTime = balanceCoin.lastUpdated;
		var dfds = [];

		
		forceUpdate = typeof forceUpdate == "undefined" ? false : forceUpdate;
		
		if (!forceUpdate && ((time - lastUpdatedTime < 10000) && (lastUpdatedTime != -1)))
		{
			//balanceCoin.postDFD.resolve();
		}
		else
		{
			var coinExchanges = coin.exchanges;
			balanceCoin.isUpdating = true;

			for (var i = 0; i < coinExchanges.length; i++)
			{
				var exchange = coinExchanges[i];
				var dfd = new $.Deferred();
				dfds.push(dfd);
				
				(function(exchange, dfd)
				{
					var isActiveExchange = !(IDEX.activeExchanges.indexOf(exchange) == -1);

					var exchangeHandler = IDEX.allExchanges[exchange];
					exchangeHandler = exchange == "InstantDEX" ? IDEX.allExchanges["nxtae"] : exchangeHandler;
					var balancesHandler = exchangeHandler.balances;
						
					balancesHandler.updateBalances().done(function()
					{
						dfd.resolve();
					});
					
				})(exchange, dfd)
			}
		}
		
		
		if (!dfds.length)
		{
			dfds.push(new $.Deferred());
			dfds[0].resolve();
		}
		
		$.when.apply($, dfds).done(function(data)
		{
			balanceCoin.balance = [];

			for (var i = 0; i < coinExchanges.length; i++)
			{
				var exchange = coinExchanges[i];
				var exchangeHandler = IDEX.allExchanges[exchange];
				exchangeHandler = exchange == "InstantDEX" ? IDEX.allExchanges["nxtae"] : exchangeHandler;
				var balancesHandler = exchangeHandler.balances;
				
				var isNxt = coin.isAsset == false && coin.name == "NXT";
				var bal = {};
				
				if (isNxt)
				{
					bal = balancesHandler.getBalance(false, isNxt)
				}
				else if ("assetID" in coin)
				{
					bal = balancesHandler.getBalance(coin.assetID);
				}
				else
				{
					bal = balancesHandler.getBalance(coin.name);
				}
				
				balanceCoin.balance.push(bal);

			}
			
			balanceCoin.isUpdating = false;
			balanceCoin.postDFD.resolve();
		})
		
		
		balanceCoin.lastUpdated = time;
		
		return balanceCoin.postDFD.promise();
	}
	
	
	
	
	
	IDEX.CBalance = function(obj) 
	{	
		this.hasMarket = false;
		
		this.cBalanceDom;
		this.searchInputDom;
		this.baseSec;
		this.relSec;

		this.cellHandler;

		IDEX.constructFromObject(this, obj);
	};
	
	
	IDEX.CBalanceType = function(type, $cBalanceDom, cBalance) 
	{	
		this.cBalance = cBalance;
		this.dom;
		this.type = type;
		this.balanceTitleDom;
		//this.balanceValDom
		this.tableDom;


		var __construct = function(that, type, $cBalanceDom)
		{
			that.dom = $cBalanceDom.find(".cm-balances-" + type);
			that.balanceTitleDom = that.dom.find(".cm-balances-sing-title span");
			//that.balanceValDom = that.dom.find(".orderbox-balance-val span");
			that.tableDom = that.dom.find(".cm-balances-sing-table");
			
			that.tableDom.parent().perfectScrollbar();

		}(this, type, $cBalanceDom)
	};
		
		
	
	
	IDEX.newCBalance = function($el, cellHandler)
	{
		var cBalance = IDEX.getObjectByElement($el, IDEX.allCBalances, "cBalanceDom");

		if (!cBalance)
		{
			cBalance = new IDEX.CBalance();
			cBalance.cellHandler = cellHandler;

			cBalance.cBalanceDom = $el;
			cBalance.searchInputDom = $el.find(".cm-balances-search-wrap input");
			cBalance.refreshDom = $el.find(".refresh-wrap img");

			cBalance.baseSec = new IDEX.CBalanceType("base", cBalance.cBalanceDom, cBalance);
			cBalance.relSec = new IDEX.CBalanceType("rel", cBalance.cBalanceDom, cBalance);
			cBalance.refreshDom.on("click", function(){ cBalance.refreshClick() });
			
			
			//orderbook.buyBookDom.perfectScrollbar();
			//orderbook.sellBookDom.perfectScrollbar();
			
			IDEX.allCBalances.push(cBalance)

		}
		

				
		return cBalance;
	};
	
	
	IDEX.CBalance.prototype.changeMarket = function(market)
	{
		var cBalance = this;
		
		cBalance.hasMarket = true;
		cBalance.market = market;
		
		cBalance.updateMarketDOM();
		cBalance.updateBalances();

	}
	
	
	IDEX.CBalance.prototype.updateMarketDOM = function()
	{
		var cBalance = this;
		cBalance.searchInputDom.val(cBalance.market.marketName);
		cBalance.baseSec.balanceTitleDom.text(cBalance.market.base.name);
		cBalance.relSec.balanceTitleDom.text(cBalance.market.rel.name);
		
	}
	
	
	IDEX.CBalance.prototype.updateBalances = function()
	{
		var cBalance = this;
		
		if (cBalance.hasMarket)
		{
			
			cBalance.baseSec.updateBalance();
			cBalance.relSec.updateBalance();
		}
	}
	
	
	IDEX.CBalance.prototype.refreshClick = function()
	{
		var cBalance = this;
		
		console.log(cBalance);

	}
	
	IDEX.CBalanceType.prototype.updateBalance = function()
	{
		var cBalanceType = this;
		var isBase = cBalanceType.type == "base";
		var cBalance = cBalanceType.cBalance;
		var market = cBalance.market;
		
		var baseOrRel = isBase ? market.base : market.rel;
		
		/*baseOrRel.balanceHandler.update().done(function()
		{
			console.log(baseOrRel);
		})*/
		//cBalanceType.balanceTitleDom.html(baseOrRel.name + ":&nbsp;");

		var marketExchanges = baseOrRel.exchanges;
		cBalanceType.tableDom.find("tbody").empty();
		
		for (var i = 0; i < marketExchanges.length; i++)
		{
			var exchange = marketExchanges[i];
			(function(exchange)
			{
				if (exchange == "InstantDEX" || exchange == "nxtae")
				{
					var exchangeHandler = IDEX.allExchanges[exchange];
					exchangeHandler = exchange == "InstantDEX" ? IDEX.allExchanges["nxtae"] : exchangeHandler;

					var balancesHandler = exchangeHandler.balances;

					balancesHandler.updateBalances().done(function()
					{
						var isNxt = baseOrRel.isAsset == false && baseOrRel.name == "NXT";
						var bal = {};
						var parsedBal = {};
						
						if (isNxt)
						{
							bal = balancesHandler.getBalance(false, isNxt)
						}
						else if ("assetID" in baseOrRel)
						{
							bal = balancesHandler.getBalance(baseOrRel.assetID);
						}
						else
						{
							
						}
						
						parsedBal = parseBalance(bal);

						//console.log(bal);
						cBalanceType.addTableRow(bal, exchange);
						//orderboxType.balanceValDom.text(bal.whole + bal.dec);			
					})
				}
				else
				{
					if (IDEX.activeExchanges.indexOf(exchange) == -1)
						return;
					var exchangeHandler = IDEX.allExchanges[exchange];
					var balancesHandler = exchangeHandler.balances;
					balancesHandler.updateBalances().done(function()
					{

						var bal = balancesHandler.getBalance(baseOrRel.name);
						//console.log(balancesHandler);
						cBalanceType.addTableRow(bal, exchange);
						//orderboxType.balanceValDom.text(bal.whole + bal.dec);			
					})
				}
			})(exchange)
		}
	}
	

	
	IDEX.CBalanceType.prototype.addTableRow = function(balance, exchange)
	{
		var cBalanceType = this;
		
		if (exchange == "nxtae")
		{
			var total = balance.availableBalance;
			var available = balance.unconfirmedBalance;
			var unavailable = IDEX.toSatoshi(Number(total) - Number(available));
			
			var tr = "<tr><td>"+exchange+"</td><td>"+String(unavailable)+"</td><td>"+String(available)+"</td><td>"+String(total)+"</td></tr>";
		}
		else
		{
			var total = balance.total;
			var available = balance.available;
			var unavailable = balance.unavailable;
			
			var tr = "<tr><td>"+exchange+"</td><td>"+String(unavailable)+"</td><td>"+String(available)+"</td><td>"+String(total)+"</td></tr>";
		}
		cBalanceType.tableDom.find("tbody").append($(tr));

	}
	
	function parseBalance(balance)
	{
		var obj = {};
		obj.whole = "0";
		obj.dec = ".0";
		
		if (!($.isEmptyObject(balance)))
		{
			var amount = String(balance.unconfirmedBalance);
			var both = amount.split(".");
			
			obj.whole = both[0];
			if (both.length > 1)
				obj.dec	= "." + both[1];
		}	
		
		return obj;
	}
	
	
	
	IDEX.refreshAllBalances = function()
	{
		
	}
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

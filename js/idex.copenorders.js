

var IDEX = (function(IDEX, $, undefined) 
{
	
	var $contentWrap = $("#content_wrap");

	
	IDEX.allCOpenOrders = [];
	
	
	IDEX.COpenOrder = function(obj) 
	{	
		this.hasMarket = false;
		
		this.cOpenOrderDom;
		this.searchInputDom;
		this.tableDom;
		this.cellHandler;
		

		IDEX.constructFromObject(this, obj);
	};
	
	
	/*IDEX.CBalanceType = function(type, $cBalanceDom, cBalance) 
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

		}(this, type, $cBalanceDom)
	};*/
		
		
	
	
	IDEX.newCOpenOrder = function($el, cellHandler)
	{
		var cOpenOrder = IDEX.getObjectByElement($el, IDEX.allCOpenOrders, "cOpenOrderDom");

		if (!cOpenOrder)
		{
			cOpenOrder = new IDEX.COpenOrder();
			cOpenOrder.cellHandler = cellHandler;

			cOpenOrder.cOpenOrderDom = $el;
			cOpenOrder.searchInputDom = $el.find(".cm-openorders-search-wrap input");
			cOpenOrder.tableDom = cOpenOrder.cOpenOrderDom.find(".cm-openorders-table");

			cOpenOrder.tableDom.parent().perfectScrollbar();
			
			IDEX.allCOpenOrders.push(cOpenOrder);
		}
		

				
		return cOpenOrder;
	};
	
	
	
	IDEX.COpenOrder.prototype.changeMarket = function(market)
	{
		var cOpenOrder = this;
		
		cOpenOrder.hasMarket = true;
		cOpenOrder.market = market;
		
		cOpenOrder.updateMarketDOM();
		cOpenOrder.updateOrders();

	}
	
	
	IDEX.COpenOrder.prototype.updateMarketDOM = function()
	{
		var cOpenOrder = this;
		cOpenOrder.searchInputDom.val(cOpenOrder.market.marketName);

	}
	
	
	$contentWrap.on("click", ".cm-openorders-search-popup-trig", function()
	{
		var $el = $(this).closest(".cm-openorders-wrap");
		var cOpenOrder = IDEX.getObjectByElement($el, IDEX.allCOpenOrders, "cOpenOrderDom");

		cOpenOrder.updateOrders();
	})
	
	
	
	IDEX.COpenOrder.prototype.updateOrders = function()
	{
		var cOpenOrder = this;
		
		if (cOpenOrder.hasMarket)
		{
			var market = cOpenOrder.market;
			var marketExchanges = market.exchanges;
			
			cOpenOrder.tableDom.find("tbody").empty();
			
			for (var i = 0; i < marketExchanges.length; i++)
			{
				var exchange = marketExchanges[i];
				
				if (exchange == "InstantDEX" || exchange == "nxtae")
				{
					var exchangeHandler = IDEX.allExchanges[exchange];
					exchangeHandler = exchange == "InstantDEX" ? IDEX.allExchanges["nxtae"] : exchangeHandler;

					var openOrdersHandler = exchangeHandler.accountOpenOrders;

					openOrdersHandler.updateOpenOrders(market).done(function(openOrders)
					{
						//var openOrders = openOrdersHandler.openOrders;
						console.log(openOrders);
						for (var j = 0; j < openOrders.length; j++)
						{
							var openOrder = openOrders[j];
							cOpenOrder.addTableRow(openOrder);
						}						

					})
				}
				else
				{
					continue;
					
					var exchangeHandler = IDEX.allExchanges[exchange];
					var openOrdersHandler = exchangeHandler.accountOpenOrders;
					
					openOrdersHandler.updateOpenOrders().done(function()
					{
			
					})
				}
			}
		}
	}
	
	


	IDEX.COpenOrder.prototype.addTableRow = function(openOrder)
	{
		var cOpenOrder = this;
		//var time = openOrder.timestamp;
		var price = openOrder.price;
		var amount = openOrder.amount;
		var exchange = openOrder.exchange;
		var tradeType = openOrder.tradeType;
		var total = openOrder.total;
		var status = openOrder.status;
		
		var map = tradeType == "bid" ? "buy" : "sell";
		var tradeClass = "cm-orderType-" + map;
		
		var tr = "<tr><td>"+tradeType+"</td><td>"+String(price)+"</td><td>"+String(amount)+"</td><td>"+String(total)+"</td><td>"+String(exchange)+"</td><td>"+String(status)+"</td></tr>";
		
		var $tr = $(tr);
		$tr.find("td").eq(0).addClass(tradeClass);
		
		cOpenOrder.tableDom.find("tbody").append($tr);

	}
	
	
	
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

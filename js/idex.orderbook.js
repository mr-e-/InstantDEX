

var IDEX = (function(IDEX, $, undefined)
{
	IDEX.OK = 0;
	IDEX.AJAX_FAILED = 1;
	IDEX.TIMEOUT_CLEARED = 2;
	IDEX.AJAX_ABORT = 3;
	
	IDEX.allOrderbooks = [];
	
	
	
	IDEX.OrderbookVar = function(obj) 
	{	
		this.nxtRS = "";
		this.pair = "";
		this.orderbookID = "";
		this.baseAsset = "";
		this.relAsset = "";
		
		this.asks = [];
		this.bids = [];

		IDEX.constructFromObject(this, obj);
	};
	
	
	IDEX.Orderbook = function(obj) 
	{	
		this.isStoppingOrderbook = false;
		this.isWaitingForOrderbook = false;
		this.orderbookTimeout;
		this.timeoutDFD = false;
		this.xhr = false;
		
		this.orderbookDom;
		this.searchInputDom;
		this.lastUpdatedDom;
		this.buyBookDom;
		this.emptyBuyBookDom;
		this.sellBookDom;
		this.emptyBuyBookDom;
		
		this.baseAsset = {};
		this.relAsset = {};
		
		this.currentOrderbook;
		this.newOrderbook;

		this.groupedBids = {};
		this.groupedAsks = {};
		
		this.labels = [];
		
		this.orderbox;

		IDEX.constructFromObject(this, obj);
	};
	
	
	
	IDEX.newOrderbook = function($el)
	{
		var orderbook = IDEX.getObjectByElement($el, IDEX.allOrderbooks, "orderbookDom");
		var orderbox = IDEX.getObjectByElement($el, IDEX.allOrderboxes, "orderboxDom");

		if (!orderbook)
		{
			orderbook = new IDEX.Orderbook();

			orderbook.orderbookDom = $el;
			orderbook.buyBookDom = $el.find(".bookname-buybook");
			orderbook.emptyBuyBookDom = orderbook.buyBookDom.find(".empty-orderbook");
			orderbook.sellBookDom = $el.find(".bookname-sellbook");
			orderbook.emptySellBookDom = orderbook.sellBookDom.find(".empty-orderbook");
			orderbook.searchInputDom = $el.find(".orderbook-search-wrap input");
			orderbook.lastUpdatedDom = $el.find(".orderbook-lastUpdated");

			orderbook.buyBookDom.perfectScrollbar();
			orderbook.sellBookDom.perfectScrollbar();
			IDEX.allOrderbooks.push(orderbook)
			
			orderbook.initLabelsDom();
		}
		if (!orderbox)
		{
			var $orderbox = $el.find(".orderbox-all")
			var orderbox = IDEX.newOrderbox($orderbox)
			orderbook.orderbox = orderbox;
		}
		

		orderbook.currentOrderbook = new IDEX.OrderbookVar();
				
		return orderbook;
	};
	
	
	
	IDEX.Orderbook.prototype.initLabelsDom = function()
	{
		var orderbook = this;
		
		for (var i = 0; i < IDEX.user.labels.length; i++)
		{
			var label = IDEX.user.labels[i];
			var name = label.name;
			
			var li = "<li data-val='"+name+"'>"+name+"</li>"
			orderbook.orderbookDom.find(".orderbook-label-dropdown ul").append($(li))
		}
	}
	
	IDEX.Orderbook.prototype.updateMarketDom = function()
	{
		var orderbook = this;
		var base = orderbook.baseAsset;
		var rel = orderbook.relAsset;
		
		orderbook.searchInputDom.val(base.name + "_" + rel.name);
		
		orderbook.orderbookDom.find(".refcur-base").text(base.name);
		orderbook.orderbookDom.find(".refcur-rel").text(rel.name);
	}
	
	
	
	IDEX.Orderbook.prototype.changeMarket = function(base, rel)
	{
		var orderbook = this;
		
		orderbook.baseAsset = base;
		orderbook.relAsset = rel;
		
		orderbook.emptyOrderbook("Loading...");
		orderbook.updateMarketDom();
		
		orderbook.orderbox.changeMarket(base, rel);
		
		if (!orderbook.isStoppingOrderbook)
		{
			orderbook.stopPollingOrderbook(function()
			{
				orderbook.orderbookDom.find(".empty-orderbook").hide();
				orderbook.orderbookHandler(1);
			});
		}
	}
	
	/*IDEX.unloadMarket = function()
	{
		IDEX.user.clearPair();
		IDEX.clearOrderBox();
		
		var $pairdom = $(".curr-pair")
		var market = "No market loaded"
		$pairdom.find("span").empty().text(market)
	}*/
	
	
	
	IDEX.Orderbook.prototype.refreshOrderbook = function()
	{
		if (!this.isWaitingForOrderbook)
		{
			//console.log('refreshing orderbook')
			this.clearTimeout();
			this.orderbookHandler(1);
		}
	}

	
	IDEX.Orderbook.prototype.stopPollingOrderbook = function(callback)
	{
		var thisScope = this;
		
		if (this.isWaitingForOrderbook) 
		{
			//this.xhr.abort();
			this.isStoppingOrderbook = true;
			
			setTimeout(function()
			{ 
				thisScope.stopPollingOrderbook(callback);
			}, 100);
			
			return false;
		}
		
		this.clearTimeout();
		this.isStoppingOrderbook = false;
		
		if (callback)
			callback();
	}
	

	
	
	IDEX.removeOrderbook = function($orderbook)
	{
		var orderbook = false;
		
		for (var i = 0; i < IDEX.allOrderbooks.length; i++)
		{
			var loopOrderbook = IDEX.allOrderbooks[i];
			var $loopOrderbook = loopOrderbook.orderbookDom
						
			if ($orderbook.is($loopOrderbook))
			{
				orderbook = loopOrderbook;
				break;
			}
		}
		
		//console.log(orderbook);
		
		if (orderbook)
		{
			orderbook.stopPollingOrderbook();
			IDEX.allOrderbooks.splice(i, 1);
		}
	}
	
	
	IDEX.Orderbook.prototype.orderbookHandler = function(timeout)
	{
		var orderbook = this;
		
		this.getOrderbookData(timeout).done(function(orderbookData, errorLevel)
		{
			timeout = 5000;
			
			if (errorLevel == IDEX.TIMEOUT_CLEARED)
			{
				return;
			}
			else if (errorLevel == IDEX.AJAX_ABORT)
			{
				return;
			}
			else if (errorLevel == IDEX.AJAX_ERROR)
			{
				orderbook.orderbookDom.find(".empty-orderbook").hide();
				orderbook.emptyOrderbook("Error loading orderbook");
				
				//$(".empty-orderbook").hide();
				//$("#buyBook .twrap").empty();
				//$("#sellBook .twrap").empty();
				
				//IDEX.unloadMarket()
			}
			else
			{
				//orderbookData = new IDEX.OrderbookVar(orderbookData);
				if ($.isEmptyObject(orderbookData))
				{
					orderbook.currentOrderbook = new IDEX.OrderbookVar(orderbookData);
					orderbook.emptyOrderbook();
					orderbook.orderbookDom.find(".empty-orderbook").show();
					orderbook.updateScrollbar(false);
				}
				else
				{
					orderbook.formatOrderbookData(orderbookData);
					orderbook.updateOrders(orderbook.buyBookDom.find(".twrap"), orderbook.groupedBids);
					orderbook.updateOrders(orderbook.sellBookDom.find(".twrap"), orderbook.groupedAsks);
					
					orderbook.updateLastPrice(orderbookData);
					orderbook.animateOrderbook();
					orderbook.currentOrderbook = new IDEX.OrderbookVar(orderbookData);
				}
				if (!(orderbook.isStoppingOrderbook))
					orderbook.orderbookHandler(timeout);
			}
			
		})
	}
	

	
	return IDEX;
	
}(IDEX || {}, jQuery));
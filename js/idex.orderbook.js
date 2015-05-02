

var IDEX = (function(IDEX, $, undefined)
{
	IDEX.OK = 0;
	IDEX.AJAX_FAILED = 1;
	IDEX.TIMEOUT_CLEARED = 2;
	IDEX.AJAX_ABORT = 3;
	
	
	IDEX.Orderbook.prototype.loadNewOrderbook = function(base, rel)
	{
		this.baseAsset = base;
		this.relAsset = rel;
		this.currentOrderbook = new IDEX.OrderbookVar();
		this.emptyOrderbook("Loading...");
		IDEX.updateScrollbar(false);
		var thisScope = this;
		
		if (!this.isStoppingOrderbook)
		{
			this.stopPollingOrderbook(function()
			{
				$(".empty-orderbook").hide();
				thisScope.orderbookHandler(1);
			});
		}
	}
	
	
	IDEX.Orderbook.prototype.refreshOrderbook = function()
	{
		if (!this.isWaitingForOrderbook)
		{
			console.log('a')
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
			//console.log('abort2')
			this.isStoppingOrderbook = true;
			setTimeout(function()
			{ 
				thisScope.stopPollingOrderbook(callback)
			}, 100);
			return false;
		}
		
		this.clearTimeout();
		this.isStoppingOrderbook = false;
		callback();
	}
	
	
	IDEX.Orderbook.prototype.orderbookHandler = function(timeout)
	{
		var orderbook = this;
		
		this.getOrderbookData(timeout).done(function(orderbookData, errorLevel)
		{
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
				$(".empty-orderbook").hide();
				orderbook.emptyOrderbook("Error loading orderbook");
			}
			else
			{
				//orderbookData = new IDEX.OrderbookVar(orderbookData);
				if ($.isEmptyObject(orderbookData))
				{
					IDEX.updateScrollbar(false);
					$("#currLast .order-text").text("0.0");
					$(".twrap").empty();
					$(".empty-orderbook").show();
					orderbook.currentOrderbook = new IDEX.Orderbook(orderbookData);
				}
				else
				{
					orderbook.formatOrderbookData(orderbookData);
					orderbook.updateOrders($("#buyBook .twrap"), orderbook.groupedBids);
					orderbook.updateOrders($("#sellBook .twrap"), orderbook.groupedAsks);
					
					orderbook.updateLastPrice(orderbookData);
					orderbook.animateOrderbook();
					orderbook.currentOrderbook = new IDEX.Orderbook(orderbookData);
				}
			}
			
			timeout = 5000;
			if (!orderbook.isStoppingOrderbook)
				orderbook.orderbookHandler(timeout);
		})
	}
	

	
	return IDEX;
	
}(IDEX || {}, jQuery));
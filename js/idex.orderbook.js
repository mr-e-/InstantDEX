

var IDEX = (function(IDEX, $, undefined)
{
	IDEX.OK = 0;
	IDEX.AJAX_FAILED = 1;
	IDEX.TIMEOUT_CLEARED = 2;
	
	
	IDEX.Orderbook.prototype.loadNewOrderbook = function()
	{
		this.currentOrderbook = new IDEX.OrderbookVar();
		this.emptyOrderbook(IDEX.user.curBase.name, IDEX.user.curRel.name, "Loading...");
		var orderbook = this;
		IDEX.updateScrollbar(false);

		this.stopPollingOrderbook(function()
		{
			$(".empty-orderbook").hide();
			//orderbook.isPollingOrderbook = true;
			orderbook.orderbookHandler(1);
		});
	}
	
	
	IDEX.Orderbook.prototype.refreshOrderbook = function()
	{
		if (!orderbookAsync)
		{
			clearTimeout(orderbookTimeout);
			//orderbook.isStoppingOrderbook = false;
			pollOrderbook(1);
		}
	}

	
	IDEX.Orderbook.prototype.stopPollingOrderbook = function(callback)
	{
		if (this.isWaitingForOrderbook) 
		{
			this.isStoppingOrderbook = true;
			setTimeout(this.stopPollingOrderbook, 100);
			return false;
		}
		
		this.clearTimeout();
		this.isStoppingOrderbook = false;
		callback();
	}
	
	
	IDEX.Orderbook.prototype.orderbookHandler = function(timeout)
	{
		var orderbook = this;
		
		this.getOrderbookData(timeout).done(function(errorLevel, orderbookData)
		{
			console.log('c');
			if (errorLevel == IDEX.TIMEOUT_CLEARED)
			{
				
			}
			else if (errorLevel == IDEX.AJAX_ERROR)
			{
				$(".empty-orderbook").hide();
				orderbook.emptyOrderbook(IDEX.user.curBase.name, IDEX.user.curRel.name, "Error loading orderbook");
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
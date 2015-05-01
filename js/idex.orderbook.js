

var IDEX = (function(IDEX, $, undefined)
{
	IDEX.OK = 0;
	IDEX.AJAX_FAILED = 1;
	IDEX.TIMEOUT_CLEARED = 2;
	
	
	IDEX.Orderbook.prototype.loadNewOrderbook = function()
	{
		this.currentOrderbook = new IDEX.OrderbookVar();
		emptyOrderbook(IDEX.user.curBase.name, IDEX.user.curRel.name, "Loading...");
		IDEX.updateScrollbar(false);

		stopPollingOrderbook(function()
		{
			$(".empty-orderbook").hide();
			pollOrderbook(1);
		});
	}
	
	
	IDEX.Orderbook.prototype.refreshOrderbook = function()
	{
		if (!orderbookAsync)
		{
			clearTimeout(orderbookTimeout);
			pollOrderbook(1);
		}
	}

	
	IDEX.Orderbook.prototype.stopPollingOrderbook = function()
	{
		if (orderbookAsync) 
		{
			isStoppingOrderbook = true;
			setTimeout(IDEX.stopPollingOrderbook, 100);
			return false;
		}
		
		clearTimeout(this.orderbookTimeout);
		isStoppingOrderbook = false;
	}
	
	
	IDEX.Orderbook.prototype.orderbookHandler = function(timeout)
	{
		while (this.isPollingOrderbook)
		{
			this.getOrderbookdata(timeout).done(function(orderbookData)
			{
				if (orderbookData == "wasCleared")
				{
					
				}
				else if (orderbookData == "wasError")
				{
					$(".empty-orderbook").hide();
					emptyOrderbook(IDEX.user.curBase.name+"/"+IDEX.user.curRel.name, "Error loading orderbook");
				}
				else
				{
					orderbookData = new IDEX.Orderbook(orderbookData);
					
					if (orderbookData.isEmpty)
					{
						IDEX.updateScrollbar(false);
						$("#currLast .order-text").text("0.0");
						$(".twrap").empty();
						$(".empty-orderbook").show();
					}
					else
					{
						formatOrderbookData(orderbookData);
						
						updateOrders($("#buyBook .twrap"), bidData);
						updateOrders($("#sellBook .twrap"), askData);
						
						updateLastPrice(orderbookData)
						animateOrderbook();
						IDEX.currentOrderbook = new IDEX.Orderbook(orderbookData);
					}
				}
			})
		}
	}
	

	
	return IDEX;
	
}(IDEX || {}, jQuery));
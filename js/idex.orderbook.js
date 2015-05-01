

var IDEX = (function(IDEX, $, undefined)
{

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

	
	function stopPollingOrderbook()
	{
		if (orderbookAsync) 
		{
			isStoppingOrderbook = true;
			setTimeout(IDEX.stopPollingOrderbook, 100);
			return false;
		}
		
		clearTimeout(orderbookTimeout);
		isStoppingOrderbook = false;
	}
	
	
	function orderbookHandler(timeout)
	{
		while (isPollingOrderbook)
		{
			getOrderbookdata(timeout).done(function(orderbookData)
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
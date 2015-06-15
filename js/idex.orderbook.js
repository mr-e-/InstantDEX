

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
			console.log('refreshing orderbook')
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
		callback();
	}
	
	
	IDEX.Orderbook.prototype.orderbookHandler = function(timeout)
	{
		var _this = this;
		
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
				$(".empty-orderbook").hide();
				_this.emptyOrderbook("Error loading orderbook");
			}
			else
			{
				//orderbookData = new IDEX.OrderbookVar(orderbookData);
				if ($.isEmptyObject(orderbookData))
				{
					_this.currentOrderbook = new IDEX.Orderbook(orderbookData);
					_this.emptyOrderbook();
					$(".empty-orderbook").show();
					IDEX.updateScrollbar(false);
				}
				else
				{
					_this.formatOrderbookData(orderbookData);
					_this.updateOrders($("#buyBook .twrap"), _this.groupedBids);
					_this.updateOrders($("#sellBook .twrap"), _this.groupedAsks);
					
					_this.updateLastPrice(orderbookData);
					_this.animateOrderbook();
					_this.currentOrderbook = new IDEX.Orderbook(orderbookData);
				}
				if (!(_this.isStoppingOrderbook))
					_this.orderbookHandler(timeout);
			}
			
		})
	}
	

	
	return IDEX;
	
}(IDEX || {}, jQuery));
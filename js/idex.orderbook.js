

var IDEX = (function(IDEX, $, undefined)
{
	IDEX.OK = 0;
	IDEX.AJAX_FAILED = 1;
	IDEX.TIMEOUT_CLEARED = 2;
	IDEX.AJAX_ABORT = 3;
	
	IDEX.allOrderbooks = [];
	
	
	IDEX.newOrderbook = function(base, rel, $el)
	{
		var orderbook = IDEX.getOrderbookByElement($el);
		
		console.log(orderbook);
		
		if (!orderbook)
		{
			orderbook = new IDEX.Orderbook();

			orderbook.orderbookDom = $el
			orderbook.buyBookDom = $el.find(".bookname-buybook");
			orderbook.sellBookDom = $el.find(".bookname-sellbook");
			IDEX.allOrderbooks.push(orderbook)
		}
		
		orderbook.baseAsset = base;
		orderbook.relAsset = rel;
		orderbook.currentOrderbook = new IDEX.OrderbookVar();
		orderbook.emptyOrderbook("Loading...");
		//IDEX.updateScrollbar(false);
			
		if (!orderbook.isStoppingOrderbook)
		{
			orderbook.stopPollingOrderbook(function()
			{
				$(".empty-orderbook").hide();
				orderbook.orderbookHandler(1);
			});
		}
	};
	
	
	
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
				_this.orderbookDom.find(".empty-orderbook").hide();
				_this.emptyOrderbook("Error loading orderbook");
				
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
					_this.currentOrderbook = new IDEX.Orderbook(orderbookData);
					_this.emptyOrderbook();
					_this.orderbookDom.find(".empty-orderbook").show();
					IDEX.updateScrollbar(false);
				}
				else
				{
					_this.formatOrderbookData(orderbookData);
					_this.updateOrders(_this.buyBookDom.find(".twrap"), _this.groupedBids);
					_this.updateOrders(_this.sellBookDom.find(".twrap"), _this.groupedAsks);
					
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


var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.Orderbook.prototype.getOrderbookData = function(timeout)
	{
		var retDFD = new $.Deferred();
		var orderbook = this;

		orderbook.counter = true;
		orderbook.lastUpdatedHandler(0);
		
		orderbook.orderbox.updateOrderBoxBalance();
		
		orderbook.setTimeout(timeout).then(function(wasCleared)
		{
			if (wasCleared)
			{
				orderbook.counter = false;
				orderbook.clearUpdatedTimeout()
				retDFD.resolve({}, IDEX.TIMEOUT_CLEARED);
			}
			else
			{
				orderbook.orderbookPost().done(function(orderbookData)
				{
					orderbook.orderbox.updateOrderBoxBalance();

					orderbook.counter = false;
					orderbook.clearUpdatedTimeout()
					
					if (orderbookData == "fail")
					{
						retDFD.resolve({}, IDEX.AJAX_ERROR);
					}
					else if (orderbook.isStoppingOrderbook)
					{
						retDFD.resolve({}, IDEX.AJAX_ABORT);
					}
					else
					{
						if ("error" in orderbookData)
							orderbookData = {};
						
						retDFD.resolve(orderbookData, IDEX.OK);
					}
				});
			}
		})

		return retDFD.promise();
	}
	
	
	IDEX.Orderbook.prototype.orderbookPost = function()
	{
		var retDFD = new $.Deferred();
		var orderbook = this;
		var base = orderbook.market.base;
		var rel = orderbook.market.rel;
		
		var params = 
		{
			'plugin':"InstantDEX",
			'method':"orderbook", 
			'allfields':1,
			'exchange':orderbook.exchange,
			'tradeable':0
		};
		
		if (orderbook.market.isNxtAE)
		{
			params.baseid = base.assetID;
			params.relid = "5527630";
			//params.exchange = "nxtae";
			//params.base = base.name;
			//params.rel = rel.name;
		}
		else
		{
			var fiat = ["USD", "CAD", "GBP", "CNY", "RUR", "EUR"]
			var isRelFiat = false;
			for (var i = 0; i < fiat.length; i++)
			{
				if (rel.name == fiat[i])
				{
					isRelFiat = true
					break;
				}
			}
			if (base.name == "BTC" && !isRelFiat)
			{
				params.base = rel.name;
				params.rel = base.name;
			}
			else
			{
				params.base = base.name;
				params.rel = rel.name;
			}
		}
		

		
		/*var func = function(coin, isBase) 
		{	
			var key = isBase ? "base" : "rel";
			var val = coin.name;
			if (coin.isAsset)
			{
				key = isBase ? "base" : "rel";
				val = coin.name;
			}
			
			return {"key":key, "val":val};
		};

		var basePost = func(orderbook.base, true);
		var relPost = func(orderbook.rel, false);
		
		params[basePost.key] = basePost.val;
		params[relPost.key] = relPost.val;*/

		
		
		this.isWaitingForOrderbook = true;
		var time = Date.now()

		console.log(JSON.stringify(params));
		
		IDEX.sendPost(params, false).done(function(orderbookData)
		{
			console.log(orderbookData);
			//console.log(JSON.stringify(orderbookData.bids));

			orderbook.isWaitingForOrderbook = false;
			retDFD.resolve(orderbookData);
		}).fail(function(data)
		{
			retDFD.resolve("fail")
		})
		
		return retDFD.promise();
	}

	
	IDEX.Orderbook.prototype.clearTimeout = function()
	{
		if (this.timeoutDFD)
		{
			clearTimeout(this.orderbookTimeout);
			this.timeoutDFD.resolve(true);
			this.timeoutDFD = false;
		}
	}
	

	IDEX.Orderbook.prototype.setTimeout = function(timeout)
	{
		this.timeoutDFD = new $.Deferred();
		var orderbook = this;
		
		//console.log("starting setTimeout " + String(timeout));
		this.orderbookTimeout = setTimeout(function() 
		{
			//console.log("finished setTimeout " + String(timeout));
			orderbook.timeoutDFD.resolve(false);
			orderbook.timeoutDFD = false;
		}, timeout)
		
		return this.timeoutDFD.promise();
	}
	
	
	IDEX.Orderbook.prototype.lastUpdatedHandler = function(seconds)
	{
		var orderbook = this;
		
		orderbook.lastUpdatedCounter().done(function()
		{			
			if (orderbook.counter)
			{
				seconds++;
				
				if (orderbook.isWaitingForOrderbook)
					var text = String(seconds) + "s..."
				else
					var text = String(seconds) + "s"
				
				orderbook.lastUpdatedDom.text(text)
				
				orderbook.lastUpdatedHandler(seconds)
			}
			else
			{
				var text = "0s"
				orderbook.lastUpdatedDom.text(text)
			}
		})
	}
	
	
	IDEX.Orderbook.prototype.lastUpdatedCounter = function()
	{
		this.lastUpdatedDFD = new $.Deferred();
		var orderbook = this;
		
		this.lastUpdatedTimeout = setTimeout(function() 
		{
			if (orderbook.lastUpdatedDFD != false)
			{
				orderbook.lastUpdatedDFD.resolve(false);
				//orderbook.lastUpdatedDFD = false;
			}
		}, 1000)
		
		return this.lastUpdatedDFD.promise();
	}
	
	
	IDEX.Orderbook.prototype.clearUpdatedTimeout = function()
	{
		if (this.lastUpdatedDFD)
		{
			clearTimeout(this.lastUpdatedTimeout);
			this.lastUpdatedDFD.resolve(true);
			this.lastUpdatedDFD = false;
		}
	}
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
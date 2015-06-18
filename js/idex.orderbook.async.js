

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.Orderbook.prototype.getOrderbookData = function(timeout)
	{
		var retDFD = new $.Deferred();
		var thisScope = this;

		thisScope.counter = true;
		thisScope.lastUpdatedHandler(0);
		
		//IDEX.updateUserState();
		
		thisScope.setTimeout(timeout).then(function(wasCleared)
		{
			//IDEX.updateUserState();
			
			if (wasCleared)
			{
				thisScope.counter = false;
				thisScope.clearUpdatedTimeout()
				retDFD.resolve({}, IDEX.TIMEOUT_CLEARED);
			}
			else
			{
				thisScope.orderbookPost().done(function(orderbookData)
				{
					thisScope.counter = false;
					thisScope.clearUpdatedTimeout()
					
					if (orderbookData == "fail")
					{
						retDFD.resolve({}, IDEX.AJAX_ERROR);
					}
					else if (thisScope.isStoppingOrderbook)
					{
						retDFD.resolve({}, IDEX.AJAX_ABORT);
					}
					else
					{
						if ("error" in orderbookData)
							orderbookData = {};
						
						retDFD.resolve(orderbookData, IDEX.OK);
					}
				})
			}
		})

		return retDFD.promise();
	}
	
	
	IDEX.Orderbook.prototype.orderbookPost = function()
	{
		var retDFD = new $.Deferred();
		var thisScope = this;
		var params = 
		{
			'plugin':"InstantDEX",
			'method':"orderbook", 
			'baseid':this.baseAsset.assetID, 
			'relid':this.relAsset.assetID, 
			'allfields':1,
			'maxdepth':25,
			'showall':0,
			'timeout':10000
		};
		//console.log(params)
		
		this.isWaitingForOrderbook = true;
		var time = Date.now()
		//console.log('starting orderbook ajax');

		IDEX.sendPost(params, false).done(function(orderbookData)
		{
			//orderbookData = $.parseJSON(orderbookData);
			//console.log(orderbookData);
			//console.log("finished orderbook ajax " + String((Date.now() - time)/1000) + "s");
			
			//if (orderbookData == "abort")
			//	orderbookData = false;

			thisScope.isWaitingForOrderbook = false;
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
			var $el = $(".orderbook-last-updated");
			
			if (orderbook.counter)
			{
				seconds++;
				
				if (orderbook.isWaitingForOrderbook)
					var text = String(seconds) + "s..."
				else
					var text = String(seconds) + "s"
				
				$el.text(text)
				
				orderbook.lastUpdatedHandler(seconds)
			}
			else
			{
				var text = "0s"
				$el.text(text)
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
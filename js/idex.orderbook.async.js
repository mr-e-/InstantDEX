

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.Orderbook.prototype.getOrderbookData = function(timeout)
	{
		var retDFD = new $.Deferred();
		var thisScope = this;

		thisScope.setTimeout(timeout).then(function(wasCleared)
		{
			if (wasCleared)
			{
				retDFD.resolve({}, IDEX.TIMEOUT_CLEARED);
			}
			else
			{
				thisScope.orderbookPost().done(function(orderbookData)
				{
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
			'requestType':"orderbook", 
			'baseid':this.baseAsset.assetID, 
			'relid':this.relAsset.assetID, 
			'allfields':1,
			'maxDepth':25,
			'showAll':0
		};
		
		this.isWaitingForOrderbook = true;
		var time = Date.now()
		console.log('starting orderbook ajax');
		
		this.xhr = IDEX.sendPost(params, false, function(orderbookData)
		{
			//console.log(orderbookData);
			console.log("finished orderbook ajax " + String((Date.now() - time)/1000) + "s");
			
			//if (orderbookData == "abort")
			//	orderbookData = false;

			thisScope.isWaitingForOrderbook = false;
			retDFD.resolve(orderbookData);
		})
		
		return retDFD.promise();
	}

	
	IDEX.Orderbook.prototype.clearTimeout = function()
	{
		if (this.timeoutDFD)
		{
			//console.log("clearTimeout")
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
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
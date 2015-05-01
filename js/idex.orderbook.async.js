

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.Orderbook.prototype.getOrderbookData(timeout)
	{
		var retDFD = new $.Deferred();
		
		this.setTimeout(timeout).then(function(wasCleared)
		{
			if (wasCleared)
			{
				retDFD.resolve({}, IDEX.TIMEOUT_CLEARED);
			}
			else
			{
				orderbookPost.done(function(orderbookData)
				{
					if (!orderbookData)
					{
						retDFD.resolve({}, IDEX.AJAX_FAILED);
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
		var params = 
		{
			'requestType':"orderbook", 
			'baseid':IDEX.user.curBase.assetID, 
			'relid':IDEX.user.curRel.assetID, 
			'allfields':1,
			'maxDepth':25,
			'showAll':0
		};
		
		this.isWaitingForOrderbook = true;
		
		
		IDEX.sendPost(params).done(function(orderbookData)
		{
			console.log(orderbookData);
			
			this.isWaitingForOrderbook = false;
			retDFD.resolve(orderbookData);
			
		}).fail(function(data)
		{
			this.isWaitingForOrderbook = false;
			retDFD.resolve(false);
		})
		
		return retDFD.promise();
	}

	
	IDEX.Orderbook.prototype.clearTimeout = function()
	{
		clearTimeout(this.orderbookTimeout);
		this.timeoutDFD.resolve(false)
	}
	

	IDEX.Orderbook.prototype.setTimeout = function(timeout)
	{
		this.timeoutDFD = new $.Deferred();
		
		orderbookTimeout = setTimeout(function() 
		{
			this.timeoutDFD.resolve(true);
		}, timeout)
		
		return this.timeoutDFD.promise()
	}
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
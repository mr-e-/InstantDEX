

var IDEX = (function(IDEX, $, undefined)
{
		
	function getOrderbookData()
	{
		var dfd = new $.Deferred();
		
		poll().then(function(wasCleared)
		{
			if (wasCleared)
			{
				dfd.resolve("wasCleared")
			}
			
			else
			{
				orderbookPost.done(function(orderbookData)
				{
					if (!orderbookData)
					{
						dfd.resolve("wasError");
					}
					else
					{
						if ("error" in orderbookData)
							orderbookData = {};
						
						dfd.resolve(orderbookData);
					}
				})
			}
		})
		
		return dfd.promise()
	}
	
	
	function orderbookPost()
	{
		var dfd = new $.Deferred();
		var params = {
			'requestType':"orderbook", 
			'baseid':IDEX.user.curBase.assetID, 
			'relid':IDEX.user.curRel.assetID, 
			'allfields':1,
			'maxDepth':25,
			'showAll':0
		};
		
		orderbookAsync = true;
		console.log('Waiting for orderbook');
		
		IDEX.sendPost(params).then(function(orderbookData)
		{
			orderbookAsync = false;
			console.log('Finished waiting for orderbook');
			console.log(orderbookData);
			
			dfd.resolve(orderbookData)
			
		}).fail(function(data)
		{
			orderbookAsync = false;
			dfd.resolve(false)

		})
		
		return dfd.promise()
	}


	function poll(timeout)
	{
		pollDFD = new $.Deferred();
		
		orderbookTimeout = setTimeout(function() 
		{
			pollDFD.resolve();
		}, timeout)
		
		return pollDFD.promise()
	}
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
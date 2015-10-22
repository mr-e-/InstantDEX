

var IDEX = (function(IDEX, $, undefined)
{
	
	
	IDEX.DMonOverlord = function()
	{
		var dMonOverlord = this;
		dMonOverlord.dMons = [];
	}


	
	
	IDEX.DMonOverlord.prototype.checkAll = function()
	{
		var dMonOverlord = this;
		var dMons = dMonOverlord.dMons;
		var retDFD = new $.Deferred();
		retDFD.resolve();
		
		dMonOverlord.ping().done(function()
		{
			
		})
		for (var i = 0; i < dMons.length; i++)
		{
			var dMon = dMons[i];
			dMon.ping().done(function()
			{
				//"Could not connect to SuperNET. Start SuperNET and reload."
				//"Could not connect to NXT. Start NXT and reload."
			})
		}
		
		return retDFD.promise();
	}
	
	
	IDEX.DMon = function(monName)
	{
		var dMon = this;
		
		dMon.monName = monName;
		
	}
	
	
	IDEX.DMonOverlord.prototype.ping = function()
	{
		var dfd = new $.Deferred();
		var params = {"method":"openorders","allorders":1};
		params = {"method":"balance","exchange":"bittrex"}
		//params = {"method":"allexchanges"}
		//params = {"method":"tradehistory"}

		IDEX.sendPost(params, false).done(function(data)
		{
			console.log(data)
			dfd.resolve()
			
		}).fail(function()
		{
			dfd.reject()
		})
		
		return dfd.promise()
	}
	

	
	
	IDEX.pingNxt = function()
	{
		var dfd = new $.Deferred();
		var params = {"requestType":"getState"};
		
		IDEX.sendPost(params, true).done(function()
		{
			dfd.resolve()
			
		}).fail(function()
		{
			dfd.reject()
		})
		
		return dfd.promise()
	}
	


	return IDEX;
		

}(IDEX || {}, jQuery));



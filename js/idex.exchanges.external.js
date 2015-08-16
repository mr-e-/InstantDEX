

var IDEX = (function(IDEX, $, undefined)
{
	

	
	var Exchange = IDEX.Exchange = function()
	{
		this.init.apply(this, arguments)
	}
	
	Exchange.prototype = 
	{	
		init: function()
		{
			var exchange = this;
			
			exchange.markets = [];
						
		},
		
		
		initState: function()
		{
			var dfd = new $.Deferred();
			var exchange = this;

			dfd.resolve();
			
			
			return dfd.promise();
		},
		
		
	}
	
	

	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


	
	

var IDEX = (function(IDEX, $, undefined)
{	
	var defaultOptions = 
	{
		"duration":6000,
		"minperc":75
	}

	IDEX.User.prototype.initOptions = function()
	{	
		var options = {};
		

		this.options = options;
	}
	

	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
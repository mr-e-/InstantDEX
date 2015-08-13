	
	
var IDEX = (function(IDEX, $, undefined) 
{

	IDEX.User = function(obj)
	{
		this.allAssets = [];
		this.labels = [];
		this.options = {};
		this.favorites = {};
		
		this.curBase = {};
		this.curRel = {};
		this.pendingOrder = {};
		
		IDEX.constructFromObject(this, obj);
	}

	return IDEX;
	
	
}(IDEX || {}, jQuery));

	
	
var IDEX = (function(IDEX, $, undefined) 
{
	
	IDEX.User.prototype.updatePair = function(baseid, relid)
	{
		this.curBase = this.getAssetInfo("asset", baseid);
		this.curRel = this.getAssetInfo("asset", relid);
	}
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));

	
	
var IDEX = (function(IDEX, $, undefined) 
{
	
	IDEX.User.prototype.updatePair = function(baseid, relid)
	{	
		this.curBase = this.getAssetInfo("assetID", baseid);	
		this.curRel = this.getAssetInfo("assetID", relid);
	}
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));

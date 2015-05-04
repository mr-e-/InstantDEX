	
	
var IDEX = (function(IDEX, $, undefined) 
{
	
	IDEX.User.prototype.updatePair = function(baseid, relid)
	{	
		var retBool = false;
		var curBase = this.getAssetInfo("assetID", baseid);	
		var curRel = this.getAssetInfo("assetID", relid);
		
		if (!($.isEmptyObject(curBase)) && !($.isEmptyObject(curRel)))
		{
			this.curBase = curBase;
			this.curRel = curRel;
			retBool = true;
		}
		
		return retBool;
	}
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));

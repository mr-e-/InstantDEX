	
	
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
	
	
	IDEX.User.prototype.clearPair = function()
	{	
		this.curBase = "";
		this.curRel = "";
	}
	
	
	IDEX.User.prototype.getLastMarket = function()
	{
		var lastMarket = {}
	
		if (localStorage.lastMarket)
		{
			lastMarket = JSON.parse(localStorage.getItem('lastMarket'));
		}
		else
		{
			var baseid = "17554243582654188572"
			var relid = "5527630"
			
			lastMarket['baseID'] = baseid
			lastMarket['relID'] = relid
		}
		
		return lastMarket
	}
	
	IDEX.User.prototype.setLastMarket = function(baseID, relID)
	{
		var lastMarket = {}
		
		lastMarket['baseID'] = baseID
		lastMarket['relID'] = relID
		
		localStorage.setItem('lastMarket', JSON.stringify(lastMarket));
	}
	
	
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));

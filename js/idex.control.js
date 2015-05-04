

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.changeMarket = function(baseid, relid)
	{
		var retBool = false;
		
		if (IDEX.user.updatePair(baseid, relid))
		{
			IDEX.updateOrderBox();
			
			//IDEX.account.pollOpenOrders();

			IDEX.killChart();
			IDEX.makeChart({'baseid':IDEX.user.curBase.assetID, 'relid':IDEX.user.curRel.assetID, 'basename':IDEX.user.curBase.name, 'relname':IDEX.user.curRel.name, 'isNew':true});
			IDEX.orderbook.loadNewOrderbook(IDEX.user.curBase, IDEX.user.curRel);
			retBool = true;
		}
		
		return retBool;
	}
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));

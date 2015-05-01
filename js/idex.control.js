

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.changeMarket = function(baseid, relid)
	{
		IDEX.user.updatePair(baseid, relid);
		IDEX.updateOrderBox();
		IDEX.makeTable("marketOpenOrdersTable");

		IDEX.killChart();
		IDEX.makeChart({'baseid':IDEX.user.curBase.assetID, 'relid':IDEX.user.curRel.assetID, 'basename':IDEX.user.curBase.name, 'relname':IDEX.user.curRel.name, 'isNew':true});
		IDEX.orderbook.loadNewOrderbook();
	}
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));

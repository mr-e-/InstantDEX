

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.changeMarket = function()
	{
		IDEX.user.updatePair();
		IDEX.updateOrderBox();
		IDEX.currentOpenOrders();
		
		IDEX.killChart();
		IDEX.makeChart({'baseid':IDEX.curBase.asset, 'relid':IDEX.curRel.asset, 'basename':IDEX.curBase.name, 'relname':IDEX.curRel.name, 'isNew':true});
		IDEX.loadOrderbook();
	}
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));

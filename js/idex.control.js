

var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.changeMarket = function(baseid, relid)
	{
		var retBool = false;

		if (IDEX.user.updatePair(baseid, relid))
		{
			var base = IDEX.user.curBase.name
			var rel = IDEX.user.curRel.name
			IDEX.currPairDom(IDEX.user.curBase, IDEX.user.curRel);
			
			IDEX.updateOrderBox();
			
			//IDEX.account.pollOpenOrders();

			//IDEX.killChart();
			IDEX.makeChart({'baseid':IDEX.user.curBase.assetID, 'relid':IDEX.user.curRel.assetID, 'basename':IDEX.user.curBase.name, 'relname':IDEX.user.curRel.name});
			IDEX.orderbook.loadNewOrderbook(IDEX.user.curBase, IDEX.user.curRel);
			retBool = true;
		}
		
		return retBool;
	}
	
	
	IDEX.currPairDom = function(base, rel)
	{
		var $pairdom = $(".curr-pair")
		var market = base.name + "_" + rel.name
		var marketID = base.assetID + "_" + rel.assetID
		
		$pairdom.find("span").empty().text(market)
		$pairdom.attr("data-inspect", marketID)
		
		$labeldom = $(".orderbook-label-conf input[name='market']")
		$labeldom.val(market)
	}
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));



var IDEX = (function(IDEX, $, undefined)
{
	IDEX.mainChartNode = "main_menu_chart";
	IDEX.cmChartNode = "ex_chart"
	
	IDEX.changeMarket = function(baseid, relid)
	{
		var dfd = new $.Deferred();
		var retBool = false;

		if (IDEX.user.updatePair(baseid, relid))
		{
			var base = IDEX.user.curBase.name
			var rel = IDEX.user.curRel.name
			
			IDEX.user.setLastMarket(baseid, relid);
			
			IDEX.currPairDom(IDEX.user.curBase, IDEX.user.curRel);
			
			IDEX.updateOrderBox();
			IDEX.makeTable("marketOpenOrdersTable", function()
			{
				
			});
			//IDEX.account.pollOpenOrders();

			//IDEX.killChart();
			var exchange = "nxtae";
			
			IDEX.makeChart({'baseid':IDEX.user.curBase.assetID, 'relid':IDEX.user.curRel.assetID, "exchange":exchange, "node":IDEX.cmChartNode});
			
			if (IDEX.isChartLocked)
			{
				IDEX.makeChart({'baseid':IDEX.user.curBase.assetID, 'relid':IDEX.user.curRel.assetID, "exchange":exchange, "node":IDEX.mainChartNode});
			}
			
			IDEX.orderbook.loadNewOrderbook(IDEX.user.curBase, IDEX.user.curRel);

			dfd.resolve();
		}
		else
		{
			dfd.reject();
		}
		
		return dfd.promise();
	}
	
	
	IDEX.unloadMarket = function()
	{
		IDEX.user.clearPair();
		IDEX.clearOrderBox();
		
		var $pairdom = $(".curr-pair")
		var market = "No market loaded"
		
		$pairdom.find("span").empty().text(market)
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
	
	
	//var counter = 0;
	
	IDEX.updateUserState = function(force)
	{
		//console.log(counter++)
		
		IDEX.makeTable("marketOpenOrdersTable", function()
		{
			
		});
		
		IDEX.updateOrderBoxBalance(force);
	}
	
	
	
	return IDEX;
		

}(IDEX || {}, jQuery));

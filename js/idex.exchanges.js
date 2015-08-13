	
	
var IDEX = (function(IDEX, $, undefined) 
{
	
	$(".allExchanges-nav-cell").on("click", function()
	{
		var $wrap = $(this).closest(".allExchangesFullPopup");
		
		var exchange = $(this).attr("data-exchange");
		
		var $trigExchange = $wrap.find(".allExchanges-exchange[data-exchange='"+exchange+"']");
		
		
		$wrap.find(".allExchanges-nav-cell").removeClass("active");
		$wrap.find(".allExchanges-exchange").removeClass("active");
		
		$trigExchange.addClass("active");
		$(this).addClass("active");
		
	})
	
	
	
	$(".allExchanges-exchange-nav-cell").on("click", function()
	{
		var $wrap = $(this).closest(".allExchanges-exchange");
		
		var tab = $(this).attr("data-tab");
		
		var $trigTab = $wrap.find(".allExchanges-exchange-content[data-tab='"+tab+"']");
		
		
		$wrap.find(".allExchanges-exchange-nav-cell").removeClass("active");
		$wrap.find(".allExchanges-exchange-content").removeClass("active");
		
		$trigTab.addClass("active");
		$(this).addClass("active");
		
		
		var exchange = $(this).closest(".allExchanges-exchange").attr("data-exchange");
		
		updateExchangeTab(exchange, $tabWrap);
	})
	
	
	
	function updateExchangeTab(exchange)
	{
		console.log(exchange);
	}
	
	
	
	function updateBalancesTable()
	{
		var $tbody = $(".allMarkets-table table tbody")

	}
	
	

	$(".allExchanges-nav-cell td").on("click", function()
	{
		IDEX.updateMarketTable();
	})
	
	
	
	IDEX.updateMarketTable = function()
	{
		var $tbody = $(".allMarkets-table table tbody")

		IDEX.getAssetTradeInfo().done(function(assetsWithVol)
		{
			assetsWithVol.sort(IDEX.compareProp('quantityNXT')).reverse();
			var list = [];

			for (var i = 0; i < assetsWithVol.length; i++)
			{
				var vols = assetsWithVol[i];
				var assetID = vols.assetID;
				var asset = IDEX.nxtae.assets.getAsset("assetID", assetID);
				
				var market = asset.name + "/NXT";
				var volNXT = vols.quantityNXT / Math.pow(10, 8);
				
				var tr = "<tr><td>"+market+"</td><td>"+assetID+"</td><td>"+volNXT+"</td></tr>";
				
				$tbody.append($(tr));

			}
		});
	}
	
	
	

	

	return IDEX;
	
	
}(IDEX || {}, jQuery));

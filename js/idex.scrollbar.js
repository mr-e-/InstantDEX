

var IDEX = (function(IDEX, $, undefined) 
{

	IDEX.initScrollbar = function()
	{
		$("#sellBook").perfectScrollbar();
		$("#buyBook").perfectScrollbar();	

		$(".cm-favs-popup-allFavs").perfectScrollbar();
		
		$(".inspect-area-orderbook-bids").perfectScrollbar();
		$(".inspect-area-orderbook-asks").perfectScrollbar();
		$(".orderbook-label-popup-table").perfectScrollbar();
		$(".inspect-candle-trades-body").perfectScrollbar();
		$(".tiles-grid").perfectScrollbar();
		
		$(".tile-cell-orderbook-orders-bids").perfectScrollbar();
		$(".tile-cell-orderbook-orders-asks").perfectScrollbar();
		
		$(".browse-balances-nxt").perfectScrollbar();
	}

	IDEX.updateScrollbar = function(toBottom)
	{
		//if (toBottom)
			//$("#sellBook").scrollTop($("#sellBook").prop("scrollHeight"));
		$("#sellBook").perfectScrollbar('update');
		$("#buyBook").perfectScrollbar('update');
	}
	

	$(window).resize(function()
	{	
		IDEX.updateScrollbar(false);
	})
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

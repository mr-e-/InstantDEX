

var IDEX = (function(IDEX, $, undefined) 
{

	IDEX.initScrollbar = function()
	{
		//$(".cm-favs-popup-allFavs").perfectScrollbar();		
		$(".orderbook-label-popup-table").perfectScrollbar();
		//$(".browse-balances-nxt").perfectScrollbar();
	}

	

	/*
	$(window).resize(function()
	{	
		IDEX.updateScrollbar(false);
	})
	*/
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

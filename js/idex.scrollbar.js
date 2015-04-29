

var IDEX = (function(IDEX, $, undefined) 
{

	IDEX.initScrollbar = function()
	{
		$("#sellBook .twrap").perfectScrollbar();
		$("#buyBook").perfectScrollbar();		
	}

	IDEX.updateScrollbar = function(toBottom)
	{
		if (toBottom)
			$("#sellBook .twrap").scrollTop($("#sellBook .twrap").prop("scrollHeight"));
		$("#sellBook .twrap").perfectScrollbar('update');
		$("#buyBook").perfectScrollbar('update');
	}
	

	$(window).resize(function()
	{	
		IDEX.updateScrollbar(false);
	})
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

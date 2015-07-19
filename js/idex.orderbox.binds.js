	

var IDEX = (function(IDEX, $, undefined) 
{
	var $mainGrid = $("#main_grid");
	
	
	
	$mainGrid.on("mousedown", ".orderbox-order-button", function()
	{
		$(this).addClass("order-button-mousedown")
	})
	$mainGrid.on("mouseup", ".orderbox-order-button", function()
	{
		$(this).removeClass("order-button-mousedown")
	})
	$mainGrid.on("mouseleave", ".orderbox-order-button", function()
	{
		$(this).removeClass("order-button-mousedown")
	})
	
	
	


	return IDEX;
	
}(IDEX || {}, jQuery));

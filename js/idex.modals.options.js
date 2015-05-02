
var IDEX = (function(IDEX, $, undefined)
{


	$("#modal-04").on("idexHide", function()
	{
		IDEX.user.saveChartFavorites();
	})
	
	$("#modal-05").on("idexHide", function()
	{
		IDEX.user.saveOptions();
	})

	return IDEX;
	
}(IDEX || {}, jQuery));
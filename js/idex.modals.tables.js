

var IDEX = (function(IDEX, $, undefined) 
{

	$(".tab-tables .nav").on("click", function()
	{
		var $activeTab =  $("#"+$(this).attr('tab-index'))
		var $table = $activeTab.find("table")
		var tableName = $($table[1]).attr('id')

		
		if (tableName)
		{
			IDEX.makeTable(tableName)
		}
	})
	
	$(".md-modal").on("idexShow", function()
	{
		var $activeTab =  $("#"+$(this).find(".nav.active").attr('tab-index'))
		var $table = $activeTab.find("table")
		var tableName = $($table[1]).attr('id')
		
		if (tableName)
		{
			IDEX.makeTable(tableName)
		}
	})
	

	return IDEX;
	
}(IDEX || {}, jQuery));
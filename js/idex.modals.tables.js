

var IDEX = (function(IDEX, $, undefined) 
{
	
	$("#openOrdersTable tbody").on("click", "tr td.cancelOrder", function()
	{
		var quoteid = $(this).parent().attr("data-quoteid");
		var $thisScope = $(this);
		
		IDEX.sendPost({'requestType':"cancelquote",'quoteid':quoteid}).done(function(data)
		{
			$thisScope.closest(".md-content").find(".tab-tables .nav.active").trigger("click");
		})
	})
	
	
	$(".current-open-orders-table tbody").on("click", "tr td.cancelOrder", function(e)
	{
		var quoteid = $(this).parent().attr("data-quoteid");
		var $thisScope = $(this);

		IDEX.sendPost({'requestType':"cancelquote",'quoteid':quoteid}).done(function(data)
		{
			IDEX.currentOpenOrders();
		})
	})
	

	$("#marketTable tbody").on("click", "tr", function()
	{
		IDEX.changePair($(this).attr("data-baseid"), $(this).attr("data-relid"));
		$(".md-overlay").trigger("click");
	})

	
	$(".tab-tables .nav").on("click", function()
	{
		var tableName = $("#"+$(this).attr('tab-index')).find("table").attr('id');
		console.log(tableName)
		//var $table = $("#"+$(this).find(".nav.active").attr('tab-index')).find("table");
		if (tableName)
		{
			IDEX.makeTable(tableName)
		}
	})
	
	$(".md-modal").on("idexShow", function()
	{
		//var tableName = $("#"+$(this).attr('tab-index')).find("table").attr('id');
		var tableName = $("#"+$(this).find(".nav.active").attr('tab-index')).find("table").attr('id')
		console.log(tableName)
		if (tableName)
		{
			IDEX.makeTable(tableName)
		}
	})
	



	return IDEX;
	
}(IDEX || {}, jQuery));
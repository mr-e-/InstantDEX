

var IDEX = (function(IDEX, $, undefined)
{
	

	$(".mainHeader-menu-ico-settings").on("click", function()
	{
		var params = {"method":"openorders"};
		IDEX.sendPost(params, false).done(function(data)
		{
			console.log(data)
		})
	})

	
	function buildTable(table, tableName, tableData)
	{
		var keys = table.keys.split(" ");
		var method = table.method;
		var params = {'requestType':method};
		var $modalTable = $("#"+tableName);
		var row = "";

		if (tableName == "openOrdersTable")
		{	
			tableData = formatPairName(tableData);
			tableData = formatOpenOrders(tableData);
			row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
			row = $(row).each(function()
			{
				$(this).find("td:last").after("<td class='cancelOrder'>CANCEL</td>");
			})
			row = IDEX.addElDataAttr(row, tableData, ["quoteid"]);
		}
	}

	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

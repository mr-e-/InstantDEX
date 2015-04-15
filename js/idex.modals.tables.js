

var IDEX = (function(IDEX, $, undefined) {


$(".md-modal").on("idexHide", function()
{
	$(this).find(".tabs-container div").removeClass("active").first().addClass("active");
	$(this).find(".tabs-nav .nav").removeClass("active").first().addClass("active");
})


$(".tab-tables .nav").on("click", function()
{
	var $table = $("#"+$(this).attr('tab-index')).find("table");
	if ($table.length) { tableHandler($table); }
})
$(".md-modal").on("idexShow", function()
{
	var $table = $("#"+$(this).find(".nav.active").attr('tab-index')).find("table");
	if ($table.length) { tableHandler($table); }
})


$("#openOrdersTable tbody").on("click", "tr", function(e)
{
	var quoteid = $(this).attr("data-quoteid");
	var $thisScope = $(this);
	
	IDEX.sendPost({'requestType':"cancelquote",'quoteid':quoteid}).done(function(data)
	{
		$thisScope.closest(".md-content").find(".tab-tables .nav.active").trigger("click");
	})
})



$("#marketTable tbody").on("click", "tr", function()
{
	IDEX.loadOrderbook($(this).attr("data-baseid"), $(this).attr("data-relid"));
	$(".md-overlay").trigger("click");
})


function tableHandler($modalTable)
{
	var keys = $modalTable.find("thead").attr("data-keys").split(" ");
	var method = $modalTable.attr("data-method");
	var params = {'requestType':method};
	var type = 0;
	
	if (method == "tradehistory")
		params['timestamp'] = 0;
	
	if (method == "getAccountAssets")
	{
		keys.splice(0,1)
		balancesTable(keys, $modalTable)
	}
	else
	{

		IDEX.sendPost(params, type).done(function(data)
		{
			var row = "";

			if (keys[0] in data)
			{
				var tableData = data[keys[0]];
				keys.splice(0,1);

				if (method == "openorders")
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
				else if (method ==	"allorderbooks")
				{
					addEmptyMarketData(tableData);
					row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
					row = IDEX.addElDataAttr(row, tableData, ["baseid","relid"]);
				}
				else if (method == "tradehistory")
				{
					if ("rawtrades" in tableData) 
					{
						tableData = tableData['rawtrades'];
						addAssetNames(tableData, "baseid", "relid");
						tableData = formatPairName(tableData);
					}
				}
				else if (method == "getAccountAssets")
				{

				}
				
				if (!row.length)
					row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
			}
			
			$modalTable.find("tbody").empty().append(row);
		})
	}
}

$(".info-tabs li").on("click", IDEX.currentOpenOrders)

IDEX.currentOpenOrders = function()
{
	var $modalTable = $(".current-open-orders-table");
	var params = {'requestType':"openorders"}
	IDEX.sendPost(params, 0).done(function(data)
	{
		var row = "";
		if ("openorders" in data)
		{
			var tableData = data['openorders']
			var keys = ["askoffer", "price", "volume", "total", "quoteid", "age"]
			var temp = []
			for (var i=0; i <tableData.length; ++i)
				if (tableData[i].baseid == IDEX.curBase.asset && tableData[i].relid == IDEX.curRel.asset)
					temp.push(tableData[i])
			tableData = temp;
			tableData = formatPairName(tableData);
			tableData = formatOpenOrders(tableData);
			row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
			row = $(row).each(function(e, i)
			{
				var bidAsk = $(this).find("td:first").text()
				if (bidAsk == "Bid")
					var addClass = "text-green";
				else
					var addClass = "text-red";
				$(this).find("td:first").addClass(addClass);
				$(this).find("td:last").after("<td class='cancelOrder'>CANCEL</td>");
			})
			row = IDEX.addElDataAttr(row, tableData, ["quoteid"]);
		}
		$modalTable.find("tbody").empty().append(row);
	})
}

$(".current-open-orders-table tbody").on("click", "tr td.cancelOrder", function(e)
{
	var quoteid = $(this).parent().attr("data-quoteid");
	var $thisScope = $(this);

	IDEX.sendPost({'requestType':"cancelquote",'quoteid':quoteid}).done(function(data)
	{
		IDEX.currentOpenOrders();
	})
})


function balancesTable(keys, $modalTable)
{	
	var row = "";

	IDEX.account.updateBalances().done(function()
	{
		var tableData = IDEX.account.balances;
		var arr = [];
		for (var key in tableData)
			arr.push(tableData[key])
		tableData = arr

		for (var i = 0; i < tableData.length; ++i)
		{
			var decimals = tableData[i].decimals;
			
			//tableData[i].quantityQNT = tableData[i].quantityQNT / Math.pow(10, decimals);
			//tableData[i].unconfirmedQuantityQNT = "-";
			tableData[i]['change'] = "-";
		}
		row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
		$modalTable.find("tbody").empty().append(row);
	})
}



function formatOpenOrders(tableData)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['askoffer'] = tableData[i]['askoffer'] == 1 ? "Ask" : "Bid";
		tableData[i]['total'] = tableData[i]['relamount']/IDEX.SATOSHI;
	}
	
	return tableData;
}

function formatPairName(tableData)
{
	for (var i = 0; i < tableData.length; ++i)
		tableData[i]['market'] = tableData[i]['base'] + "/" + tableData[i]['rel'];

	return tableData;
}


function addEmptyMarketData(tableData, keys)
{
	keys = typeof keys === "undefined" ? ["last", "high", "low", "volume"] : keys;
	
	for (var i = 0; i < tableData.length; ++i)
		for (var j = 0; j < keys.length; ++j)
			tableData[i][keys[j]] = "-";
	
	return tableData;
}


function addAssetNames(tableData, baseName, relName)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['base'] = IDEX.getAssetInfo("asset", tableData[i][baseName])['name'];
		tableData[i]['rel'] = IDEX.getAssetInfo("asset", tableData[i][relName])['name'];
	}
	
	return tableData;
}


	return IDEX;
	
}(IDEX || {}, jQuery));
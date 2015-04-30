


var IDEX = (function(IDEX, $, undefined) 
{

	var tables = {
		"openOrdersTable": {"method":"openorders", "keys":"askoffer market price volume total quoteid age", "isDataTable":true},
		"marketOpenOrdersTable": {"method":"openorders", "keys":"askoffer market price volume total quoteid age", "isDataTable":false},
		"allOrderbooksTable": {"method":"allorderbooks", "keys":"base rel last high low volume exchange", "isDataTable":true},
		"tradeHistoryTable": {"method":"tradehistory", "keys":"market priceNQTA priceNQTB NXT triggerhash", "isDataTable":true},
		"balancesTable": {"method":"getAccountAssets", "keys":"name assetID availableBalance unconfirmedBalance change", "isDataTable":true}
	};

	
	IDEX.makeTable = function(tableName)
	{
		var table = tables[tableName];

		getTableData(table).done(function(tableData)
		{
			buildTable(table, tableName, tableData);
		})
	}
	
	
	function getTableData(table)
	{
		var dfd = new $.Deferred();
		var keys = table.keys;
		var method = table.method;
		var params = {'requestType':method};

		if (method == "tradehistory")
			params['timestamp'] = 0;
		
		if (method == "getAccountAssets")
		{
			IDEX.account.updateBalances().done(function()
			{
				var temp = [];
				for (var key in IDEX.account.balances)
					temp.push(IDEX.account.balances[key]);
				
				dfd.resolve(temp);
			})
		}
		else if (method == "openorders")
		{
			IDEX.account.updateOpenOrders().done(function()
			{
				dfd.resolve(IDEX.account.openOrders);
			})
		}
		else
		{
			IDEX.sendPost(params, 0).done(function(data)
			{
				var tableData = [];
				
				if (method in data)
				{
					tableData = data[method];
				}
				
				dfd.resolve(tableData);
			})
		}
		
		
		return dfd.promise()
	}

	
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
		
		else if (tableName == "marketOpenOrdersTable")
		{
			tableData = formatPairName(tableData);
			tableData = formatOpenOrders(tableData);
			row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
			row = $(row).each(function(e, i)
			{
				var bidAsk = $(this).find("td:first").text();
				var addClass = bidAsk == "Bid" ? "text-green" : "text-red";
				$(this).find("td:first").addClass(addClass);
				$(this).find("td:last").after("<td class='cancelOrder'>CANCEL</td>");
			})
			
			row = IDEX.addElDataAttr(row, tableData, ["quoteid"]);
		}
		
		else if (tableName == "allOrderbooksTable")
		{
			addEmptyMarketData(tableData);
			
			row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
			row = IDEX.addElDataAttr(row, tableData, ["baseid","relid"]);
		}
		
		else if (tableName == "tradeHistoryTable")
		{
			console.log(tableData);
			if ("rawtrades" in tableData) 
			{
				tableData = tableData['rawtrades'];
				addAssetNames(tableData, "baseid", "relid");
				tableData = formatPairName(tableData);
				row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");
			}
		}
		
		else if (tableName == "balancesTable")
		{
			addEmptyMarketData(tableData, ["change"]);
			row = IDEX.buildTableRows(IDEX.objToList(tableData, keys), "table");			
		}
		
		
		if (table.isDataTable)
		{
			var dataTable = $modalTable.dataTable();
			var newDataTable = $modalTable.DataTable();
			
			dataTable.fnClearTable(false);
			newDataTable.rows.add($(row));
			
			newDataTable.columns.adjust().draw();
		}
		else
		{
			$modalTable.find("tbody").empty().append(row);
		}
	}
	

	function formatOpenOrders(tableData)
	{
		for (var i = 0; i < tableData.length; ++i)
		{
			tableData[i]['askoffer'] = tableData[i]['askoffer'] == 1 ? "Ask" : "Bid";
			tableData[i]['total'] = tableData[i]['relamount'] / IDEX.SATOSHI;
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
			tableData[i]['base'] = IDEX.user.getAssetInfo("assetID", tableData[i][baseName])['name'];
			tableData[i]['rel'] = IDEX.user.getAssetInfo("assetID", tableData[i][relName])['name'];
		}
		
		return tableData;
	}
	
	
	IDEX.buildTableRows = function(data, tableType)
	{
		var row = "";
		var rowWrap = "";
		var tdWrap = "";

		if (tableType == "table")
		{
			rowWrap = "<tr></tr>"
			tdWrap = "<td></td>";
		}
		else if (tableType == "span")
		{
			rowWrap = "<div class='order-row'></div>"
			tdWrap = "<span class='order-col'></span>";
		}
		
		for (var i = 0; i < data.length; ++i)
		{
			var td = "";

			for (var j = 0; j < data[i].length; ++j)
			{
				td += $(tdWrap).text(data[i][j])[0].outerHTML
			}
			
			row += $(td).wrapAll(rowWrap).parent()[0].outerHTML
		}

		return row;
	}

	
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
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));

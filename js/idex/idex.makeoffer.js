

var IDEX = (function(IDEX, $, undefined)
{
	
	var $tradesequencePopup = $(".tradesequencePopup");
	var $tradesequencePopupConfirm = $(".tradesequencePopup-confirm");
	var $tradesequenceTable = $tradesequencePopup.find(".tradesequencePopup-tradesTable table");
	
	
	$tradesequencePopupConfirm.on("click", function()
	{
		var isDisabled = $(this).hasClass("disabled")
		
		if (!isDisabled)
			IDEX.makeOffer()
	})
	
	
	IDEX.makeOffer = function()
	{	
		var order = IDEX.user.pendingOrder;
		var params = $.extend(true, {}, order.rawData);
		params.dotrade = 1;
		console.log(JSON.stringify(params));
		
		$tradesequencePopupConfirm.addClass('disabled');
		
		IDEX.sendPost(params, false).done(function(data)
		{
			console.log(data);
			buildTradesequenceResults(data);

			if ("error" in data && data.error.length)
			{
				//console.log("error");
				//$(".conf-jumbotron").show().find("div").text(data['error']);
			}
			else
			{	
				//IDEX.togglePopup($tradesequencePopup, false, true);
			}
			
			$tradesequencePopupConfirm.removeClass('disabled');

		}).fail(function()
		{
			$tradesequencePopupConfirm.removeClass('disabled');
		})
	}
	
	
	function buildTradesequenceResults(results)
	{	
		var tradeResults = results.traderesults;
		
		var $tradesequenceResults = $tradesequencePopup.find(".tradesequencePopup-resultsTable");
		var $tradesequenceResultsTable = $tradesequencePopup.find(".tradesequencePopup-resultsTable table");

		$tradesequenceResultsTable.find("tbody").empty();
		
		var rows = [];
		
		for (var i = 0; i < tradeResults.length; i++)
		{
			var tradeResult = tradeResults[i];
			
			if ("error" in tradeResult)
			{
				var tr = "<tr><td>Error: "+String(tradeResult.error)+"</td></tr>";
				$tradesequenceResultsTable.find("tbody").append($(tr));
			}
		}
		
		$tradesequenceResults.addClass("active");
	}

	
	IDEX.buildMakeofferModal = function(order, orderbook)
	{
		var market = orderbook.market;
		var marketName = market.marketName;
		var baseName = market.base.name;
		var relName = market.rel.name;
		
		$tradesequencePopup.find(".tradesequencePopup-marketName span").text(marketName);
		$tradesequencePopup.find(".tradesequencePopup-orderType span").text((order.askoffer ? "Buy" : "Sell") + " " + baseName);
		$tradesequencePopup.find(".conf-amount").val(order.volume);
		$tradesequencePopup.find(".conf-price").val(order.price);
		$tradesequencePopup.find(".conf-total").val(order.total);
		$tradesequencePopup.find(".refcur-rel").text(relName);
		$tradesequencePopup.find(".refcur-base").text(baseName);

		
		var $tradesequenceResults = $tradesequencePopup.find(".tradesequencePopup-resultsTable");
		$tradesequenceResults.removeClass("active");
		$tradesequenceTable.find("tbody").empty();
		buildTradesequenceTable(order);
		
		IDEX.togglePopup($tradesequencePopup, true, true);
	}

	
	function formatTrades(rawTrades)
	{
		var trades = [];
		var formattedTrades = [];
		
		if (rawTrades.length)
		{
			trades = rawTrades.slice();
			if (Object.prototype.toString.call( trades[0] ) === '[object Array]')
			{
				trades = trades[0].slice();
			}
		}
		
		for (var i = 0; i < trades.length; i++)
		{
			var trade = trades[i];
			var formattedTrade = {};
			
			formattedTrade.type = trade.trade;
			//formattedTrade.market = String(trade.base) + "_" + String(trade.rel);
			formattedTrade.base = String(trade.base);
			formattedTrade.quote = String(trade.rel);
			formattedTrade.price = trade.orderprice;
			formattedTrade.volume = trade.ordervolume;
			formattedTrade.exchange = trade.exchange;
			
			formattedTrades.push(formattedTrade);
		}
		
		return formattedTrades;
	}
	
	function buildTradesequenceTable(order)
	{
		var trades = formatTrades(order.trades);
		

		var keys = "type base quote price volume exchange".split(" ");
		var rows = IDEX.buildTableRows(IDEX.objToList(trades, keys), "table");

		$tradesequenceTable.find("tbody").append(rows);
	}
	

	
	/*
	function checkPerc(perc, minperc)
	{
		var text = "";
		var isnum = !isNaN(perc);
		
		if (isnum && perc.length)
		{
			if (perc.search("\\.") != -1)
			{
				text = "Perc must be a whole number.";
			}
			else
			{
				if (perc < minperc)
				{
					text = "Perc must be greater than the order's min perc.";
				}
				else if (perc > 100)
				{
					text = "Perc must be less than 100.";
				}
				else
				{
					
				}
			}
		}
		else
		{
			text = "Invalid perc.";
		}
		
		return text;
	}

	
	$("input.conf-perc").on("keyup", function() 
	{
		var perc = $(this).val();
		var amount = (perc/100) * IDEX.user.pendingOrder['volume'];
		var total = Number(IDEX.user.pendingOrder['price'])*Number(amount);
		
		$(".conf-amount").val(amount);
		$(".conf-total").val(total.toFixed(8));
		
		var check = checkPerc(perc, IDEX.user.pendingOrder['minperc']);
		
		if (!check.length)
		{
			$makeofferPopupConfirm.removeClass('disabled');
			$(".conf-jumbotron").hide().find("div").empty();
		}
		else
		{
			$makeofferPopupConfirm.addClass('disabled');
			$(".conf-jumbotron").show().find("div").text(check);
		}
	});
	
	*/

	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));


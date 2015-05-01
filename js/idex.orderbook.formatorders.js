

var IDEX = (function(IDEX, $, undefined)
{

	IDEX.Orderbook.prototype.formatOrderbookData = function(orderbookData)
	{
		formatOrderData(orderbookData.bids)
		formatOrderData(orderbookData.asks)
		console.log(orderbookData)
		formatOrderNumbers(orderbookData.bids, orderbookData.asks)
		
		this.groupedBids = groupOrders(orderbookData.bids.slice(), this.currentOrderbook.bids.slice());
		this.groupedAsks = groupOrders(orderbookData.asks.slice(), this.currentOrderbook.asks.slice());
		
		formatNewOrders(this.groupedBids.newOrders)
		formatNewOrders(this.groupedAsks.newOrders)
	}

	
	function formatOrderData(orders)
	{
		orders.sort(IDEX.compareProp('price')).reverse();
		
		var len = orders.length;
		var runningTotal = 0;
		var isAsk = len && orders[0].askoffer;
		var loopStart = isAsk ? len - 1 : 0;
		var loopEnd = isAsk ? -1 : len;
		var loopInc = isAsk ? -1 : 1;

		for (var i = loopStart; i != loopEnd; i += loopInc)
		{
			var order = orders[i];
			order['index'] = i;
			order.price = IDEX.toSatoshi(order.price).toFixed(8);
			order.volume = IDEX.toSatoshi(order.volume).toFixed(6);
			order['total'] = IDEX.toSatoshi(order.price*order.volume).toFixed(6);
			runningTotal = (Number(runningTotal) + Number(order['total'])).toFixed(6);
			order['sum'] = runningTotal;
			//console.log(order.price);
			//console.log(runningTotal)
		}
	}
	
	
	function formatOrderNumbers(newBids, newAsks)
	{
		var keys = ['price', 'volume', 'total', 'sum'];
		var len = newBids.length;
		var allBidNumbers = IDEX.getListObjVals(newBids, keys);
		var allAskNumbers = IDEX.getListObjVals(newAsks, keys);

		for (var i = 0; i < keys.length; i++)
		{
			var key = keys[i];
			var allNumbers = IDEX.formatNumberWidth(allBidNumbers[key].concat(allAskNumbers[key]), 6);
			var asks = allNumbers.splice(len);
			var bids = allNumbers;
			
			newBids = IDEX.setListObjVals(newBids, key, bids)
			newAsks = IDEX.setListObjVals(newAsks, key, asks)
		}

	}


	function groupOrders(orders, currentOrders)
	{
		var oldOrders = [];
		var newOrders = [];
		var expiredOrders = [];
		
		for (var i = 0; i < orders.length; i++)
		{
			var order = orders[i];
			var isNew = true;

			for (var j = 0; j < currentOrders.length; j++)
			{
				var currentOrder = currentOrders[j];

				if (IDEX.compObjs(order, currentOrder, ['quoteid']))
				{
					order['index'] = currentOrders[j]['index'];
					//console.log(order['index'])
					oldOrders.push(order);
					currentOrders.splice(j, 1);
					isNew = false;
					break;
				}
			}
			
			if (isNew)
				newOrders.push(order);
		}

		expiredOrders = currentOrders;
		
		return {'expiredOrders':expiredOrders, 'newOrders':newOrders, 'oldOrders':oldOrders};
	}


	function formatNewOrders(newOrders)
	{	
		for (var i = 0; i < newOrders.length; i++)
		{
			var order = newOrders[i]
			var trString = IDEX.buildTableRows([[order.price, order.volume, order.total, order.sum]], "span");
			var trClasses = (order['exchange'] == "nxtae_nxtae" || order['exchange'] == "nxtae") ? "virtual tooltip" : "tooltip";
			trClasses += (order['offerNXT'] == IDEX.account.nxtID) ? " own-order" : "";
			trClasses += IDEX.isOrderbookExpanded ? " order-row-expand" : "";
			trString = IDEX.addElClass(trString, trClasses);
			trString = $(trString).find("span").each(function(index, e)
			{
				var extraClasses = "order-col-extra";
				if (index == 2 || index == 3)
				{
					if (IDEX.isOrderbookExpanded)
						extraClasses += " extra-show";
					$(this).addClass(extraClasses);
				}
			}).parent()[0].outerHTML;
			order['row'] = trString;
		}	
	}
	
	
	function orderTooltip(row, rowData)
	{
		var nxt = "";
		var exchange = rowData['exchange']
		
		if (exchange == "InstantDEX" || exchange == "nxtae")
			nxt = IDEX.toRS(rowData['NXT'])
		else
			return row
		
		return $(row).tooltipster(
		{
			'minWidth':240,
			'content':$("<div style='display:block'><img src='img/user.png' height='15px' width='20px'></img> "+ nxt +"</div>"),
			/*'functionBefore':function(origin, continueTooltip)
			{
				$(this).tooltipster('option','minWidth', 300)
				$(this).tooltipster('reposition')
				continueTooltip();
			}*/
		})
	}
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
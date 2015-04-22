
var IDEX = (function(IDEX, $, undefined) {



var isStoppingOrderbook = false;
var orderbookAsync = false;
var orderbookTimeout;
var orderbookInit = true;	


function Order(obj) 
{
	IDEX.constructFromObject(this, obj);
};


IDEX.loadOrderbook = function(baseid, relid)
{
	IDEX.curBase = IDEX.getAssetInfo("asset", baseid);
	IDEX.curRel = IDEX.getAssetInfo("asset", relid);
	emptyOrderbook(IDEX.curBase.name+"/"+IDEX.curRel.name, "Loading...");
	IDEX.updateBalanceBox();
	$("#placeBidForm").trigger("reset");
	$("#placeAskForm").trigger("reset");
	IDEX.killChart();
	IDEX.makeChart({'baseid':IDEX.curBase.asset, 'relid':IDEX.curRel.asset, 'basename':IDEX.curBase.name, 'relname':IDEX.curRel.name, 'isNew':true});

	IDEX.currentOpenOrders();
	if (!isStoppingOrderbook)
	{
		IDEX.stopPollingOrderbook();
	}
}


IDEX.stopPollingOrderbook = function()
{
	if (orderbookAsync) 
	{
		isStoppingOrderbook = true;
        setTimeout(IDEX.stopPollingOrderbook, 100);
		return false;
    }
	IDEX.updateScrollbar(false)
	isStoppingOrderbook = false;
	clearTimeout(orderbookTimeout);
	IDEX.currentOrderbook = new IDEX.Orderbook();
	$(".empty-orderbook").hide();
	pollOrderbook(1);
}


function emptyOrderbook(currPair, price)
{
	price = typeof price === "undefined" ? '0.0' : price
	$("#currPair .order-text").html(currPair);
	$("#buyBook .twrap").empty();
	$("#sellBook .twrap").empty();
	$("#currLast .order-text").empty().html(price);
}

/*
IDEX.displayBoth = function()
{
	IDEX.chartInit = new $.Deferred()
	IDEX.orderbookInit = new $.Deferred()
	$.when(IDEX.orderbookInit, IDEX.chartInit).always(function(a)
	{
		console.log(a)
		$("#chartLoading").hide();
		IDEX.orderbookInit = false;
		IDEX.chartInit = false;
	})
	if (IDEX.orderbookInit && IDEX.orderbookInit.state() == "pending")
		IDEX.orderbookInit.resolve();
}*/


IDEX.refreshOrderbook = function()
{
	if (!orderbookAsync)
	{
		clearTimeout(orderbookTimeout);
		pollOrderbook(1);
	}
}

function pollOrderbook(timeout)
{
	orderbookTimeout = setTimeout(function() 
	{
		var params = {'requestType':"orderbook", 'baseid':IDEX.curBase.asset, 'relid':IDEX.curRel.asset, 'allfields':1, 'maxdepth':25};
		params['showall'] = 0
		orderbookAsync = true;
		console.log('Waiting for orderbook');
		IDEX.sendPost(params).done(function(orderbookData)
		{
			console.log(orderbookData)
			console.log('Finished waiting for orderbook');
			orderbookAsync = false;
			IDEX.currentOpenOrders();
			if (!isStoppingOrderbook)
			{
				if (!("error" in orderbookData))
				{
					orderbookData['bids'].sort(IDEX.compareProp('price')).reverse();
					orderbookData['asks'].sort(IDEX.compareProp('price')).reverse();
					updateOrderbook(orderbookData);
				}
				else
				{
					IDEX.updateScrollbar(false);
					$("#currLast .order-text").text("0.0");
					$(".twrap").empty();
					$(".empty-orderbook").show();
				}
				pollOrderbook(10000);
			}
		}).fail(function(data)
		{
			$(".empty-orderbook").hide()
			emptyOrderbook(IDEX.curBase.name+"/"+IDEX.curRel.name, "Error loading orderbook");
			orderbookAsync = false;
		})
	}, timeout)
}


function formatOrderData(orders)
{
	var len = orders.length
	var runningTotal = 0;
	var isAsk = len && orders[0].askoffer
	var loopStart = isAsk ? len - 1 : 0;
	var loopEnd = isAsk ? -1 : len;
	var loopInc = isAsk ? -1 : 1;

	for (var i = loopStart; i != loopEnd; i += loopInc)
	{
		var order = orders[i]
		order['index'] = i;
		order.price = IDEX.toSatoshi(order.price).toFixed(8);
		order.volume = IDEX.toSatoshi(order.volume).toFixed(6);
		order['total'] = IDEX.toSatoshi(order.price*order.volume).toFixed(6);
		runningTotal = IDEX.toSatoshi(Number(runningTotal) + Number(order['total'])).toFixed(6);
		order['sum'] = runningTotal;
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
				order['index'] = currentOrders[j]['index']
				oldOrders.push(order);
				currentOrders.splice(j, 1);
				isNew = false;
				break;
			}
		}
		
		if (isNew)
			newOrders.push(order)
	}

	expiredOrders = currentOrders;

	return {'expiredOrders':expiredOrders, 'newOrders':newOrders, 'oldOrders':oldOrders};
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
		var decimals = -1;
		if (key == "price")
			decimals = IDEX.curRel.decimals;
		else if (key == "volume")
			decimals = IDEX.curBase.decimals;
		var allNumbers = IDEX.formatNumberWidth(allBidNumbers[key].concat(allAskNumbers[key]), decimals);
		var asks = allNumbers.splice(len);
		var bids = allNumbers;
		newBids = IDEX.setListObjVals(newBids, key, bids)
		newAsks = IDEX.setListObjVals(newAsks, key, asks)
		//var bigggestWidth = getBiggestWidth(newBids[key], newAsks[key])	
	}

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
		}).parent()[0].outerHTML
		order['row'] = trString;
	}	
}


function updateOrderbook(orderbookData)
{
	formatOrderData(orderbookData.bids)
	formatOrderData(orderbookData.asks)
	formatOrderNumbers(orderbookData.bids, orderbookData.asks)
	formatNewOrders(orderbookData.bids)
	formatNewOrders(orderbookData.asks)
	
	var lastPrice = orderbookData.bids.length ? orderbookData.bids[0].price : 0;
	var bidData = groupOrders(orderbookData.bids.slice(), IDEX.currentOrderbook.bids.slice());
	var askData = groupOrders(orderbookData.asks.slice(), IDEX.currentOrderbook.asks.slice());

	updateOrders($("#buyBook .twrap"), bidData);
	updateOrders($("#sellBook .twrap"), askData);
	animateOrderbook();
	IDEX.currentOrderbook = new IDEX.Orderbook(orderbookData);

	$("#currLast .order-text").text(Number(lastPrice).toFixed(8));
}


function animateOrderbook()
{
	$(".newrow").wrapInner("<div style='display:none; background-color:#333;' />").parent().find('.order-row > div').slideDown(400, function()
	{
		$(this).replaceWith($(this).contents());
		IDEX.updateScrollbar(false)
	})
	$(".expiredRow").wrapInner("<div style='display:block; color:#A4A4A4; background-color:#333;' />").parent().find('.order-row > div').slideUp(400, function()
	{
		$(this).parent().remove();
		IDEX.updateScrollbar(false)
	})

	$(".newrow").removeClass("newrow");
	$(".expiredRow").removeClass("expiredRow");
}


function updateOrders($book, orderData)
{
	if (!orderData.newOrders.length && !orderData.oldOrders.length)
		$book.parent().find(".empty-orderbook").show()
	else
		$book.parent().find(".empty-orderbook").hide()	
		
	if (!($book.find(".order-row").length))
	{
		for (var i = 0; i < orderData.newOrders.length; ++i)
		{
			$book.append(orderTooltip(orderData.newOrders[i]['row'], orderData.newOrders[i]))
		}
		
		IDEX.updateScrollbar(true);
	}
	else
	{
		$book.find(".order-row").each(function(index, element)
		{
			var rowData = IDEX.getRowData($(this), index)
			
			updateSum($(this), index, orderData, rowData);
			removeOrders($(this), orderData, index);
			addNewOrders($(this), orderData, rowData, index);
			
		})
	}
}


function updateSum($row, index, orderData, rowData)
{

		for (var i = 0; i < orderData['oldOrders'].length; i++)
		{
			var oldOrder = orderData['oldOrders'][i];
			//console.log(String(index)+"   "+String(oldOrder['index']))
			//console.log(oldOrder)
			if (index == oldOrder['index'] && (Number(oldOrder['sum']) != Number(rowData['sum'])))
			{
				//console.log(String(oldOrder['sum'])+"   "+String(rowData['sum']))
				$row.find(".order-col").eq(3).text(oldOrder.sum);
			}
		}
	
	//console.log(orderData['oldOrders'])
}


function removeOrders($row, orderData, index)
{
	for (var i = 0; i < orderData['expiredOrders'].length; i++)
	{
		var expiredOrder = orderData['expiredOrders'][i];
		
		if (index == expiredOrder['index'])
			$row.addClass("expiredRow");
	}
}


function addNewOrders($row, orderData, rowData, index)
{
	for (var i = 0; i < orderData.newOrders.length; i++)
	{
		var newOrder = orderData.newOrders[i];
		var trString = IDEX.addElClass(orderData.newOrders[i]['row'], "newrow");
		trString = orderTooltip(trString, newOrder)

		if (Number(newOrder.price) < Number(rowData.price))
		{
			var $sib = $row;
			
			while ($sib.next() && $sib.next().hasClass("newrow"))
				$sib = $sib.next();
			
			var sibData = IDEX.getRowData($sib, index+1)
			
			if (!sibData || Number(newOrder.price) >= Number(sibData.price))
				$sib.after($(trString));
			else
				break;
		}
		else
		{
			$row.before($(trString));
		}
		
		orderData['newOrders'].splice(i,1);
		--i;
	}
}


function expandOrders()
{
	$book.find(".order-row").each(function(index, element)
	{
		var tdStrings;
		var rowData = IDEX.getRowData($(this), index)
		removeOrders($(this), orderData, index);
		addNewOrders($(this), orderData, rowData, index);
	})
}


function orderTooltip(row, rowData)
{
	var nxt = "";
	var exchange = rowData['exchange']
	
	if (exchange == "InstantDEX" || exchange == "nxtae")
		nxt = IDEX.toRS(rowData['NXT'])
	else
		return row
	
	return $(row).tooltipster({
		'minWidth':240,
		'content':$("<div style='display:block'><img src='img/user.png' height='15px' width='20px'></img> "+ nxt +"</div>"),
		/*'functionBefore':function(origin, continueTooltip)
		{
			$(this).tooltipster('option','minWidth', 300)
			$(this).tooltipster('reposition')
			continueTooltip();
		}*/
	})
	
	/*$(this).tooltipster({
		'content':$("<span>"+ rowData['exchange'] +"</span>"),
		'multiple':true,
		'position':'bottom'
	})*/

}

	return IDEX;
	
}(IDEX || {}, jQuery));
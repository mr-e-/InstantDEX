
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
	
	isStoppingOrderbook = false;
	clearTimeout(orderbookTimeout);
	IDEX.currentOrderbook = new IDEX.Orderbook();
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
		params['showall'] = 1
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
					$("#currLast .order-text").text("0.0");
					$(".twrap").empty();
					$(".empty-orderbook").show();
				}
				pollOrderbook(3000);
			}
		}).fail(function(data)
		{
			$(".empty-orderbook").hide()
			emptyOrderbook(IDEX.curBase.name+"/"+IDEX.curRel.name, "Error loading orderbook");
			orderbookAsync = false;
		})
	}, timeout)
}


function groupOrders(orders, currentOrders)
{
	var oldOrders = [];
	var newOrders = [];
	var expiredOrders = [];
	
	for (var i = 0; i < currentOrders.length; ++i)
		currentOrders[i]['index'] = i;
	
	for (var i = 0; i < orders.length; i++)
	{
		var order = orders[i];
		var isNew = true;

		for (var j = 0; j < currentOrders.length; j++)
		{
			var currentOrder = currentOrders[j];

			if (IDEX.compObjs(order, currentOrder, ['quoteid']))
			{
				oldOrders.push(order);
				currentOrders.splice(j, 1);
				isNew = false;
				break;
			}
		}

		if (isNew)
		{
			order.price = IDEX.toSatoshi(order.price).toFixed(8);
			order.volume = IDEX.toSatoshi(order.volume).toFixed(6);
			var trString = IDEX.buildTableRows([[order.price, order.volume]], "span");
			var trClasses = (order['exchange'] == "nxtae_nxtae" || order['exchange'] == "nxtae") ? "virtual tooltip" : "tooltip";
			trClasses += (order['offerNXT'] == IDEX.account.nxtID) ? " own-order" : "";
			trString = IDEX.addElClass(trString, trClasses);
			order['row'] = trString;
			newOrders.push(order);
		}
	}

	expiredOrders = currentOrders;

	return {'expiredOrders':expiredOrders, 'newOrders':newOrders, 'oldOrders':oldOrders};
}


function updateOrderbook(orderbookData)
{
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
	$(".newrow").wrapInner("<div style='display:none; background-color:#333;' />").parent().find('.order-row > div').slideDown(700, function()
	{
		$(this).replaceWith($(this).contents());
	})
	$(".expiredRow").wrapInner("<div style='display:block; color:#A4A4A4; background-color:#333;' />").parent().find('.order-row > div').slideUp(700, function()
	{
		$(this).parent().remove();
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
	}
	else
	{
		$book.find(".order-row").each(function(index, element)
		{
			var rowData = IDEX.getRowData($(this), index)
			removeOrders($(this), orderData, index);
			addNewOrders($(this), orderData, rowData, index);
		})
	}
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

		if (newOrder.price < rowData.price)
		{
			var $sib = $row;
			
			while ($sib.next() && $sib.next().hasClass("newrow"))
				$sib = $sib.next();
			
			var sibData = IDEX.getRowData($sib, index+1)
			
			if (!sibData || newOrder.price >= sibData.price)
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

function orderTooltip(row, rowData)
{
	var nxt = "";
	var exchange = rowData['exchange']
	
	if (exchange == "InstantDEX" || exchange == "nxtae")
		nxt = IDEX.toRS(rowData['NXT'])
	else
		return row
	
	return $(row).tooltipster({
		'content':$("<span><img src='img/user.png' height='15px' width='20px'></img> "+ nxt +"</span>")
	})
	
	/*$(this).tooltipster({
		'content':$("<span>"+ rowData['exchange'] +"</span>"),
		'multiple':true,
		'position':'bottom'
	})*/

}

	return IDEX;
	
}(IDEX || {}, jQuery));

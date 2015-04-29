
var IDEX = (function(IDEX, $, undefined)
{

	var isStoppingOrderbook = false;
	var orderbookAsync = false;
	var orderbookTimeout;
	var orderbookInit = true;
	
	/*
	IDEX.Orderbook = function(obj) 
	{	
		this.isStoppingOrderbook = false;
		this.orderbookAsync = false;
		this.orderbookTimeout;
		this.orderbookInit;
		
		this.currentOrderbook;
		this.newOrderbook;
		

		IDEX.constructFromObject(this, obj);
	};
	*/

	IDEX.loadOrderbook = function()
	{
		emptyOrderbook(IDEX.curBase.name+"/"+IDEX.curRel.name, "Loading...");
		
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

	IDEX.refreshOrderbook = function()
	{
		if (!orderbookAsync)
		{
			clearTimeout(orderbookTimeout);
			pollOrderbook(1);
		}
	}

	function emptyOrderbook(currPair, price)
	{
		price = typeof price === "undefined" ? '0.0' : price
		$("#currPair .order-text").html(currPair);
		$("#buyBook .twrap").empty();
		$("#sellBook .twrap").empty();
		$("#currLast .order-text").empty().html(price);
	}
	

	function pollOrderbook(timeout)
	{
		orderbookTimeout = setTimeout(function() 
		{
			var params = {'requestType':"orderbook", 'baseid':IDEX.curBase.assetID, 'relid':IDEX.curRel.assetID, 'allfields':1};
			params['maxdepth'] = 25;
			params['showall'] = 0;
			
			orderbookAsync = true;
			console.log('Waiting for orderbook');
			
			IDEX.sendPost(params).done(function(orderbookData)
			{
				console.log('Finished waiting for orderbook');
				orderbookAsync = false;
				console.log(orderbookData);
				
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
					pollOrderbook(30000);
				}
				
			}).fail(function(data)
			{
				$(".empty-orderbook").hide();
				emptyOrderbook(IDEX.curBase.name+"/"+IDEX.curRel.name, "Error loading orderbook");
				orderbookAsync = false;
			})
			
		}, timeout)
	}


	function formatOrderData(orders)
	{
		var len = orders.length;
		var runningTotal = 0;
		var isAsk = len && orders[0].askoffer;
		var loopStart = isAsk ? len - 1 : 0;
		var loopEnd = isAsk ? -1 : len;
		var loopInc = isAsk ? -1 : 1;

		for (var i = loopStart; i != loopEnd; i += loopInc)
		{
			var order = orders[i];
			orders[i]['index'] = i;
			order.price = IDEX.toSatoshi(order.price).toFixed(8);
			order.volume = IDEX.toSatoshi(order.volume).toFixed(6);
			order['total'] = IDEX.toSatoshi(order.price*order.volume).toFixed(6);
			runningTotal = (Number(runningTotal) + Number(order['total'])).toFixed(6);
			order['sum'] = runningTotal;
			//console.log(runningTotal)
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


	function updateOrderbook(orderbookData)
	{
		if (!orderData.newOrders.length && !orderData.oldOrders.length)
			$book.parent().find(".empty-orderbook").show()
		else
			$book.parent().find(".empty-orderbook").hide()	
		
		formatOrderData(orderbookData.bids)
		formatOrderData(orderbookData.asks)
		formatOrderNumbers(orderbookData.bids, orderbookData.asks)
		
		var lastPrice = orderbookData.bids.length ? orderbookData.bids[0].price : 0;
		var bidData = groupOrders(orderbookData.bids.slice(), IDEX.currentOrderbook.bids.slice());
		var askData = groupOrders(orderbookData.asks.slice(), IDEX.currentOrderbook.asks.slice());
		
		formatNewOrders(bidData.newOrders)
		formatNewOrders(askData.newOrders)
		
		updateOrders($("#buyBook .twrap"), bidData);
		updateOrders($("#sellBook .twrap"), askData);
		animateOrderbook();
		IDEX.currentOrderbook = new IDEX.Orderbook(orderbookData);

		$("#currLast .order-text").text(Number(lastPrice).toFixed(8));
	}


	function animateOrderbook()
	{
		$(".twrap").find(".order-row.expiredRow").remove();
		IDEX.updateScrollbar(false)
		$(".newrow").removeClass("newrow");
	}


	function updateOrders($book, orderData)
	{		
		if (!($book.find(".order-row").length))
		{
			for (var i = 0; i < orderData.newOrders.length; i++)
				$book.append(orderTooltip(orderData.newOrders[i]['row'], orderData.newOrders[i]))

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
				//console.log(oldOrder)
				//console.log(String(oldOrder['sum'])+"   "+String(rowData['sum']))
				$row.find(".order-col").eq(3).text(String(oldOrder.sum));
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
			{
				$row.addClass("expiredRow");
			}
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

	
	
	IDEX.getRowData = function($row, index)
	{
		var isAsk = ($row.closest(".bookname").attr('id') == "buyBook") ? "bids" : "asks";
		var rowData = index >= IDEX.orderbook[isAsk].length ? null : IDEX.orderbook[isAsk][index];

		return rowData;
	}
	
	

	$("#buyBook, #sellBook").on("click", ".order-row.own-order", function()
	{
		var order = IDEX.getRowData($(this), $(this).index());
		console.log(order);
	})
	
	
	$("#buyBook, #sellBook").on("click", ".order-row:not(.own-order):not(.expiredRow)", function(e)
	{
		var bookID = $(this).closest(".bookname").attr("id")
		var rowIndex = $(this).index("#"+bookID+" .order-row")
		var order = IDEX.getRowData($(this), rowIndex);
		var isAsk = order.askoffer ? "Bid" : "Ask";
		var tab = order.askoffer ? "1" : "2";
		IDEX.pendingOrder = order;
		console.log(order);

		confirmPopup($("#"+$("#tempBuyClick").data("modal")), order);
		$("#tempBuyClick").trigger("click");

		$("#place"+isAsk+"Price").val(order.price);
		$("#place"+isAsk+"Amount").val(order.volume).trigger("keyup");
		$(".order-tabs li[data-tab='"+tab+"'] span").trigger("mousedown").trigger("mouseup")
	})

	

	
	return IDEX;
	
}(IDEX || {}, jQuery));
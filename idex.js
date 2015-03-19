
var IDEX = (function(IDEX, $, undefined) {

IDEX.curBase;
IDEX.curRel;
var snURL = "http://127.0.0.1:7778";
var nxtURL = "http://127.0.0.1:7876/nxt?";
var isPollingOrderbook = false;
var SATOSHI = 10000000;
var rs = "";
var orderbookTimeout;

var currentOrderbook = 
{
	"NXT":"",
	"asks":[],
	"baseid":"",
	"bids":[],
	"obookid":"",
	"pair":"",
	"relid":""
};

var postParams = 
{
	"orderbook":["baseid","relid","allfields"],
	"allorderbooks":[],
	"placebid":["baseid","relid","price","volume"],
	"placeask":["baseid","relid","price","volume"],
	"openorders":[],
	"tradehistory":["timestamp"],
	"cancelorder":["quoteid"]
};


function sendPost(params, url) 
{
	var dfd = new $.Deferred();
	if (!url)
	{
		params = JSON.stringify(params);
	}

	$.ajax
	({
	  type: "POST",
	  url: (typeof url === 'undefined') ? snURL : nxtURL,
	  data: params,
	  //contentType: 'application/json'
	}).done(function(data)
	{
		data = $.parseJSON(data)
		dfd.resolve(data);
	}).fail(function(data)
	{
		dfd.resolve({'error':'error'});
	})

	return dfd.promise()
}


//$("#icoLog").on("click", getVirtualOrderbook)
function getVirtualOrderbook()
{
	var d1 = new $.Deferred();
    var d2 = new $.Deferred();
	var dfd = new $.Deferred();
	
	$.when(d1, d2).done(function(baseOrderbook, relOrderbook)
	{
		var rHighestBid = relOrderbook.bids[0].priceNQT
		var rLowestAsk = relOrderbook.asks[0].priceNQT 
		var baseDecimals = IDEX.curBase.decimals
		var relDecimals = IDEX.curRel.decimals
		
		toVirtual(baseOrderbook.asks, rHighestBid, baseDecimals)
		toVirtual(baseOrderbook.bids, rLowestAsk, baseDecimals)

		//console.log(String(bLowestAsk) + "   " + String(rLowestAsk))
		//console.log(String(bHighestBid) + "   " + String(rHighestBid))
		dfd.resolve(baseOrderbook)
	})
	
	getOrderbook(IDEX.curBase.asset).done(function(baseData)
	{
		d1.resolve(baseData)
	})
	
	getOrderbook(IDEX.curRel.asset).done(function(relData)
	{
		d2.resolve(relData)
	})
	
	return dfd.promise()
}


function toVirtual(orders, relSafePrice, decimals)
{
	for (var i = 0; i < orders.length; ++i)
	{
		orders[i]['price'] = (orders[i].priceNQT)/relSafePrice
		orders[i]['volume'] = (orders[i].quantityQNT/Math.pow(10,decimals))*orders[i]['price']
		orders[i]['exchange'] = "nxtAE"
		orders[i]['other'] = orders[i]['account']
		//console.log(String(virtPrice) + "  " + String(virtAmount))
	}
}


function getOrderbook(asset)
{
	var d1 = new $.Deferred();
    var d2 = new $.Deferred();
	var dfd = new $.Deferred();

	$.when(d1, d2).done(function(bids, asks)
	{
		dfd.resolve({'bids':bids.bidOrders, 'asks':asks.askOrders})
	})
	
	sendPost({"requestType":"getBidOrders","asset":String(asset)}, 1).done(function(bidData)
	{
		d1.resolve(bidData)
	})
	
	sendPost({"requestType":"getAskOrders","asset":String(asset)}, 1).done(function(askData)
	{
		d2.resolve(askData)
	})
	
	return dfd.promise()
}


function getRS()
{
    var dfd = new $.Deferred();
    
	var obj = {"requestType":"getpeers"}
	sendPost(obj, 1).done(function(data)
	{
		rs = data['peers'][1]['RS']
		dfd.resolve(rs)
	})

	return dfd.promise()
}


function getAccountAssets()
{
    var dfd = new $.Deferred();
    
	var obj = {"requestType":"getAccountAssets","account":rs}
	sendPost(obj).done(function(data)
	{
		console.log(data)
	})

	return dfd.promise()
}


//$("#icoLog").on("click", function()

function getAssetInfo(assets)
{
    var dfd = new $.Deferred();
    var dataStr = "requestType=getAssets&"
	
	for (var i = 0; i < assets.length; ++i)
	{
		dataStr += "assets="+String(assets[i])+"&"
	}

	sendPost(dataStr, 1).done(function(data)
	{
		console.log(data)
		dfd.resolve(data)
	})

	return dfd.promise()
}


/*var obj = {"requestType":"getAssets","assets":tableData[0]['assetA'],"assets":tableData[0]['assetB']}
sendNXTRequest(obj).done(function(data)
{
	var assetList = parseAssetNames(data)
	
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['base'] = assetList[tableData[i]['assetA']]
		tableData[i]['rel'] = assetList[tableData[i]['assetB']]
	}
	
	tableData = formatPairName(tableData, "base", "rel")
	row = buildTableRows(objToList(tableData, keys))	
	$modalTable.find("tbody").empty().append(row)
})*/
		
					
function parseAssetNames(data)
{
	var assetList = {}
	
	if ("assets" in data)
	{
		for (var i = 0; i < data.length; ++i)
		{
			assetList[data[i]['asset']] = data[i]['name']
		}
	}
	
	return assetList
}


$("#openOrders table tbody").on("click", "tr td.cancelOrder", function(e)
{
	var quoteid = $(this).data("quoteid")

	cancelOrder(quoteid).done(function(data)
	{
		$("#icoOrders").trigger("click");
	})
})


$(".popupLoad").on("click", function(e)
{
	var $thisScope = $(this)
	var params = extractPostPayload($(this))
	if (params['requestType'] == "tradehistory")
	{
		params['timestamp'] = 0;
	}

	sendPost(params).done(function(data)
	{
		var row = ""
		var modal = "#" + $thisScope.data("modal")
		var $modalTable = $(modal + " table")
		var keys = $modalTable.find("thead").data("keys").split(" ")

		if (keys[0] in data)
		{
			var method = params['requestType']
			var tableData = data[keys[0]]
			keys.splice(0,1)

			if (method == "openorders")
			{
				tableData = formatPairName(tableData, "base", "rel")
				//<td data-quoteid='"+quoteid+"' class='cancelOrder'>CANCEL</td>
			}
			else if (method ==	"allorderbooks")
			{
				tableData = formatPairName(tableData, "base", "rel")
			}
			else if (method == "tradehistory")
			{
				if ("rawtrades" in tableData ) 
				{
					tableData = tableData['rawtrades']
					tableData = formatPairName(tableData, "assetA", "assetB")
				}
			}
			
			row = buildTableRows(objToList(tableData, keys))	
		}
		$modalTable.find("tbody").empty().append(row)
	})
})


function formatPairName(tableData, baseName, relName)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['market'] = tableData[i][baseName] + "/" + tableData[i][relName]
	}

	return tableData
}


function getFormData($form) 
{
	var serialized = $form.serializeArray();
	var data = {};

	for (var s in serialized) 
	{
		data[serialized[s]['name']] = serialized[s]['value']
	}

	return data;
}


function extractPostPayload($element)
{
	var params = {}

	if ($element.is("button"))
	{
		var $form = $("#" + $element.data("form"))
		params = getFormData($form)
	}
	else
	{
		params = $element.data()
	}

	params = buildPostPayload($element.data("method"), params)

	return params
}


function buildPostPayload(method, data)
{
	var params = {}

	for (var i = 0; i < postParams[method].length; ++i)
	{
		for (var key in data)
		{
			if (key == postParams[method][i])
			{
				params[key] = data[key]
				break
			}
		}
	}

	params['requestType'] = method

	return params
}


$(".idex-submit").on("click", function()
{
	var $form = $("#" + $(this).data("form"))
	var params = extractPostPayload($(this))
	var method = params['requestType']

	
	if (method == "orderbook")
	{
		params['allfields'] = 1
		getAssetInfo([params['baseid'], params['relid']]).done(function(data)
		{
			var assets = data['assets']
			IDEX.curBase = assets[0]
			IDEX.curRel = assets[1]
			
			IDEX.killChart()
			IDEX.makeChart({'dataSite':'skynet','baseid':params['baseid']})
			
			if (isPollingOrderbook)
			{
				stopPollOrderbook()
			}
			
			emptyOrderbook(IDEX.curBase.name+"/"+IDEX.curRel.name)
			pollOrderbook(1)
		})
	}
	else if (method == "placebid" || method == "placeask")
	{
		params['baseid'] = IDEX.curBase.asset
		params['relid'] = IDEX.curRel.asset
		
		sendPost(params).done(function(data)
		{
			if ('result' in data && data['result'])
			{
			}
			else
			{
			}
		})
	}
	else if (method == "cancelorder")
	{
		sendPost(params).done(function(data)
		{
			$("#modal-04").removeClass("md-show")
		})
	}
	else
	{
		sendPost(params)
	}

	
	$("#modal-04").removeClass("md-show")
	if ($form)
	{
		$form.trigger("reset")
	}
})


function pollOrderbook(timeout)
{
	isPollingOrderbook = true

	orderbookTimeout = setTimeout(function() 
	{
		var d1 = new $.Deferred();
		var d2 = new $.Deferred();
		var dfd = new $.Deferred();
		var params = {"requestType":"orderbook","baseid":IDEX.curBase.asset,"relid":IDEX.curRel.asset,"allfields":1}
		var orderbookData = {};

		$.when(d1, d2).done(function(virtBook, idexBook)
		{
			if ('error' in idexBook)
			{
				orderbookData = virtBook;
			}
			else
			{
				orderbookData['bids'] = combineOrders(virtBook.bids, idexBook.bids)
				orderbookData['asks'] = combineOrders(virtBook.asks, idexBook.asks)
				orderbookData['bids'].reverse()
			}
			
			console.log(orderbookData)
			updateOrderbook(orderbookData);
			pollOrderbook(3000)
		})
		getVirtualOrderbook().done(function(virtBook)
		{
			d1.resolve(virtBook)
		})
		
		sendPost(params).done(function(idexBook)
		{
			d2.resolve(idexBook)
		})

	}, timeout)
}


function compare(a, b) 
{
	if (a.price < b.price)
		return -1;
	if (a.price > b.price)
		return 1;
	
	return 0;
}


function combineOrders(virtOrders, idexOrders)
{
	var orders = virtOrders

	orders.push.apply(orders, idexOrders)
	console.log(orders)
	orders.sort(compare);
	
	return orders;
}


function stopPollOrderbook()
{
	clearTimeout(orderbookTimeout)
	emptyOrderbook(" ")	
	currentOrderbook = {"NXT":"","asks":[],"baseid":"","bids":[],"obookid":"","pair":"","relid":""};
	isPollingOrderbook = false
}


function updateOrderbook(orderbookData)
{

	var lastPrice = orderbookData['bids'].length ? orderbookData['bids'][0]['price'] : 0
	var bidData = groupOrders(orderbookData['bids'], currentOrderbook['bids'])
	var askData = groupOrders(orderbookData['asks'], currentOrderbook['asks'])
	askData['newOrders'].reverse()	
	currentOrderbook = orderbookData

	updateOrders($("#buyBook table"), bidData)
	updateOrders($("#sellBook table"), askData)
	animateOrderbook()
	$("#currLast .order-text").empty().html(Number(lastPrice).toFixed(8));
	$("#currPair .order-text").html(orderbookData.pair)

	//if (!orderbookData.bids
		//emptyOrderbook("No bids or asks")
}


function animateOrderbook()
{
	$(".newrow").find('td').wrapInner('<div style="display: none; background-color:#333;" />').parent().find('td > div').slideDown(700, function()
	{
		var $set = $(this)
		$set.replaceWith($set.contents())
	})
	$(".expiredRow").find('td').wrapInner('<div style="display: block; color:#CCC;" />').parent().find('td > div').slideUp(700, function()
	{
		$(this).parent().parent().remove();
	})

	$(".newrow").removeClass("newrow")
	$(".expiredRow").removeClass("expiredRow")
}


function emptyOrderbook(currPair)
{
	$("#currPair .order-text").html(currPair)
	$("#buyBook table tbody").empty()
	$("#sellBook table tbody").empty()
	$("#currLast .order-text").empty().html('0');
}


function buildTableRows(data, rowClass)
{
	var row = ""
	//var rowWrap = typeof rowClass !== "undefined" ? "<tr class='"+rowClass+"'>" : "<tr>";

	for (var i = 0; i < data.length; ++i)
	{
		var td = ""

		for (var j = 0; j < data[i].length; ++j)
		{
			td += "<td>"+data[i][j]+"</td>"
		}
		row += "<tr>"+td+"</tr>"
	}

	return row
}


function objToList(data, keys)
{
	var arr = []

	for (var i = 0; i < data.length; ++i)
	{
		var loopArr = []

		for (var j = 0; j < keys.length; ++j)
		{
			loopArr.push(data[i][keys[j]])
		}
		arr.push(loopArr)
	}

	return arr
}


function updateOrders($book, orderData)
{
	if (!($book.find("tr").length))
	{
		var jqList = []
		for (var i = 0; i < orderData['newOrders'].length; ++i)
		{
			// really bad
			var loopNewOrd = orderData['newOrders'][i]
			var price = toSatoshi(loopNewOrd['price'])
			var volume = toSatoshi(loopNewOrd['volume'])
			var dataKeys = ['price','volume','other','exchange']
			var dataVals = [String(price), String(volume), loopNewOrd['other'], loopNewOrd['exchange']]
			var trString = buildTableRows([[price.toFixed(8)+"&nbsp;&nbsp;", volume.toFixed(8)]])
			var trClasses = (loopNewOrd['exchange'] == "nxtAE") ? "virtual" : ""
			jqList.push(addTableProps($(trString), trClasses, dataKeys , dataVals))
		}

		$book.find("tbody").empty()
		for (var i = 0; i < jqList.length; ++i)
		{
			$book.find("tbody").append(jqList[i]);
		}
	}
	else
	{
		$book.find("tr").each(function(index, element)
		{
			addNewOrders($(element), orderData)
			showClosed($(this), orderData)
			removeOrders($(this), orderData)
		})
	}
}


function toSatoshi(number)
{
	return Math.round(Number(number) * SATOSHI) / SATOSHI 
}


function showClosed($row, orderData)
{
	var keys = ['price','volume','other','exchange']
	var obj = $row.data()

	for (var i = 0; i < orderData['oldOrders'].length; i++)
	{
		if (compObjs(obj, orderData['oldOrders'][i], keys) && orderData['oldOrders'][i]['closed'])
		{
			$row.addClass("closed")
		}
	}
}


function removeOrders($row, orderData)
{
	var keys = ['price','volume','other','exchange']
	var obj = $row.data()
	for (var i = 0; i < orderData['expiredOrders'].length; i++)
	{
		if (compObjs(obj, orderData['expiredOrders'][i], keys))
		{
			$row.addClass("expiredRow");
		}
	}
}


function addTableProps($element, orderClass, dataKeys, dataVals)
{
	$element.each(function()
	{
		$(this).addClass(orderClass)

		for (var i = 0; i < dataKeys.length; ++i)
		{
			$(this).data(dataKeys[i], dataVals[i])
		}
	})	

	return $element
}


function addNewOrders($row, orderData)
{
	for (var i = 0; i < orderData['newOrders'].length; i++)
	{
		var loopNewOrd = orderData['newOrders'][i]
		var price = toSatoshi(loopNewOrd['price'])
		var volume = toSatoshi(loopNewOrd['volume'])
		var dataKeys = ['price','volume','other','exchange']
		var dataVals = [String(price), String(volume), loopNewOrd['other'], loopNewOrd['exchange']]
		var trString = buildTableRows([[price.toFixed(8)+"&nbsp;&nbsp;", volume.toFixed(8)]])
		var trClasses = (loopNewOrd['exchange'] == "nxtAE") ? "newrow virtual" : "newrow"
		var $trElement = addTableProps($(trString), trClasses, dataKeys , dataVals)
		//class = order-row cbutton cbutton--effect-jelena
		
		if (price < Number($row.data('price')))
		{
			var $sib = $row.next()
			if ($sib && $sib.length)
			{
				if (price >= Number($sib.data('price')))
				{
					$row.after($trElement)
					orderData['newOrders'].splice(i,1)
					--i
				}
				else
				{
					break
				}
			}	
			else
			{
				$row.after($trElement)
				orderData['newOrders'].splice(i,1)
				--i
			}
		}
		else
		{
			$row.before($trElement)
			orderData['newOrders'].splice(i,1)
			--i
		}
	}
}


function groupOrders(orders, currentOrders)
{
	var oldOrders = []
	var newOrders = []
	var expiredOrders = []
	var keys = ['price','volume','other','exchange']

	for (var i = 0; i < orders.length; i++)
	{
		var loopOrd = orders[i]
		var isOld = false;

		for (var j = 0; j < currentOrders.length; j++)
		{
			var loopCurOrd = currentOrders[j]
			if (compObjs(loopOrd, loopCurOrd, keys))
			{
				oldOrders.push(loopOrd)
				//expiredOrders.splice(j, 1);
				isOld = true;
				break
			}
		}
		if (!isOld)
		{
			newOrders.push(loopOrd)
		}
	}

	for (var i = 0; i < currentOrders.length; i++)
	{
		var loopCurOrd = currentOrders[i]
		var isAlive = false

		for (var j = 0; j < oldOrders.length; j++)
		{
			var loopOldOrd = oldOrders[j]

			if (compObjs(loopCurOrd, loopOldOrd, keys))
			{
				isAlive = true;
				break
			}
		}
		if (!isAlive)
		{
			expiredOrders.push(loopCurOrd)
		}
	}

	return {"expiredOrders":expiredOrders, "newOrders":newOrders, "oldOrders":oldOrders}
}


function compObjs(aObj, bObj, keys)
{
	var compCount = 0;

	for(var i = 0; i < keys.length; i++)
	{
		if (aObj[keys[i]] == bObj[keys[i]])
		{
			compCount++
		}
	}

	return ((compCount == keys.length) ? true : false)
}


$("input[name='price'], input[name='volume']").on("keyup", function() 
{
	var $form = $(this).closest("form")
	var price = $form.find("input[name='price']").val()
	var amount = $form.find("input[name='volume']").val()
	var total = Number(price)*Number(amount)
	
	$form.find("input[name='total']").val(String(total))
});

	return IDEX;
}(IDEX || {}, jQuery));


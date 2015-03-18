
var IDEX = (function(IDEX, $, undefined) {

var snURL = "http://127.0.0.1:7778";
var nxtURL = "http://127.0.0.1:7876/nxt?";
var isPollingOrderbook = false;
var SATOSHI = 10000000;
var curBase = 0;
var curRel = 0;
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



function sendPost(params) 
{
    var dfd = new $.Deferred();
    params = JSON.stringify(params);
    
	$.ajax
    ({
	  type: "POST",
	  url: snURL,
	  data: params,
      contentType: 'application/json'
	}).done(function(data)
    {
		data = $.parseJSON(data)
        dfd.resolve(data);
    }).fail(function(data)
    {
        dfd.reject(data);
    })

    return dfd.promise()
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
			else if (method ==  "allorderbooks")
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

	if (method == "placebid" || method == "placeask")
	{
		params['baseid'] = curBase
		params['relid'] = curRel
	}
	else if (method == "orderbook")
	{
		params['allfields'] = 1
		var chart = $('#chartArea').highcharts()
		if (chart)
			chart.destroy()
		if (IDEX.ohlcTimeout)
			clearTimeout(IDEX.ohlcTimeout)
		IDEX.makeChart({'dataSite':'skynet','baseid':params['baseid']})
	}

	sendPost(params).done(function(data)
	{
		if (method == "placebid" || method == "placeask")
		{
			if ('result' in data && data['result'])
			{
				// success popup?
				// update orderbook bids/asks?
			}
			else
			{
				// fail popup?
			}
		}
		else if (method == "orderbook")
		{
			curBase = params['baseid']
			curRel = params['relid']
			
			if (!isPollingOrderbook)
			{
				emptyOrderbook("Loading")
				pollOrderbook()
			}
			else
			{
				stopPollOrderbook()
				pollOrderbook(1)
			}
		}
		else if (method == "cancelorder")
		{
			$("#modal-04").removeClass("md-show")
		}
	})

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
		var params = {"requestType":"orderbook","baseid":curBase,"relid":curRel,"allfields":1}

		sendPost(params).done(function(orderbookData)
		{
			updateOrderbook(orderbookData);
			pollOrderbook(3000)
		})
	}, timeout)
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
	if (!('error' in orderbookData))
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
	}
	else
	{
		emptyOrderbook("No bids or asks")
	}
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
			jqList.push(addTableProps($(trString), "", dataKeys , dataVals))
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
		var $trElement = addTableProps($(trString), "newrow", dataKeys , dataVals)
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


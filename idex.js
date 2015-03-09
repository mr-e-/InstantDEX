var curBase;
var curRel;
var isPollingOrderbook = false;
var SATOSHI = 10000000
var prevPrice = 0;

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



//		POST TO DAEMON

function sendPost(params) 
{
    var rpcport = "7778"
    var dfd = new $.Deferred();
    params = JSON.stringify(params);
	$.ajax
    ({
	  type: "POST",
	  url: 'http://127.0.0.1:' + rpcport,
	  data: params,
      contentType: 'application/json'
	}).done(function(data)
    {

		data = $.parseJSON(data)
        //console.dir(data)
        dfd.resolve(data);
    }).fail(function(data)
    {

        //console.dir(data)
        dfd.reject(data);
    })

    return dfd.promise()
}



function getAllOrderbooks()
{
    var dfd = new $.Deferred();

    var params = {"requestType":"allorderbooks"};

    sendPost(params).done(function(data)
    {
		dfd.resolve(data)
    })

	return dfd.promise()
}


function getOrderbook(baseid, relid)
{
    var dfd = new $.Deferred();

    var params = {"requestType":"orderbook","baseid":baseid,"relid":relid,"allfields":1}

    sendPost(params).done(function(data)
    {
		dfd.resolve(data)
    })

	return dfd.promise()
}



function placeOrder(orderType, baseid, relid, price, volume)
{
    var dfd = new $.Deferred();

    params = {"requestType":orderType,"baseid":baseid,"relid":relid,"price":price,"volume":volume}

    sendPost(params).done(function(data)
    {
		dfd.resolve(data)
    })

	return dfd.promise()
}


function placeBid(baseid, relid, price, volume)
{
    var dfd = new $.Deferred();

    var params = {"requestType":"placebid","baseid":baseid,"relid":relid,"price":price,"volume":volume}

    sendPost(params).done(function(params)
    {
		dfd.resolve(data)
    })

	return dfd.promise()
}


function placeAsk(baseid, relid, price, volume)
{
    var params = {"requestType":"placeask","baseid":baseid,"relid":relid,"price":price,"volume":volume}

    sendPost(params).done(function(params)
    {
        return data
    })
}


function getOpenOrders()
{
    var dfd = new $.Deferred();

    var params = {"requestType":"openorders"}

    sendPost(params).done(function(data)
    {
		dfd.resolve(data)
    })

	return dfd.promise()
}


function getTradeHistory()
{
    var dfd = new $.Deferred();

    var params = {"requestType":"tradehistory","timestamp":0}

    sendPost(params).done(function(data)
    {
		dfd.resolve(data)
    })

	return dfd.promise()
}


function cancelOrder(quoteid)
{
    var dfd = new $.Deferred();

    var params = {"requestType":"cancelquote","quoteid":quoteid}

    sendPost(params).done(function(data)
    {
		dfd.resolve(data)
    })

	return dfd.promise()
}


$("#modal-01").on("show", function(e)
{
	//console.log('hellooo');

})

$("#openOrders table tbody").on("click", "tr td.cancelOrder", function(e)
{
    var quoteid = $(this).data("quoteid")

	cancelOrder(quoteid).done(function(data)
	{
		//console.dir(data)
		$("#icoOrders").trigger("click");
	})
	
	
})

$("#icoFolio").on('click', function(e)
{
	getTradeHistory().done(function(data)
	{
		var row = ""
		var $tradeHistoryTable = $("#tradeHistory table tbody")
		//console.dir(data)
		if ('assets' in data)
		{
			for (var i = 0; i < data.assets.length; ++i)
			{
				var asset = data.assets[i]
				var assetid = asset.assetid
				var purchased = asset.purchased
				var sold = asset.sold
				var net = asset.net

				row += "<tr><td>"+asset+"</td><td>"+purchased+"</td><td>"+sold+"</td><td>"+net+"</td></tr>"
			}
		}
		$tradeHistoryTable.empty().append(row)
	})
})

$("#icoMarkets").on('click', function(e)
{
	getAllOrderbooks().done(function(data)
	{
	
		var row = ""
		var $allOrderbooksTable = $("#allOrderbooks table tbody")
		//console.dir(data)
		if (!('error' in data))
		{
			for (var i = 0; i < data.orderbooks.length; ++i)
			{
				var orderbook = data.orderbooks[i]
				var base = orderbook.base
				var rel = orderbook.rel
				var numquotes = orderbook.numquotes
				var exchange = orderbook.exchange

				row += "<tr><td>"+base+"/"+rel+"</td><td>"+numquotes+"</td><td>"+exchange+"</td></tr>"
			}
		}
		$allOrderbooksTable.empty().append(row)
		/*RESPONSE
		{
		"orderbooks":	[
			{
			"base":	"NXT",
			"baseid":	"5527630",
			"rel":	"BTC",
			"relid":	"4412482",
			"numquotes":	13,
			"type":	"0",
			"exchange":	"cryptsy"
			},
			{
				...
			}
		]
		*/
	})
})



$("#icoOrders").on('click', function(e)
{

	getOpenOrders().done(function(data)
	{
		var row = ""
		var $openOrdersTable = $("#openOrders table tbody")
		//console.dir(data)
		if (!('error' in data))
		{
			for (var i = 0; i < data.openorders.length; ++i)
			{
				var openOrder = data.openorders[i]
				var market = openOrder.base +"/"+ openOrder.rel
				var price = openOrder.price
				var volume = openOrder.volume
				var relAmount = openOrder.relamount
				var quoteid = openOrder.quoteid
				var age = openOrder.age
				var typeOrder = openOrder.requestType

				row += "<tr><td>"+typeOrder+"</td><td>"+market+"</td><td>"+price+"</td><td>"+volume+"</td><td>"+relAmount+"</td><td>"+quoteid+"</td><td>"+age+"</td><td data-quoteid='"+quoteid+"' class='cancelOrder'>CANCEL</td></tr>"
			}
		}
		$openOrdersTable.empty().append(row)
		// RESPONSE
		/*{
		"openorders":	[{
				"requestType":	"bid",
				"base":	"1000BURST",
				"rel":	"1000FIM",
				"price":	1,
				"volume":	1,
				"exchange":	"iDEX",
				"timestamp":	1425627464,
				"age":	3,
				"type":	"4294967297",
				"NXT":	"9572159016638540187",
				"baseid":	"251006016744564741",
				"baseamount":	"100000000",
				"relid":	"12404894802398759379",
				"relamount":	"100000000"
			}]
		}*/

		// {"result":"no openorders"}
	})

})




//		POLL FOR BIDS/ASKS

function pollOrderbook(baseid, relid, timeout, dfd)
{
	//var i = 0;

	setTimeout(function() 
	{
		if (isPollingOrderbook)
		{
			getOrderbook(baseid, relid).done(function(data)
			{
				if (!('error' in data))
				{
					$("#currPair .order-text").html(data.pair)	
					var bidData = groupOrders(data['bids'], currentOrderbook['bids'])
					var askData = groupOrders(data['asks'], currentOrderbook['asks'])
					//currentOrderbook['highestPrice'] = data['bids'][0]['price']

					//console.log('bids')
					//console.dir(bidData)
					//console.log('asks')
					//console.dir(askData)
					//console.log('done')

					currentOrderbook = data
					updateOrderbook(data, bidData, askData)
					//updateOrders(bidData, askData)
				}

				else
				{
					//$("#currPair .order-text").html(+String(baseid)+"/"+String(relid))
					$("#currPair .order-text").html("No bids or asks")
					$("#buyBook table tbody").empty()
					$("#sellBook table tbody").empty()
					$("#currLast .order-text").empty().html('0');
					//console.log(data['error'])
				}

				pollOrderbook(baseid,relid,5000,dfd)
			
			})
		}
		else
		{
			dfd.resolve(true)
		}
	}, timeout);

	return dfd.promise();
}


//	UPDATE OBOOK HANDLER

function updateOrderbook(data, bidData, askData)
{
	var lastPrice = data['bids'].length ? Math.round(Number(data['bids'][0].price) * SATOSHI) / SATOSHI : 0

	updateOrders($("#buyBook table"), bidData, false)
	updateOrders($("#sellBook table"), askData, true)
	$(".newrow").find('td').wrapInner('<div style="display: none; background-color:#333;" />').parent().find('td > div').slideDown(700, function(){
		var $set = $(this)
		$set.replaceWith($set.contents())
	})
	$(".expiredRow").find('td').wrapInner('<div style="display: block; color:#CCC;" />').parent().find('td > div').slideUp(700, function(){
		$(this).parent().parent().remove();
	})
	$(".newrow").removeClass("newrow")
	$(".expiredRow").removeClass("expiredRow")
	$("#currLast .order-text").empty().html(lastPrice.toFixed(8));
}



//		UPDATE ORDERBOOK BIDS/ASKS

function updateOrders($book, orderData, isAsk)
{
	var tableData = "";

	if (!($book.find("tr").length))
	{
		//console.log('fresh')
		//console.dir(orderData['newOrders'])
		tableData = addRow(orderData['newOrders'], isAsk);
		$book.find("tbody").empty().append(tableData);
	}
	else
	{
		$book.find("tr").each(function(index, element)
		{
			addNewOrders($(element), orderData, isAsk)
			showClosed($(this), orderData)
			removeOrders($(this), orderData)
			/*if (!removeOrders($(this), orderData))
			{
			
			}*/
		})
	}
}

function showClosed($row, orderData)
{
	var keys = ['price','volume','other','exchange']
	var obj = {}
	obj['price'] = $row.data('price')
	obj['volume'] = $row.data('volume')
	obj['other'] = $row.data('other')
	obj['exchange'] = $row.data('exchange')

	for (var i = 0; i < orderData['oldOrders'].length; i++)
	{
		if (compObjs(obj, orderData['oldOrders'][i], keys) && orderData['oldOrders'][i]['closed'])
		{
			$row.addClass("closed")
		}
	}
}

//	EXPIRED ORDERS
function removeOrders($row, orderData)
{
	var keys = ['price','volume','other','exchange']
	var obj = {}
	obj['price'] = $row.data('price')
	obj['volume'] = $row.data('volume')
	obj['other'] = $row.data('other')
	obj['exchange'] = $row.data('exchange')

	for (var i = 0; i < orderData['expiredOrders'].length; i++)
	{
		if (compObjs(obj, orderData['expiredOrders'][i], keys))
		{
			//console.log('remove')
			//console.log(typeof obj['price'])
			//console.log(typeof orderData['expiredOrders'][i]['price'])
			$row.addClass("expiredRow");

			return true
		}
	}

	return false

}


//	NEW ORDERS

function addNewOrders($row, orderData, isAsk)
{
	if (isAsk)
	{
		orderData['newOrders'].reverse()
	}
	for (var i = 0; i < orderData['newOrders'].length; i++)
	{

		var loopNewOrd = orderData['newOrders'][i]
		var price = Math.round(Number(loopNewOrd['price']) * SATOSHI) / SATOSHI 
		var volume = Math.round(Number(loopNewOrd['volume']) * SATOSHI) / SATOSHI
		var trString = '<tr class="newrow" data-price="'+String(price)+'" data-volume="'+String(volume)+'" data-other="'+loopNewOrd['other']+'" data-exchange="'+loopNewOrd['exchange']+'"><td>'+price.toFixed(8)+'&nbsp;&nbsp;</td><td>'+volume.toFixed(8)+'</td></tr>'
		//var trString = addRow(loopNewOrd)

		if (price < Number($row.data('price')))
		{
			var sib = $row.next()
			if (sib && $(sib).length)
			{
				if (price >= Number(sib.data('price')))
				{
					$row.after(trString)
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
				$row.after(trString)
				orderData['newOrders'].splice(i,1)
				--i
			}
		}
		else
		{
			$row.before(trString)
			orderData['newOrders'].splice(i,1)
			--i
		}
	}
}


//	    tableDataAsk += "<tr><td>"+obj.price+"</td><td>"+obj.volume+"</td><td>"+obj.other+"</td><td>"+obj.exchange+"</td></tr>"

//		DETERMINE EXPIRED/OLD/NEW ORDERS

function groupOrders(orders, currentOrders)
{
	var oldOrders = []
	var newOrders = []
	var expiredOrders = []

	var keys = ['price','volume','other','exchange']

					//console.dir(currentOrders)
					//console.dir(orders)
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

	//currentOrders = orders

	return {"expiredOrders":expiredOrders, "newOrders":newOrders, "oldOrders":oldOrders}
}


// ONLY USED FOR INITIATING AN OBOOK FROM SCRATCH CURRENTL

function addRow(arr, isAsk)
{
	var row = ""
	var sum = 0;
	var total = 0;
	var askRow = []

    for (var i = 0; i < arr.length; ++i)
    {

		var obj = arr[i]
		var price = Math.round(Number(obj.price) * SATOSHI) / SATOSHI 
		var volume = Math.round(Number(obj.volume) * SATOSHI) / SATOSHI 
		total = Math.round((price*volume) * SATOSHI) / SATOSHI 
		sum += total
		sum = Math.round(sum * SATOSHI) / SATOSHI 
		var inner = '<tr data-price="'+String(price)+'" data-volume="'+String(volume)+'" data-other="'+obj['other']+'" data-exchange="'+obj['exchange']+'">'
		inner += '<td>'+price.toFixed(8)+'&nbsp;&nbsp;</td>'
		inner += '<td>'+volume.toFixed(8)+'</td>'
		//inner += '<td>'+total.toFixed(8)+'</td>'
		//inner += '<td>'+sum.toFixed(8)+'</td>'
		inner += "</tr>"

		askRow.push(inner)
	}

	if (isAsk && askRow.length)
	{
		askRow.reverse()
	}
	for (var i = 0; i < askRow.length; ++i)
	{
		row+= askRow[i]
	}

	return row
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



function getFormData($form, unmodified) 
{
	var serialized = $form.serializeArray();
	var data = {};

	for (var s in serialized) 
	{
		data[serialized[s]['name']] = serialized[s]['value']
	}

	if (!unmodified) 
	{
		delete data.request_type;
		delete data.converted_account_id;
		delete data.merchant_info;
	}

	return data;
}


$(".idex-submit").on("click", function()
{
	if ($(this).is("button"))
	{
		var $form = $("#" + $(this).data("form"))
		var params = getFormData($form)
	}
	var method = $(this).data("method")

	if (method == "placebid" || method == "placeask")
	{
		placeOrder(method, curBase, curRel, params['price'], params['amount']).done(function(data)
		{
			//console.log(data)
			if ('result' in data && data['result'])
			{
				// success popup?
				// update orderbook bids/asks?
			}
			else
			{
				// fail popup?
			}
		})
	}
	else if (method == "getOrderbook")
	{
		if ($form)
		{
			curBase = params['baseid']
			curRel = params['relid']
		}
		else
		{
			curBase = $(this).data("baseid")
			curRel = $(this).data("relid")
		}
		//console.log(curBase)
		//console.log(curRel)

		if (!isPollingOrderbook)
		{
			initPoll(curBase, curRel)
		}
		else
		{
			isPollingOrderbook = false
		}
	}

	$("#modal-04").removeClass("md-show")
	if ($form)
	{
		$form.trigger("reset")
	}
})


//	POLL HANDLER
function initPoll(baseid, relid)
{
	var dfd = new $.Deferred();
	//console.log('starting polling')
	isPollingOrderbook = true;

	pollOrderbook(baseid, relid, 1,dfd).done(function(data)
	{
		//console.log('stopping poll')
		$("#buyBook table tbody").empty()
		$("#sellBook table tbody").empty()
		$("#currLast .order-text").empty().html('0')
		currentOrderbook = 
		{
			"NXT":"",
			"asks":[],
			"baseid":"",
			"bids":[],
			"obookid":"",
			"pair":"",
			"relid":""
		};
		initPoll(curBase, curRel)
	})
}



$("input[name='price'], input[name='amount']").on("keyup", function() 
{
	var $form = $(this).closest("form")
	var price = $form.find("input[name='price']").val()
	var amount = $form.find("input[name='amount']").val()
    var total = Number(price)*Number(amount)
	
    $form.find("input[name='total']").val(String(total))
});



/*
var w;

function startWorker() 
{
    if(typeof(Worker) !== "undefined") 
	{
        if(typeof(w) == "undefined") 
		{
            w = new Worker("pollWorker.js");
        }
        w.onmessage = function(event) 
		{
			console.log(event.data)
        };
    } 
	else 
	{
		console.log('no work')
    }
}


function stopWorker() 
{ 
    w.terminate();
    w = undefined;
}

*/

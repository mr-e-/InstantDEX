

var IDEX = (function(IDEX, $, undefined) {

IDEX.curBase;
IDEX.curRel;
var snURL = "http://127.0.0.1:7777";
var nxtURL = "http://127.0.0.1:7876/nxt?";
var SATOSHI = 100000000;
var rs = "";
var orderbookTimeout;
var allAssets;
var auto = [];
var favorites = [];
var isStoppingOrderbook = false
var orderbookAsync = false
var orderCompKeys = ['price','volume','exchange']

var postParams = 
{
	"orderbook":["baseid","relid","allfields"],
	"allorderbooks":[],
	"placebid":["baseid","relid","price","volume"],
	"placeask":["baseid","relid","price","volume"],
	"openorders":[],
	"tradehistory":["timestamp"],
	"cancelorder":["quoteid"],
	"makeoffer3":["baseid","relid","quoteid","askoffer","price","volume","exchange","baseamount","relamount","flip"]
};

function orderbookVar(obj) 
{
	this.nxt = ""
	this.asks = []
	this.baseid = ""
	this.bids = []
	this.obookid = ""
	this.pair = ""
	this.relid = ""
	
	var __construct = function(that) 
	{
		if (obj)
		{
			for (var key in obj)
			{
				that[key] = obj[key]
			}
		}
	}(this)
	
}

var currentOrderbook = new orderbookVar()

$(".assets").autocomplete({
	open:function()
	{
		var cssProps = {'z-index': 2003,'height':'200px','overflow-y':'scroll', 'overflow-x':'hidden', 'font-size':'0.65rem'} 
		//$(this).autocomplete('widget').css('z-index', 9999);
		$('.ui-autocomplete').css(cssProps)
	},
	delay:0,
	html:true,
	source: function( request, response ) 
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), "i" );
		var a = $.grep(auto, function( item )
		{
			var both = item.label.split(" ")
			var a = both[0]
			var b = both[1].substring(both[1].indexOf("<span>(")+7, both[1].lastIndexOf(")</span>"))

			return (matcher.test(a) || matcher.test(b))
		})

		response(a);
	},
})
//$(".assets").autocomplete("option", "source", auto);


function initConstants()
{
	var dfd = new $.Deferred()
	
	if (localStorage.allAssets)
	{
		allAssets = JSON.parse(localStorage.getItem("allAssets"))
		dfd.resolve(allAssets)
	}
	else
	{
		sendPost({"requestType":"getAllAssets"}, 1).done(function(data)
		{
			var parsed = []
			
			for (var i = 0; i < data.assets.length; ++i)
			{
				var obj = {}
				for (var key in data.assets[i])
				{
					if (key == "asset")
					{
						obj["assetid"] = data.assets[i][key]
						//continue
					}
					else if (key == "description")
					{
						continue
					}
					obj[key] = data.assets[i][key]
				}

				parsed.push(obj)
			}
			parsed.push({"name":"NXT","assetid":"5527630", "asset":"5527630","decimals":8})
			localStorage.setItem('allAssets', JSON.stringify(parsed));
			allAssets = parsed
			dfd.resolve(allAssets)
		})
	}
	
	dfd.done(function(assets)
	{
		var temp = []
		assets.sort(compareName)
		
		for (var i = 0; i < assets.length; ++i)
		{
			auto.push({"label":assets[i].name+" <span>("+assets[i].assetid+")</span>","value":assets[i].assetid})
			temp.push("<option value='"+assets[i].name+"'>")
		}
		
		$("#curr-list").empty().append(temp)
	})
	
	if (localStorage.chartFavorites)
	{
		favorites = JSON.parse(localStorage.getItem("chartFavorites"))

		for (var i = 0; i < favorites.length; ++i)
		{	
			var name = favorites[i].name
			var id = favorites[i].id
			var asset = favorites[i].asset
			
			$(".chart-control[chart-id='"+id+"']").val(name).attr("data-asset", asset)
			$("#chart-curr-"+id).html(name).attr("data-asset", asset)
		}
		$(".mini-chart").each(function()
		{
			var assetid = $(this).find(".mini-chart-area-1 span").first().attr("data-asset")
			var divid = $(this).find(".mini-chart-area-4").attr('id')

			if (assetid != "-1")
			{
				IDEX.makeMiniChart(assetid, divid)
			}
		})
	}

	sendPost({"requestType":"getpeers"}).done(function(data)
	{
		if ('peers' in data)
		{
			rs = data['peers'][1]['RS']
		}
	})
	
	//loadOrderbook("6932037131189568014", "6854596569382794790", true)
}


function saveChartFavorites()
{
	var parsed = []
	
    $(".chart-control").each(function() 
	{
		var name = $(this).val()
		var id = $(this).attr("chart-id")
		var asset = $(this).attr("data-asset")
		parsed.push({"name":name,"id":id,"asset":asset})
    });
	
	localStorage.setItem('chartFavorites', JSON.stringify(parsed));
	favorites = parsed
}


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
	  url: (typeof url === 'undefined' || !url) ? snURL : nxtURL,
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


function getAssetInfo(key, val)
{
	var arr = []
	var assetInfo = {}
	for (var i = 0; i < allAssets.length; ++i)
	{
		if (allAssets[i][key] == val)
		{
			arr.push(allAssets[i])
		}
	}
	if (arr.length)
	{
		var numTrades = -1;
		var index = 0;
		
		for (var i = 0; i < arr.length; ++i)
		{
			if (arr[i].numberOfTrades > numTrades)
			{
				numTrades = arr[i].numberOfTrades
				index = i
			}
		}
		
		assetInfo = arr[index]
	}
	return assetInfo
}


function updateCurrentBalance()
{
	var $buy = $("#balanceBuy")
	var $sell = $("#balanceSell")
	var baseBal = ["0", ".0"]
	var relBal = ["0", ".0"]
	
	$buy.find("span").first().text(IDEX.curRel.name)
	$sell.find("span").first().text(IDEX.curBase.name)
	
	sendPost({"requestType":"getAccountAssets","account":rs}, 1).done(function(data)
	{
		if (!("errorCode" in data))
		{
			var balances = data['accountAssets']
			//console.log(data)
			baseBal = parseBalance(balances, IDEX.curBase.name)
			relBal = parseBalance(balances, IDEX.curRel.name)

			$buy.find(".bal-value span").first().text(relBal[0]).next().text(relBal[1])
			$sell.find(".bal-value span").first().text(baseBal[0]).next().text(baseBal[1])
		}
	})
}

function parseBalance(balances, assetName)
{
	var whole = "0"
	var dec = ".0"
	
	for (var i = 0; i < balances.length; ++i)
	{
		if (balances[i].name == assetName)
		{
			var amount = String(balances[i].quantityQNT/Math.pow(10, balances[i].decimals))
			//.toFixed(balances[i].decimals)
			var both = amount.split(".")
			whole = both[0]
			if (both.length > 1)
				dec	= "." + both[1]
			break
		}
	}
	
	return [whole, dec]
}


$("#miniChartsC .mini-chart .mini-chart-area-1").on("click", function()
{
	hotkeyHandler($(this))
})
$("#miniChartsTop .chart-box, #miniChartsTop2 .chart-box-2 .chart-sub-box-2").on("click", function()
{
	hotkeyHandler($(this).find("span").first())
})
function hotkeyHandler($div)
{
	var baseid = $div.find("span").eq(0).data("asset")
	var relid = $div.find("span").eq(1).data("asset")

	if (baseid && relid && baseid.length && relid.length)
	{
		loadOrderbook(baseid, relid)
	}	
}

$(".md-modal-2").on("idexShow", function()
{
	
})


$("#modal-04").on("idexHide", function()
{
    $(".chart-control").each(function() 
	{
		var id = $(this).attr("chart-id")
		var asset = getAssetInfo("name", $(this).val())
		asset = "asset" in asset ? asset['asset'] : "-1"
		if ((id == "91" || id == "101" || id == "111" || id == "121") && asset != "-1")
		{
			for (var i = 0; i < favorites.length; ++i)
			{
				if (favorites[i]['id'] == id && favorites[i]['asset'] != asset)
				{
					var divid = $("#chart-curr-"+id).closest(".mini-chart").find(".mini-chart-area-4").attr("id")
					IDEX.makeMiniChart(asset, divid)
				}
			}
		}
		$(this).attr("data-asset", asset)
		$("#chart-curr-"+id).attr("data-asset", asset)
    });
	
	saveChartFavorites()
})


$(".md-modal").on("idexHide", function()
{
	$(this).find(".tabs-container div").removeClass("active").first().addClass("active");
	$(this).find(".tabs-nav .nav").removeClass("active").first().addClass("active");
})


$(".tab-tables .nav").on("click", function()
{
	var $table = $("#"+$(this).attr('tab-index')).find("table")
	if ($table.length) {tableHandler($table)}
})
$(".md-modal").on("idexShow", function()
{
	var $table = $("#"+$(this).find(".nav.active").attr('tab-index')).find("table")
	if ($table.length) {tableHandler($table)}
})


$("#openOrdersTable tbody").on("click", "tr", function(e)
{
	var quoteid = $(this).data("quoteid")
	var $thisScope = $(this)
	
	sendPost({"requestType":"cancelquote","quoteid":quoteid}).done(function(data)
	{
		$thisScope.closest(".md-content").find(".tab-tables .nav.active").trigger("click")
	})
})


$("#marketTable tbody").on("click", "tr", function()
{
	//var base = $(this).find("td:first").text()
	//var rel = $(this).find("td:first").next().text()
	loadOrderbook($(this).data("baseid"), $(this).data("relid"))
	$(".md-overlay").trigger("click")
})


function tableHandler($modalTable)
{
	var keys = $modalTable.find("thead").data("keys").split(" ")
	var method = $modalTable.data("method")
	var params = {"requestType":method}
	var type = 0;
	
	if (method == "tradehistory")
	{
		params['timestamp'] = 0;
	}
	else if (method == "getAccountAssets")
	{
		params['account'] = rs;
		type=1;
	}
	sendPost(params, type).done(function(data)
	{
		var row = ""

		if (keys[0] in data)
		{
			var tableData = data[keys[0]]
			
			keys.splice(0,1)

			if (method == "openorders")
			{
				tableData = formatPairName(tableData)
				formatOpenOrders(tableData)
				row = buildTableRows(objToList(tableData, keys))
				row = $(row).each(function()
				{
					$(this).find('td:last').after("<td class='cancelOrder'>CANCEL</td>")
				})
				row = addRowAttr(row, tableData, ["quoteid"])
			}
			else if (method ==	"allorderbooks")
			{
				addEmptyMarketData(tableData)
				row = buildTableRows(objToList(tableData, keys))
				row = addRowAttr(row, tableData, ["baseid","relid"])
			}
			else if (method == "tradehistory")
			{
				if ("rawtrades" in tableData ) 
				{
					tableData = tableData['rawtrades']
					/*for (var i = 0; i < tableData.length; ++i)
					{
						if ("assetA" in tableData[i])
						{
							tableData.splice(i, 1)
							--i
						}
					}*/
					addAssetNames(tableData, "baseid", "relid")
					tableData = formatPairName(tableData)
				}
			}
			else if (method == "getAccountAssets")
			{
				for (var i = 0; i < tableData.length; ++i)
				{
					var decimals = tableData[i].decimals
					
					tableData[i].quantityQNT = tableData[i].quantityQNT / Math.pow(10, decimals)
					tableData[i].unconfirmedQuantityQNT = tableData[i].unconfirmedQuantityQNT / Math.pow(10, decimals)
				}
			}
			
			if (!row.length)
				row = buildTableRows(objToList(tableData, keys))	
		}
		
		$modalTable.find("tbody").empty().append(row)
	})
}

function formatOpenOrders(tableData)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['askoffer'] = tableData[i]['askoffer'] == 1 ? "Bid" : "Ask"
		tableData[i]['total'] = tableData[i]['relamount']/SATOSHI
	}
}
function convertQNT(data)
{
	for (var i = 0; i < data.length; ++i)
	{
		//data[i]
	}
}


function formatPairName(tableData)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['market'] = tableData[i]['base'] + "/" + tableData[i]['rel']
	}

	return tableData
}


function addEmptyMarketData(tableData)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['last'] = "-"
		tableData[i]['high'] = "-"
		tableData[i]['low'] = "-"
		tableData[i]['volume'] = "-"
	}
}


function addAssetNames(tableData, baseName, relName)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['base'] = getAssetInfo("name", [tableData[i][baseName]])['name']
		tableData[i]['rel'] = getAssetInfo("name", [tableData[i][relName]])['name']
	}	
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

	return params
}

/*
function handlePost(method, params)
{
	var isSNPost = 1
	var obj = {}
	
	for (var i = 0; i < nxtMethods.length; ++i)
	{
		if (method == nxtMethods[i])
		{
			isSNPost = 0;
		}
	}
	
	obj = buildPostPayload(method, data)
	
	sendPost(obj, isSNPost).done(function(data)
	{
		dfd.resolve(data)
	})	
}*/


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
	var method = $(this).data("method")
	var params = extractPostPayload($(this))
	params = buildPostPayload(method, params)

	if (method == "orderbook")
	{
		loadOrderbook(params.baseid, params.relid)
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
	else
	{
		sendPost(params)
	}

	if ($form)
	{
		$form.trigger("reset")
	}
	$(".md-overlay").trigger("click")
})


function loadOrderbook(baseid, relid)
{
	if (!isStoppingOrderbook)
	{
		IDEX.curBase = getAssetInfo("asset", Number(baseid))
		IDEX.curRel = getAssetInfo("asset", Number(relid))
		
		updateCurrentBalance()
		stopPollOrderbook()
	}
}


function stopPollOrderbook()
{
	if (orderbookAsync) 
	{
		isStoppingOrderbook = true
        setTimeout(stopPollOrderbook, 100);
		return false
    }
	isStoppingOrderbook = false
	clearTimeout(orderbookTimeout)
	emptyOrderbook(IDEX.curBase.name+"/"+IDEX.curRel.name)	
	currentOrderbook = new orderbookVar();
	IDEX.killChart()
	IDEX.makeChart({'baseid':IDEX.curBase.asset,'relid':IDEX.curRel.asset,'basename':IDEX.curBase.name,'relname':IDEX.curRel.name})
	//console.log('switching')
	pollOrderbook(1)

}


function emptyOrderbook(currPair)
{
	$("#currPair .order-text").html(currPair)
	$("#buyBook table tbody").empty()
	$("#sellBook table tbody").empty()
	$("#currLast .order-text").empty().html('0');
}


function pollOrderbook(timeout)
{
	orderbookTimeout = setTimeout(function() 
	{
		var params = {"requestType":"orderbook","baseid":IDEX.curBase.asset,"relid":IDEX.curRel.asset,"allfields":1,"maxdepth":20}

		orderbookAsync = true
		sendPost(params).done(function(orderbookData)
		{
			orderbookAsync = false

			if (!("error" in orderbookData))
			{
				orderbookData['bids'].sort(compare)
				orderbookData['asks'].sort(compare)
				orderbookData['bids'].reverse()
				orderbookData['asks'].reverse()

				updateOrderbook(orderbookData);
			}

			pollOrderbook(3000)
		})

	}, timeout)
}


function groupOrders(orders, currentOrders)
{
	var oldOrders = []
	var newOrders = []
	var expiredOrders = []
	var newOrdersRow = ""
	
	for (var i = 0; i < currentOrders.length; ++i)
	{
		currentOrders[i]['index'] = i
	}
	
	for (var i = 0; i < orders.length; i++)
	{
		var loopOrd = orders[i]
		var isNew = true;

		for (var j = 0; j < currentOrders.length; j++)
		{
			var loopCurOrd = currentOrders[j]

			if (compObjs(loopOrd, loopCurOrd, orderCompKeys))
			{
				oldOrders.push(loopOrd)
				currentOrders.splice(j, 1)
				isNew = false;
				break
			}
		}

		if (isNew)
		{
			loopOrd.price = toSatoshi(loopOrd.price).toFixed(8)
			loopOrd.volume = toSatoshi(loopOrd.volume).toFixed(8)
			var trString = buildTableRows([[loopOrd.price+"&nbsp;&nbsp;", loopOrd.volume]])
			var trClasses = (loopOrd['exchange'] == "nxtae_nxtae") ? "virtual" : ""
			newOrdersRow += addRowClass(trString, trClasses)
			
			newOrders.push(loopOrd)
		}
	}
	
	expiredOrders = currentOrders

	return {"expiredOrders":expiredOrders, "newOrders":newOrders, "newOrdersRows":newOrdersRow, "oldOrders":oldOrders}
}


function updateOrderbook(orderbookData)
{
	var lastPrice = orderbookData.bids.length ? orderbookData.bids[0].price : 0
	var bidData = groupOrders(orderbookData.bids.slice(), currentOrderbook.bids.slice())
	var askData = groupOrders(orderbookData.asks.slice(), currentOrderbook.asks.slice())
	askData['orderbookData'] = orderbookData
	bidData['orderbookData'] = orderbookData
	askData.newOrders.reverse()	
	//console.log(orderbookData)
	//console.log(currentOrderbook)
	//console.log(bidData)
	//console.log(askData)
	updateOrders($("#buyBook table"), bidData)
	updateOrders($("#sellBook table"), askData)
	animateOrderbook()
	currentOrderbook = new orderbookVar(orderbookData)

	$("#currLast .order-text").html(Number(Number(lastPrice).toFixed(8)));
	//console.log(orderbookData)
}


function animateOrderbook()
{
	$(".newrow").find('td').wrapInner('<div style="display: none; background-color:#333;" />').parent().find('td > div').slideDown(700, function()
	{
		var $set = $(this)
		$set.replaceWith($set.contents())
	})
	$(".expiredRow").find('td').wrapInner('<div style="display: block" />').parent().find('td > div').slideUp(700, function()
	{
		$(this).parent().parent().remove();
	})

	$(".newrow").removeClass("newrow")
	$(".expiredRow").removeClass("expiredRow")
}


function updateOrders($book, orderData)
{
	if (!($book.find("tr").length))
	{
		$book.find("tbody").empty().append(orderData.newOrdersRows)
	}
	else
	{
		$book.find("tr").each(function(index, element)
		{
			removeOrders($(this), orderData, index)
		})
		$book.find("tr").each(function(index, element)
		{
			var isAsk = ($(this).closest("div").attr('id') == "buyBook") ? false : true
			var rowData = isAsk ? currentOrderbook.asks[index] : currentOrderbook.bids[index]
			addNewOrders($(this), orderData, rowData, index)
		})
	}
}


function removeOrders($row, orderData, index)
{
	for (var i = 0; i < orderData['expiredOrders'].length; i++)
	{
		if (index == orderData['expiredOrders'][i]['index'])
		{
			$row.addClass("expiredRow");
		}
	}
}


function addNewOrders($row, orderData, rowData, index)
{
	var trRows = $(orderData.newOrdersRows).toArray()
	
	for (var i = 0; i < orderData.newOrders.length; i++)
	{
		var loopNewOrd = orderData.newOrders[i]
		var trString = addRowClass($(trRows)[i], "newrow")
		//class = order-row cbutton cbutton--effect-jelena

		if (loopNewOrd.price < Number(rowData.price))
		{
			var $sib = $row.next()
			if ($sib && $sib.length)
			{
				var isAsk = ($row.closest("div").attr('id') == "buyBook") ? false : true
				var sibData = isAsk ? currentOrderbook.asks[index+1] : currentOrderbook.bids[index+1]
				
				if (loopNewOrd.price >= Number(sibData.price))
				{
					$row.after($(trString))
				}
				else
				{
					break
				}
			}	
			else
			{
				$row.after($(trString))
			}
		}
		else
		{
			$row.before($(trString))
		}
		
		orderData['newOrders'].splice(i,1)
		trRows.splice(i, 1)
		--i
	}
}


function triggerMakeoffer(orderData)
{
	var params = {"requestType":"makeoffer3","srcqty":1000}

	for (var i = 0; i < postParams.makeoffer3.length; ++i)
	{
		params[postParams.makeoffer3[i]] = orderData[postParams.makeoffer3[i]]
	}
	//console.log(params)

	sendPost(params).done(function(data)
	{
		//console.log(data);
	})
}


$("input[name='price'], input[name='volume']").on("keyup", function() 
{
	var $form = $(this).closest("form")
	var price = $form.find("input[name='price']").val()
	var amount = $form.find("input[name='volume']").val()
	var total = Number(price)*Number(amount)
	
	$form.find("input[name='total']").val(String(total))
});


$("#sellBook table tbody").on("click", "tr", function(e)
{
	var order = getRowData($(this))
	console.log(order)
	
	$("#placeBidPrice").val(order.price);
	$("#placeBidAmount").val(order.volume).trigger("keyup");
	$("#tab1").trigger("click")

	//triggerMakeoffer(order)
})


$("#buyBook table tbody").on("click", "tr", function(e)
{
	var order = getRowData($(this))
	console.log(order)
	
	$("#placeAskPrice").val(order.price);
	$("#placeAskAmount").val(order.volume).trigger("keyup");
	$("#tab2").trigger("click");
	
	//triggerMakeoffer(order)
})


function buildTableRows(data)
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

function getRowData($row)
{
	var isAsk = ($row.closest("div").attr('id') == "buyBook") ? false : true
	var index = $row[0].rowIndex
	var rowData = isAsk ? currentOrderbook.asks[index] : currentOrderbook.bids[index]

	return rowData
}

function addRowClass(row, rowClass)
{
	var s = "";
	
	$(row).each(function(e, p)
	{
		$(p).addClass(rowClass)
		s += $(p)[0].outerHTML
	})
	
	return s
}


function addRowAttr(row, data, keys)
{
	var s = "";
	var i = 0
	
	$(row).each(function(e, p)
	{
		for (var j = 0; j < keys.length; ++j)
		{
			$(p).attr("data-"+keys[j], data[i][keys[j]])
		}
		
		s += $(p)[0].outerHTML
		++i
	})
	
	return s
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


function compare(a, b) 
{
	if (a.price < b.price)
		return -1;
	if (a.price > b.price)
		return 1;
	
	return 0;
}
function compareName(a, b) 
{
	if (a.name < b.name)
		return -1;
	if (a.name > b.name)
		return 1;
	
	return 0;
}


function toSatoshi(number)
{
	return Math.round(Number(number) * SATOSHI) / SATOSHI 
}


$(window).load(function()
{
	initConstants()
})



	return IDEX;
	
}(IDEX || {}, jQuery));


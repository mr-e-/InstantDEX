

var IDEX = (function(IDEX, $, undefined) {

IDEX.curBase;
IDEX.curRel;
var snURL = "http://127.0.0.1:7778";
var nxtURL = "http://127.0.0.1:7876/nxt?";
var isPollingOrderbook = false;
var SATOSHI = 100000000;
var rs = "";
var orderbookTimeout;
var allAssets;
var auto = [];
var favorites = [];


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

var postParams = 
{
	"orderbook":["baseid","relid","allfields"],
	"allorderbooks":[],
	"placebid":["baseid","relid","price","volume"],
	"placeask":["baseid","relid","price","volume"],
	"openorders":[],
	"tradehistory":["timestamp"],
	"cancelorder":["quoteid"],
	"makeoffer3":["baseid","relid","frombase","fromrel","tobase","torel","flip"]
};

var orderCompKeys = ['price','volume','exchange']


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
//auto[getIndexOfVal(auto, a[i])].value


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
		getRS();
	})
	
	if (localStorage.chartFavorites)
	{
		favorites = JSON.parse(localStorage.getItem("chartFavorites"))
		console.log(favorites)
		for (var i = 0; i < favorites.length; ++i)
		{	
			var name = favorites[i].name
			var id = favorites[i].id
			var asset = favorites[i].asset
			
			$(".chart-control[chart-id='"+id+"']").val(name).attr("data-asset", asset)
			$("#chart-curr-"+id).html(name).attr("data-asset", asset)
		}
	}
}


function saveChartFavorites()
{
	var parsed = []
	
    $(".chart-control").each(function() 
	{
		var name = $(this).val()
		var id = $(this).attr("chart-id")
		var asset = $(this).data("asset")
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


function getRS()
{
    var dfd = new $.Deferred();
    
	var obj = {"requestType":"getpeers"}
	sendPost(obj).done(function(data)
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
	sendPost(obj, 1).done(function(data)
	{
		dfd.resolve(data)
	})

	return dfd.promise()
}


function getNewAssetInfo(assets)
{
	var dfd = new $.Deferred();
    var dataStr = "requestType=getAssets&"
	
	for (var i = 0; i < assets.length; ++i)
	{
		dataStr += "assets="+String(assets[i])+"&"
	}

	sendPost(dataStr, 1).done(function(data)
	{
		dfd.resolve(data)
	})
	
	return dfd.promise()
}


function getAssetInfo(asset)
{
	var assetInfo = {}

	for (var i = 0; i < allAssets.length; ++i)
	{
		if (allAssets[i].assetid == asset)
		{
			allAssets[i].asset = allAssets[i].assetid
			assetInfo = allAssets[i]
			break
		}
		else if (asset == 5527630)
		{
			assetInfo = {"name":"NXT","assetid":"5527630", "asset":"5527630","decimals":8}
			break
		}
		
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
	
	getAccountAssets().done(function(data)
	{
		var balances = data['accountAssets']
		baseBal = parseBalance(balances, IDEX.curBase.name)
		relBal = parseBalance(balances, IDEX.curRel.name)

		$buy.find(".bal-value span").first().text(relBal[0]).next().text(relBal[1])
		$sell.find(".bal-value span").first().text(baseBal[0]).next().text(baseBal[1])
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
	console.log(baseid)
	console.log(relid)

	if (baseid && relid && baseid.length && relid.length)
	{
		loadOrderbook(baseid, relid)
	}	
}

$(".md-modal-2").on("idexShow", function()
{
	
})


$(".md-modal-2").on("idexHide", function()
{
    $(".chart-control").each(function() 
	{
		var id = $(this).attr("chart-id")
		var asset = getAssetID($(this).val())
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
	if ($table.length)
	{
		var keys = $table.find("thead").data("keys").split(" ")
		var method = $table.data("method")
	
		tableHandler({"requestType":method}, keys, $table)
	}
})
$(".md-modal").on("idexShow", function()
{
	var $table = $("#"+$(this).find(".nav.active").attr('tab-index')).find("table")
	if ($table.length)
	{
		var keys = $table.find("thead").data("keys").split(" ")
		var method = $table.data("method")
		//	params['requestType'] = $table.attr('id').split("Table")[0].toLowerCase()
		tableHandler({"requestType":method}, keys, $table)
	}
})


$("#openOrders table tbody").on("click", "tr td.cancelOrder", function(e)
{
	var quoteid = $(this).data("quoteid")

	cancelOrder(quoteid).done(function(data)
	{

	})
})


$("#marketTable tbody").on("click", "tr", function()
{
	//var base = $(this).find("td:first").text()
	//var rel = $(this).find("td:first").next().text()
	loadOrderbook($(this).data("baseid"), $(this).data("relid"))
	$(".md-overlay").trigger("click")
})


function tableHandler(params, keys, $modalTable)
{
	var method = params['requestType']
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
				//tableData = formatPairName(tableData)
				addEmptyMarketData(tableData)
				//<td data-quoteid='"+quoteid+"' class='cancelOrder'>CANCEL</td>
			}
			else if (method ==	"allorderbooks")
			{
				//tableData = formatPairName(tableData)
				addEmptyMarketData(tableData)
				row = buildTableRows(objToList(tableData, keys))
				row = addRowAttr(row, tableData, ["baseid","relid"])
			}
			else if (method == "tradehistory")
			{
				if ("rawtrades" in tableData ) 
				{
					tableData = tableData['rawtrades']
					for (var i = 0; i < tableData.length; ++i)
					{
						if ("assetA" in tableData[i])
						{
							tableData.splice(i, 1)
							--i
						}
					}
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
		tableData[i]['base'] = getAssetName([tableData[i][baseName]])
		tableData[i]['rel'] = getAssetName([tableData[i][relName]])
	}	
}


function getAssetName(assetid)
{
	var assetName = ""
	for (var i = 0; i < allAssets.length; ++i)
	{
		if (allAssets[i].assetid == assetid)
		{
			assetName = allAssets[i].name
			break
		}
		else if (assetid == "5527630")
		{
			assetName = "NXT"
			break
		}
	}
	
	return assetName
}


function getAssetID(name)
{
	var assetid = -1
	var arr = []
	var counter = 0;
	
	for (var i = 0; i < allAssets.length; ++i)
	{
		if (allAssets[i].name == name)
		{
			arr.push(allAssets[i])
			counter++
		}
		else if (name == "NXT")
		{
			assetid = "5527630"
			break
		}
	}
	if (arr.length)
	{
		var numTrades = 0;
		var index = 0;
		for (var i = 0; i < arr.length; ++i)
		{
			if (arr[i].numberOfTrades > numTrades)
			{
				numTrade = arr[i].numberOfTrades
				index = i
			}
		}
		assetid = arr[index].assetid
	}
	
	return assetid
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
		loadOrderbook(params.baseid, params.relid)
	}
	else if (method == "placebid" || method == "placeask")
	{
		params['baseid'] = IDEX.curBase.asset
		params['relid'] = IDEX.curRel.asset
		if (method == "placeask")
		{
			var total = params['price']*params['volume']
			var price = params['volume']/total
			var volume = total
			params['volume'] = volume
			params['price'] = price
		}

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
			//$("#modal-04").removeClass("md-show")
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
	IDEX.curBase = getAssetInfo(Number(baseid))
	IDEX.curRel = getAssetInfo(Number(relid))
	
	updateCurrentBalance()
	IDEX.killChart()
	IDEX.makeChart({'dataSite':'skynet','baseid':(baseid==5527630) ? relid : baseid})
	
	if (isPollingOrderbook)
	{
		stopPollOrderbook()
	}

	emptyOrderbook(IDEX.curBase.name+"/"+IDEX.curRel.name)
	pollOrderbook(1)
}


function stopPollOrderbook()
{
	clearTimeout(orderbookTimeout)
	emptyOrderbook(" ")	
	currentOrderbook = new orderbookVar();
	isPollingOrderbook = false
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
	isPollingOrderbook = true

	orderbookTimeout = setTimeout(function() 
	{
		var dfd = new $.Deferred();
		var params = {"requestType":"orderbook","baseid":IDEX.curBase.asset,"relid":IDEX.curRel.asset,"allfields":1,"maxdepth":7}

		sendPost(params).done(function(orderbookData)
		{
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
	
	for (var i = 0; i < orders.length; i++)
	{
		var loopOrd = orders[i]
		var isNew = true;

		for (var j = 0; j < currentOrders.length; j++)
		{
			var loopCurOrd = currentOrders[j]
			
			if ( i == 0 )
				loopCurOrd['index'] = j

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
	console.log(orderbookData)
	//$("#currPair .order-text").html(IDEX.curBase.name+"/"+IDEX.curRel.name)
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
			var isAsk = ($(this).closest("div").attr('id') == "buyBook") ? false : true
			var rowData = isAsk ? currentOrderbook.asks[index] : currentOrderbook.bids[index]

			addNewOrders($(this), orderData, rowData, index)
			//showClosed($(this), orderData, rowData)
			removeOrders($(this), orderData, index)
		})
	}
}


function showClosed($row, orderData, rowData)
{
	for (var i = 0; i < orderData['oldOrders'].length; i++)
	{
		if (compObjs(rowData, orderData['oldOrders'][i], orderCompKeys) && orderData['oldOrders'][i]['closed'])
		{
			$row.addClass("closed")
		}
	}
}


function removeOrders($row, orderData, index)
{
	
	for (var i = 0; i < orderData['expiredOrders'].length; i++)
	{
		if (index == orderData['expiredOrders'][i]['index'])
		{
			$row.addClass("expiredRow");
			//console.log($row)
		}
	}
}


function addNewOrders($row, orderData, rowData, index)
{
	var trRows = $(orderData.newOrdersRows).toArray()
	for (var i = 0; i < orderData.newOrders.length; i++)
	{
		var loopNewOrd = orderData.newOrders[i]
		var trClasses = "newrow"
		var trString = addRowClass($(trRows)[i], trClasses)
		//class = order-row cbutton cbutton--effect-jelena

		if (loopNewOrd.price < Number(rowData.price))
		{
			var $sib = $row.next()
			if ($sib && $sib.length)
			{
				var isAsk = ($row.closest("div").attr('id') == "buyBook") ? false : true
				var sibData = isAsk ? currentOrderbook.asks[index+1] : currentOrderbook.bids[index+1]
				
				//console.log($sib)
				//console.log(sibData)
				if (loopNewOrd.price >= Number(sibData.price))
				{
					$row.after($(trString))
					orderData['newOrders'].splice(i,1)
					trRows.splice(i, 1)
					--i
				}
				else
				{
					break
				}
			}	
			else
			{
				$row.after($(trString))
				orderData['newOrders'].splice(i,1)
				trRows.splice(i, 1)

				--i
			}
		}
		else
		{
			$row.before($(trString))
			orderData['newOrders'].splice(i,1)
			trRows.splice(i, 1)

			--i
		}
	}
}


function triggerMakeoffer(orderData)
{
	var params = {}
	params['requestType'] = "makeoffer3"
	params['srcqty'] = 1000
	for (var i = 0; i < postParams.makeoffer3.length; ++i)
	{
		params[postParams.makeoffer3[i]] = orderData[postParams.makeoffer3[i]]
	}
	//console.log(orderData)
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
	$("#tab1").trigger("click");
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


function getIndexOfVal(list, val)
{
	var index = -1;
	for (var i = 0; i < list.length; ++i)
	{
		for (var prop in list[i])
		{
			if (list[i].prop == val)
			{
				return i;
			}
		}
	}
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

function cloneObject(obj)
{
    if(obj == null || typeof(obj) != 'object')
        return obj;

    var temp = new obj.constructor(); 
	
    for(var key in obj)
	{
        temp[key] = clone(obj[key]);
	}

    return temp;
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


$(document).ready(function()
{
	initConstants()
})




	return IDEX;
	
}(IDEX || {}, jQuery));




var IDEX = (function(IDEX, $, undefined) {


IDEX.curBase;
IDEX.curRel;
var snURL = "http://127.0.0.1:7777";
var nxtURL = "http://127.0.0.1:7876/nxt?";
var SATOSHI = 100000000;
var NXT_ASSET = "5527630";
var rs = "";
var rsid = "";
var orderbookTimeout;
var allAssets = [];
var auto = [];
var auto2 = [];
var chartFavs = [];
var isStoppingOrderbook = false;
var orderbookAsync = false;
var orderCompKeys = ['quoteid'];
var pendingOrder = {};
var currentOrderbook = new orderbookVar();
var postParams = {
	'orderbook':["baseid","relid","allfields"],
	'allorderbooks':[],
	'placebid':["baseid","relid","price","volume"],
	'placeask':["baseid","relid","price","volume"],
	'openorders':[],
	'tradehistory':["timestamp"],
	'cancelorder':["quoteid"],
	'makeoffer3':["baseid","relid","quoteid","askoffer","price","volume","exchange","baseamount","relamount","baseiQ","reliQ","minperc","jumpasset"]
};

function orderbookVar(obj) 
{
	this.nxt = "";
	this.asks = [];
	this.baseid = "";
	this.bids = [];
	this.obookid = "";
	this.pair = "";
	this.relid = "";
	
	var __construct = function(that) 
	{
		if (obj)
		{
			for (var key in obj)
			{
				that[key] = obj[key];
			}
		}
	}(this);
};



$('.assets-search').autocomplete({
	delay:0,
	html:true,
	source: function(request,response) { autocompleteMatcher(request, response, auto2) }
});

$('.assets-fav input').autocomplete({
	delay: 0,
	html: true,
	create: function(e, ui) { },
	open: function(e, ui) { $(this).autocomplete('widget').css({'width':"153px"})},
	source: function(request,response) { autocompleteMatcher(request, response, auto) },
	change: function(e, ui) { autocompleteSelection($(this), e, ui) },
	select: function(e, ui) { autocompleteSelection($(this), e, ui) }
});

function autocompleteSelection($thisScope, e, ui)
{
	if (!ui.item)
	{
		$thisScope.attr('data-asset', "-1");
	}
	else
	{
		var both = ui.item.label.split(' ');
		var a = both[1].substring(both[1].indexOf("<span>(")+7, both[1].lastIndexOf(")</span>"));
		
		$thisScope.attr('data-asset', a);
	}
}


function autocompleteMatcher(request, response, auto)
{
	var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );
	var a = $.grep(auto, function( item )
	{
		var both = item.label.split(' ');
		var a = both[0];
		var b = both[1].substring(both[1].indexOf("<span>(")+7, both[1].lastIndexOf(")</span>"));

		return (matcher.test(a) || matcher.test(b));
	});

	response(a);
}
	

$(window).load(function()
{
	initAllAssets();
	initChartFavorites();

	sendPost({'requestType':"getpeers"}).done(function(data)
	{
		if ('peers' in data && data['peers'].length)
		{
			var index = data['peers'].length == 1 ? 0 : 1;
			rs = data['peers'][index]['RS'];
			rsid = data['peers'][index]['srvNXT'];
		}
	})	
})


function initAllAssets()
{
	var dfd = new $.Deferred();
	
	if (localStorage.allAssets)
	{
		var assets = JSON.parse(localStorage.getItem('allAssets'));
		dfd.resolve(assets);
	}
	else
	{
		sendPost({'requestType':"getAllAssets"}, 1).done(function(data)
		{
			var parsed = [];
			
			for (var i = 0; i < data.assets.length; ++i)
			{
				var obj = {};
				
				for (var key in data.assets[i])
				{
					if (key == "asset")
						obj['assetid'] = data.assets[i][key]
					
					if (key == "description")
						continue;
					
					obj[key] = data.assets[i][key];
				}

				parsed.push(obj);
			}
			parsed.push({'name':"NXT",'assetid':NXT_ASSET, 'asset':NXT_ASSET,'decimals':8});
			localStorage.setItem('allAssets', JSON.stringify(parsed));
			dfd.resolve(parsed);
			
		}).fail(function(data)
		{
			dfd.resolve([]);
		})
	}
	
	dfd.done(function(assets)
	{
		assets.sort(compareName);
		allAssets = assets
		
		for (var i = 0; i < allAssets.length; ++i)
		{
			auto.push({"label":allAssets[i].name+" <span>("+allAssets[i].assetid+")</span>","value":allAssets[i].name});
			auto2.push({"label":allAssets[i].name+" <span>("+allAssets[i].assetid+")</span>","value":allAssets[i].asset});
		}
	})
}

function initChartFavorites()
{	
	var tempInit = 0
	if (localStorage.chartFavorites)
	{
		chartFavs = JSON.parse(localStorage.getItem("chartFavorites"));
		for (var i = 0; i < chartFavs.length; ++i)
		{
			if (!("asset" in chartFavs[i]) || typeof chartFavs[i]['asset'] === "undefined")
			{
				chartFavs[i]['asset'] = "-1"
			}
		}
	}
	else
	{
		var defaultFavs = [
			{'name':"InstantDEX",'asset':"15344649963748848799"},
			{'name':"SuperNET",'asset':"12071612744977229797"},
			{'name':"jl777hodl",'asset':"6932037131189568014"},
			{'name':"SkyNET",'asset':"6854596569382794790"},
			{'name':"mgwBTC",'asset':"17554243582654188572"},
			{'name':"LIQUID",'asset':"4630752101777892988"}
		];
		var ids = ["11","12","21","22","31","32","41","42","51","52","61","62","71","72","81","82","91","92","101","102","111","112","121","122"];
		var lastAsset = "";
		var tempFavs = []

		for (var i = 0; i < ids.length; ++i)
		{
			var randIndex = Math.floor(Math.random() * defaultFavs.length);
			var randFav = {} 
			randFav ['name'] = defaultFavs[randIndex]['name']
			randFav['asset'] = defaultFavs[randIndex]['asset']
			randFav['id'] = ids[i]
			
			if (randFav['asset'] == lastAsset)
			{
				--i;
				continue;
			}
			
			lastAsset = randFav['asset']
			chartFavs.push(randFav)
		}
	}
	
	localStorage.setItem('chartFavorites', JSON.stringify(chartFavs));

	
	for (var i = 0; i < chartFavs.length; ++i)
	{	
		$(".chart-control[chart-id='"+chartFavs[i]['id']+"']").val(chartFavs[i]['name']).attr("data-asset", chartFavs[i]['asset']);
		$("#chart-curr-"+chartFavs[i]['id']).html(chartFavs[i]['name']).attr("data-asset", chartFavs[i]['asset']);
	}
	
	$('.mini-chart').each(function()
	{
		var assetid = $(this).find(".mini-chart-area-1 span").first().attr("data-asset");
		var baseNXT = false
		if (assetid == NXT_ASSET)
		{
			assetid = $(this).find(".mini-chart-area-1 span").first().next().attr("data-asset")
			baseNXT = true
		}
		var divid = $(this).find(".mini-chart-area-4").attr('id');
		if (assetid != "-1")
			IDEX.makeMiniChart(assetid, divid, baseNXT);
	})
}


function saveChartFavorites()
{
	var parsed = []
	
    $(".chart-control").each(function() 
	{
		var name = $(this).val();
		var id = $(this).attr("chart-id");
		var asset = $(this).attr("data-asset");
		
		parsed.push({"name":name,"id":id,"asset":asset});
    });
	
	localStorage.setItem('chartFavorites', JSON.stringify(parsed));
	chartFavs = parsed;
}


function sendPost(params, isNXT) 
{
	var dfd = new $.Deferred();
	var url = isNXT ? nxtURL : snURL;
	params = isNXT ? params : JSON.stringify(params);

	$.ajax
	({
	  type: "POST",
	  url: url,
	  data: params,
	  //contentType: 'application/json'
	}).done(function(data)
	{
		data = $.parseJSON(data);
		dfd.resolve(data);
		
	}).fail(function(data)
	{
		dfd.reject(data);
	})

	return dfd.promise();
}


function getAssetInfo(key, val)
{
	var arr = [];
	var assetInfo = {};
	var len = allAssets.length;
	
	for (var i = 0; i < len; ++i)
	{
		if (allAssets[i][key] == val)
		{
			arr.push(allAssets[i]);
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
				numTrades = arr[i].numberOfTrades;
				index = i;
			}
		}
		
		assetInfo = arr[index];
	}
	
	return assetInfo;
}


function updateCurrentBalance()
{
	var $buy = $("#balanceBuy")
	var $sell = $("#balanceSell")
	var baseBal = ["0", ".0"]
	var relBal = ["0", ".0"]
	
	$buy.find("span").first().text(IDEX.curRel.name);
	$sell.find("span").first().text(IDEX.curBase.name);
	
	sendPost({'requestType':"getAccountAssets",'account':rs}, 1).done(function(data)
	{
		if (!("errorCode" in data))
		{
			var balances = data['accountAssets'];
			baseBal = parseBalance(balances, IDEX.curBase.name);
			relBal = parseBalance(balances, IDEX.curRel.name);

			$buy.find(".bal-value span").first().text(relBal[0]).next().text(relBal[1]);
			$sell.find(".bal-value span").first().text(baseBal[0]).next().text(baseBal[1]);
		}
	})
}

function parseBalance(balances, assetName)
{
	var whole = "0";
	var dec = ".0";
	
	for (var i = 0; i < balances.length; ++i)
	{
		if (balances[i].name == assetName)
		{
			var amount = String(balances[i].quantityQNT/Math.pow(10, balances[i].decimals));
			var both = amount.split(".");
			
			whole = both[0];
			if (both.length > 1)
				dec	= "." + both[1];
			
			break;
		}
	}
	
	return [whole, dec];
}


$("#miniChartsC .mini-chart .mini-chart-area-1").on("click", function()
{
	hotkeyHandler($(this));
})
$("#miniChartsTop .chart-box, #miniChartsTop2 .chart-box-2 .chart-sub-box-2").on("click", function()
{
	hotkeyHandler($(this).find("span").first());
})
function hotkeyHandler($div)
{
	var baseid = $div.find("span").eq(0).attr("data-asset");
	var relid = $div.find("span").eq(1).attr("data-asset");
	
	if (baseid && relid && baseid.length && relid.length)
	{
		loadOrderbook(baseid, relid);
	}	
}

$(".md-modal-2").on("idexShow", function()
{
	
})


$("#modal-04").on("idexHide", function()
{
    $(".chart-control").each(function() 
	{
		var id = $(this).attr('chart-id');
		var asset = $(this).attr('data-asset');
		if ((id == "91" || id == "101" || id == "111" || id == "121") && asset != "-1")
		{
			var nextAsset = $(this).next().attr('data-asset');
			var baseNXT = asset == NXT_ASSET;
			
			for (var i = 0; i < chartFavs.length; ++i)
			{
				if (chartFavs[i]['id'] == id && (chartFavs[i]['asset'] != asset || (baseNXT && chartFavs[i+1]['asset'] != nextAsset)))
				{
					var divid = $("#chart-curr-"+id).closest(".mini-chart").find(".mini-chart-area-4").attr("id");
					var miniAsset = baseNXT ? nextAsset : asset
					IDEX.makeMiniChart(miniAsset, divid, baseNXT);
				}
			}
		}
		$("#chart-curr-"+id).attr("data-asset", asset)
		$("#chart-curr-"+id).text($(this).val());
    });
	
	saveChartFavorites();
})


$(".md-modal").on("idexHide", function()
{
	$(this).find(".tabs-container div").removeClass("active").first().addClass("active");
	$(this).find(".tabs-nav .nav").removeClass("active").first().addClass("active");
})


$(".tab-tables .nav").on("click", function()
{
	var $table = $("#"+$(this).attr('tab-index')).find("table");
	if ($table.length) { tableHandler($table); }
})
$(".md-modal").on("idexShow", function()
{
	var $table = $("#"+$(this).find(".nav.active").attr('tab-index')).find("table");
	if ($table.length) { tableHandler($table); }
})


$("#openOrdersTable tbody").on("click", "tr", function(e)
{
	var quoteid = $(this).attr("data-quoteid");
	var $thisScope = $(this);
	
	sendPost({'requestType':"cancelquote",'quoteid':quoteid}).done(function(data)
	{
		$thisScope.closest(".md-content").find(".tab-tables .nav.active").trigger("click");
	})
})


$("#marketTable tbody").on("click", "tr", function()
{
	loadOrderbook($(this).attr("data-baseid"), $(this).attr("data-relid"));
	$(".md-overlay").trigger("click");
})


function tableHandler($modalTable)
{
	var keys = $modalTable.find("thead").attr("data-keys").split(" ");
	var method = $modalTable.attr("data-method");
	var params = {'requestType':method};
	var type = 0;
	
	if (method == "tradehistory")
	{
		params['timestamp'] = 0;;
	}
	else if (method == "getAccountAssets")
	{
		params['account'] = rs;
		type=1;
	}
	sendPost(params, type).done(function(data)
	{
		var row = "";

		if (keys[0] in data)
		{
			var tableData = data[keys[0]];
			
			keys.splice(0,1);

			if (method == "openorders")
			{
				tableData = formatPairName(tableData);
				formatOpenOrders(tableData);
				row = buildTableRows(objToList(tableData, keys));
				row = $(row).each(function()
				{
					$(this).find("td:last").after("<td class='cancelOrder'>CANCEL</td>");
				})
				row = addRowAttr(row, tableData, ["quoteid"]);
			}
			else if (method ==	"allorderbooks")
			{
				addEmptyMarketData(tableData);
				row = buildTableRows(objToList(tableData, keys));
				row = addRowAttr(row, tableData, ["baseid","relid"]);
			}
			else if (method == "tradehistory")
			{
				if ("rawtrades" in tableData) 
				{
					tableData = tableData['rawtrades'];
					/*for (var i = 0; i < tableData.length; ++i)
					{
						if ("assetA" in tableData[i])
						{
							tableData.splice(i, 1)
							--i
						}
					}*/
					addAssetNames(tableData, "baseid", "relid");
					tableData = formatPairName(tableData);
				}
			}
			else if (method == "getAccountAssets")
			{
				sendPost({'requestType':"getBalance", 'account':rsid}, 1).done(function(nxtBal)
				{
					tableData.push({'name':"NXT", 'asset':NXT_ASSET, 'quantityQNT': nxtBal['balanceNQT'], 'decimals':8})
					for (var i = 0; i < tableData.length; ++i)
					{
						var decimals = tableData[i].decimals;
						
						tableData[i].quantityQNT = tableData[i].quantityQNT / Math.pow(10, decimals);
						tableData[i].unconfirmedQuantityQNT = "-"
						tableData[i]['change'] = "-"
					}
					row = buildTableRows(objToList(tableData, keys));
					$modalTable.find("tbody").empty().append(row);
				})
			}
			
			if (!row.length && method != "getAccountAssets")
				row = buildTableRows(objToList(tableData, keys));
		}
		
		$modalTable.find("tbody").empty().append(row);
	})
}

function getNXTBal()
{
	
}

function formatOpenOrders(tableData)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['askoffer'] = tableData[i]['askoffer'] == 1 ? "Ask" : "Bid";
		tableData[i]['total'] = tableData[i]['relamount']/SATOSHI;
	}
	
	return tableData
}

function formatPairName(tableData)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['market'] = tableData[i]['base'] + "/" + tableData[i]['rel'];
	}

	return tableData;
}


function addEmptyMarketData(tableData, keys)
{
	keys = typeof keys === "undefined" ? ["last", "high", "low", "volume"] : keys;
	for (var i = 0; i < tableData.length; ++i)
	{
		for (var j = 0; j < keys.length; ++j)
		{
			tableData[i][keys[j]] = "-";
		}
	}
	
	return tableData;
}


function addAssetNames(tableData, baseName, relName)
{
	for (var i = 0; i < tableData.length; ++i)
	{
		tableData[i]['base'] = getAssetInfo("name", [tableData[i][baseName]])['name'];
		tableData[i]['rel'] = getAssetInfo("name", [tableData[i][relName]])['name'];
	}
	
	return tableData;
}



function getFormData($form) 
{
	var serialized = $form.serializeArray();
	var data = {};

	for (var s in serialized) 
	{
		data[serialized[s]['name']] = serialized[s]['value'];
	}

	return data;
}


function extractPostPayload($element)
{
	var params = {};

	if ($element.is("button"))
	{
		var $form = $("#" + $element.attr("data-form"));
		params = getFormData($form);
	}
	else
	{
		params = $element.data();
	}

	return params;
}


function buildPostPayload(method, data)
{
	var params = {'requestType':method};

	for (var i = 0; i < postParams[method].length; ++i)
	{
		for (var key in data)
		{
			if (key == postParams[method][i])
			{
				params[key] = data[key];
				break;
			}
		}
	}

	return params;
}


$(".idex-submit").on("click", function()
{
	var $form = $("#" + $(this).attr("data-form"));
	var method = $(this).attr("data-method");
	var params = extractPostPayload($(this));

	params = buildPostPayload(method, params);

	if (method == "orderbook")
	{
		loadOrderbook(params.baseid, params.relid);
	}
	else if (method == "placebid" || method == "placeask")
	{
		params['baseid'] = IDEX.curBase.asset;
		params['relid'] = IDEX.curRel.asset;

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
		sendPost(params);
	}

	if ($form)
	{
		$form.trigger("reset");
	}
	$(".md-overlay").trigger("click");
})


function loadOrderbook(baseid, relid)
{
	if (!isStoppingOrderbook)
	{
		IDEX.curBase = getAssetInfo("asset", Number(baseid));
		IDEX.curRel = getAssetInfo("asset", Number(relid));
		
		updateCurrentBalance();
		stopPollingOrderbook();
	}
}


function stopPollingOrderbook()
{
	if (orderbookAsync) 
	{
		isStoppingOrderbook = true;
        setTimeout(stopPollingOrderbook, 100);
		return false;
    }
	
	isStoppingOrderbook = false;
	clearTimeout(orderbookTimeout);
	emptyOrderbook(IDEX.curBase.name+"/"+IDEX.curRel.name);
	currentOrderbook = new orderbookVar();
	IDEX.killChart();
	IDEX.makeChart({'baseid':IDEX.curBase.asset, 'relid':IDEX.curRel.asset, 'basename':IDEX.curBase.name, 'relname':IDEX.curRel.name});
	pollOrderbook(1);
}


function emptyOrderbook(currPair)
{
	$("#currPair .order-text").html(currPair);
	$("#buyBook table tbody").empty();
	$("#sellBook table tbody").empty();
	$("#currLast .order-text").empty().html('0');
}


function pollOrderbook(timeout)
{
	orderbookTimeout = setTimeout(function() 
	{
		var params = {'requestType':"orderbook", 'baseid':IDEX.curBase.asset, 'relid':IDEX.curRel.asset, 'allfields':1, 'maxdepth':20};
		orderbookAsync = true;
		sendPost(params).done(function(orderbookData)
		{
			orderbookAsync = false;
			if (!("error" in orderbookData))
			{
				orderbookData['bids'].sort(compare);
				orderbookData['asks'].sort(compare);
				orderbookData['bids'].reverse();
				orderbookData['asks'].reverse();

				updateOrderbook(orderbookData);
			}

			pollOrderbook(3000);
		}).fail(function(data)
		{
			orderbookAsync = false;
		})
	}, timeout)
}


function groupOrders(orders, currentOrders)
{
	var oldOrders = [];
	var newOrders = [];
	var expiredOrders = [];
	var newOrdersRow = "";
	
	for (var i = 0; i < currentOrders.length; ++i)
	{
		currentOrders[i]['index'] = i;
	}
	
	for (var i = 0; i < orders.length; i++)
	{
		var loopOrd = orders[i];
		var isNew = true;

		for (var j = 0; j < currentOrders.length; j++)
		{
			var loopCurOrd = currentOrders[j];

			if (compObjs(loopOrd, loopCurOrd, orderCompKeys))
			{
				oldOrders.push(loopOrd);
				currentOrders.splice(j, 1);
				isNew = false;;
				break
			}
		}

		if (isNew)
		{
			loopOrd.price = toSatoshi(loopOrd.price).toFixed(8);
			loopOrd.volume = toSatoshi(loopOrd.volume).toFixed(8);
			var trString = buildTableRows([[loopOrd.price, loopOrd.volume]]);
			var trClasses = (loopOrd['exchange'] == "nxtae_nxtae") ? "virtual" : "";
			trClasses += (loopOrd['offerNXT'] == rsid) ? " own-order" : ""
			newOrdersRow += addRowClass(trString, trClasses);
			
			newOrders.push(loopOrd);
		}
	}
	
	expiredOrders = currentOrders;

	return {'expiredOrders':expiredOrders, 'newOrders':newOrders, 'newOrdersRows':newOrdersRow, 'oldOrders':oldOrders};
}


function updateOrderbook(orderbookData)
{
	var lastPrice = orderbookData.bids.length ? orderbookData.bids[0].price : 0;
	var bidData = groupOrders(orderbookData.bids.slice(), currentOrderbook.bids.slice());
	var askData = groupOrders(orderbookData.asks.slice(), currentOrderbook.asks.slice());
	askData['orderbookData'] = orderbookData;
	bidData['orderbookData'] = orderbookData;
	askData.newOrders.reverse();
	//console.log(orderbookData)
	//console.log(currentOrderbook)
	//console.log(bidData)
	//console.log(askData)
	updateOrders($("#buyBook table"), bidData);
	updateOrders($("#sellBook table"), askData);
	animateOrderbook();
	currentOrderbook = new orderbookVar(orderbookData);

	$("#currLast .order-text").html(Number(Number(lastPrice).toFixed(8)));
	//console.log(orderbookData)
}


function animateOrderbook()
{
	$(".newrow").find('td').wrapInner('<div style="display: none; background-color:#333;" />').parent().find('td > div').slideDown(700, function()
	{
		var $set = $(this);
		$set.replaceWith($set.contents());
	})
	$(".expiredRow").find('td').wrapInner('<div style="display: block; background-color:#333;" />').parent().find('td > div').slideUp(700, function()
	{
		$(this).parent().parent().remove();
	})

	$(".newrow").removeClass("newrow");
	$(".expiredRow").removeClass("expiredRow");
}


function updateOrders($book, orderData)
{
	if (!($book.find("tr").length))
	{
		$book.find("tbody").empty().append(orderData.newOrdersRows);
	}
	else
	{
		$book.find("tr").each(function(index, element)
		{
			removeOrders($(this), orderData, index);
		})
		$book.find("tr").each(function(index, element)
		{
			var isAsk = ($(this).closest("div").attr('id') == "buyBook") ? false : true;
			var rowData = isAsk ? currentOrderbook.asks[index] : currentOrderbook.bids[index];
			addNewOrders($(this), orderData, rowData, index);
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
	var trRows = $(orderData.newOrdersRows).toArray();
	
	for (var i = 0; i < orderData.newOrders.length; i++)
	{
		var loopNewOrd = orderData.newOrders[i];
		var trString = addRowClass($(trRows)[i], "newrow");
		//class = order-row cbutton cbutton--effect-jelena

		if (loopNewOrd.price < Number(rowData.price))
		{
			var $sib = $row.next();
			if ($sib && $sib.length)
			{
				var isAsk = ($row.closest("div").attr('id') == "buyBook") ? false : true;
				var sibData = isAsk ? currentOrderbook.asks[index + 1] : currentOrderbook.bids[index+1];
				//console.log($sib)
				//console.log(index)
				//console.log(currentOrderbook.asks)
				//console.log(sibData)
				if (!sibData || (loopNewOrd.price >= Number(sibData.price)))
				{
					$row.after($(trString));
				}
				else
				{
					break
				}
			}	
			else
			{
				$row.after($(trString));
			}
		}
		else
		{
			$row.before($(trString));
		}
		
		orderData['newOrders'].splice(i,1);
		trRows.splice(i, 1);
		--i;
	}
}



$("input[name='price'], input[name='volume']").on("keyup", function() 
{
	var $form = $(this).closest("form");
	var price = $form.find("input[name='price']").val();
	var amount = $form.find("input[name='volume']").val();
	var total = Number(price)*Number(amount);
	
	$form.find("input[name='total']").val(String(total));
});


$("#sellBook table tbody").on("click", "tr", function(e)
{
	var order = getRowData($(this));
	pendingOrder = order;
	console.log(order);
	
	confirmPopup($("#"+$("#tempBuyClick").data("modal")), order);
	$("#tempBuyClick").trigger("click");

	$("#placeBidPrice").val(order.price);
	$("#placeBidAmount").val(order.volume).trigger("keyup");
	$("#tab1").trigger("click")
})


$("#buyBook table tbody").on("click", "tr", function(e)
{
	var order = getRowData($(this))
	pendingOrder = order
	console.log(order)
	
	confirmPopup($("#"+$("#tempBuyClick").data("modal")), order)
	$("#tempBuyClick").trigger("click")
	
	$("#placeAskPrice").val(order.price);
	$("#placeAskAmount").val(order.volume).trigger("keyup");
	$("#tab2").trigger("click");
})

$(".conf-input").css("width","80%")

function confirmPopup($modal, order)
{
	var type = order.askoffer == 1 ? "sell" : "buy"
	//$modal.find(".conf-temphide").hide()
	$modal.find(".conf-title").text("Confirm " + (order.askoffer ? "Buy" : "Sell") + " Order")
	$modal.find(".conf-pair").text(currentOrderbook.pair)
	$modal.find(".conf-amount").val(order.volume)
	$modal.find(".conf-price").val(order.price)
	$modal.find(".conf-total").val((order.price*order.volume).toFixed(8))
	$modal.find(".conf-type").text("makeoffer3")
	$modal.find(".conf-base").text(order.base)
	$modal.find(".conf-exchange").text(order.exchange)
	$modal.find(".conf-rel").text(order.rel)
	$modal.find(".conf-fee").val(((order.exchange == "nxtae_nxtae") ? "5" : "2.5"))
	$(".conf-jumbotron").find("p").empty()
}

$(".conf-confirm").on("click", function(){ triggerMakeoffer($(this)); })

function triggerMakeoffer($button)
{
	var params = {"requestType":"makeoffer3"}
	var price = $(".conf-price").val();
	var amount = $(".conf-amount").val();
	var isnum = !isNaN(amount)

	if (isnum && amount <= pendingOrder['volume'])
	{
		$button.attr('disabled', "disabled")
		if (amount != pendingOrder['volume'])
		{
			var perc = ((Number(amount)/Number(pendingOrder['volume']))*100).toFixed(0)
			console.log(perc)
			params['perc'] = perc
		}
		for (var i = 0; i < postParams.makeoffer3.length; ++i)
		{
			params[postParams.makeoffer3[i]] = pendingOrder[postParams.makeoffer3[i]]
		}
		console.log(params)

		sendPost(params).done(function(data)
		{
			console.log(data);
			$button.removeAttr('disabled')
			if ("error" in data && data.error.length)
			{
				console.log('error')
				$(".conf-jumbotron").find("p").text(data['error'])
			}
			else
			{
				console.log("success")
				$(".md-overlay").trigger("click")
			}
		})

	}
	else
	{
		var text = ""
		if (isnum)
			text = "Quantity higher than order's quantity ("+String(pendingOrder['volume'])+")"
		else
			text = "Not a number"
		$(".conf-jumbotron").find("p").text(text)
	}
}

$("input.conf-amount").on("keyup", function() 
{
	var $form = $(this).closest(".conf-form");
	var amount = $(this).val();
	var price = pendingOrder['price'];
	var total = Number(price)*Number(amount);
	$form.find(".conf-total").val(total.toFixed(8))

});



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
	var isAsk = ($row.closest("div").attr('id') == "buyBook") ? false : true;
	var index = $row[0].rowIndex;
	var rowData = isAsk ? currentOrderbook.asks[index] : currentOrderbook.bids[index];

	return rowData;
}

function addRowClass(row, rowClass)
{
	var s = "";
	
	$(row).each(function(e, p)
	{
		$(p).addClass(rowClass);
		s += $(p)[0].outerHTML;
	})
	
	return s;
}


function addRowAttr(row, data, keys)
{
	var s = "";
	var i = 0;
	
	$(row).each(function(e, p)
	{
		for (var j = 0; j < keys.length; ++j)
		{
			$(p).attr("data-"+keys[j], data[i][keys[j]]);
		}
		
		s += $(p)[0].outerHTML;
		++i;
	})
	
	return s;
}


function objToList(data, keys)
{
	var arr = [];

	for (var i = 0; i < data.length; ++i)
	{
		var loopArr = [];

		for (var j = 0; j < keys.length; ++j)
		{
			loopArr.push(data[i][keys[j]]);
		}
		arr.push(loopArr);
	}

	return arr;
}


function compObjs(aObj, bObj, keys)
{
	var compCount = 0;

	for(var i = 0; i < keys.length; i++)
	{
		if (aObj[keys[i]] == bObj[keys[i]])
		{
			compCount++;
		}
	}

	return ((compCount == keys.length) ? true : false);
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
	return Math.round(Number(number) * SATOSHI) / SATOSHI;
}


$(".order-button").on("mouseover", function()
{
	var text = $(this).find("button").attr("data-method") == "placebid" ? "B<br>U<br>Y" : "S<br>E<br>L<br>L";
	$(this).find("button").html(text);
})
$(".order-button").on("mouseout", function()
{
	$(this).find("button").html("P<br>L<br>A<br>C<br>E");
})


$("#sellBook").on("mouseover", "tr", function()
{
	$(this).find("td").addClass("sell-hover")
})

$("#sellBook").on("mouseleave", "tr", function()
{
	$(this).find("td").removeClass("sell-hover")
})

$("#buyBook").on("mouseover", "tr", function()
{
	$(this).find("td").addClass("buy-hover")
})

$("#buyBook").on("mouseleave", "tr", function()
{
	$(this).find("td").removeClass("buy-hover")
})


	return IDEX;
	
}(IDEX || {}, jQuery));





var IDEX = (function(IDEX, $, undefined)
{


	IDEX.isInspect = false

	$("#inspect-trig img").on("mouseup", function()
	{
		//$("#tileModalTrig").trigger("click");
		
		if (!IDEX.isInspect)
		{
			//$("body").css("cursor", "url('img/dropper.png') 4 30, pointer");
			$(this).addClass("active")
			$("body").css("cursor", "pointer");

		}
		else
		{
			$(this).removeClass("active")
			$("body").css("cursor", "default");
		}
		
		IDEX.isInspect = !IDEX.isInspect;
	})
	
	$(".inspectable").on("mouseover", function()
	{
		if (IDEX.isInspect)
		{
			
			$(this).addClass("fadeSlowIndy");
			$(this).addClass("inspectedHover");
		}
	})
	
	$(".inspectable").on("mouseout", function()
	{
		if (IDEX.isInspect)
		{
			$(this).removeClass("inspectedHover");
		}
	})
	
	$(".inspectable").on("click", function()
	{
		if (IDEX.isInspect)
		{
			
			var inspectType = $(this).attr("data-inspecttype")
			var inspectData = $(this).attr("data-inspect")
			
			var tab = inspectType == "pair" ? "1" : "2"
			$(".footer-menu-nav-cell[data-tab='"+tab+"']").trigger("click")
			$(".left-bottom-tab-wrap").removeClass("active")
			$(".left-bottom-tab-wrap[data-tab='"+tab+"']").addClass("active")
			
			
			if (inspectType == "pair")
			{
				var both = inspectData.split("_")
				//var both = ["6932037131189568014", "5527630"]
				var base = IDEX.user.getAssetInfo("assetID", both[0])
				var rel = IDEX.user.getAssetInfo("assetID", both[1])
				
				makeInspectChart(base, rel)
				makeOrderbook(base.assetID, rel.assetID)
				makeAssetInfo(base, rel)
			}
			else if (inpectType == "candle")
			{
				
			}
		}
	})
	
	
	IDEX.makeChartMarketInspect = function(chart, settings)
	{
		var tab = "1"
		$(".footer-menu-nav-cell[data-tab='"+tab+"']").trigger("click")
		$(".left-bottom-tab-wrap").removeClass("active")
		$(".left-bottom-tab-wrap[data-tab='"+tab+"']").addClass("active")

		var a = settings.pair.split("_")
		var both = getTemp(a[0], a[1])
		//var both = ["6932037131189568014", "5527630"]
		console.log(settings.pair)
		console.log(both)
		
		var base = IDEX.user.getAssetInfo("assetID", both[0])
		var rel = IDEX.user.getAssetInfo("assetID", both[1])
		
		makeInspectChart(base, rel)
		makeOrderbook(base.assetID, rel.assetID)
		makeAssetInfo(base, rel)
	}
	
	
	function getTemp(baseID, relID)
	{
		var nxtass = "5527630"
		
		var base = IDEX.user.getAssetInfo("name", baseID)
		var rel = IDEX.user.getAssetInfo("name", relID)
		
		if (!($.isEmptyObject(base)))
		{
			var basename = base.assetID
		}
		else
		{
			var basename = baseID
		}

		if (!($.isEmptyObject(rel)))
		{
			var relname = rel.assetID
		}
		else
		{
			var relname = relID
		}
		
		return [basename, relname]
	}
	
	
	function makeInspectChart(base, rel)
	{
		var baseID = base.assetID;
		var relID = rel.assetID;
		
		IDEX.makeMiniChart(baseID, relID, "inspect_temp_chart")
		
	}
	
	
	function makeAssetInfo(base, rel)
	{
		var baseID = base.assetID;
		var relID = "NXT"
		
		var settings = {}
		settings.pair = String(baseID) + "_" + relID
		var market = base.name + "_" + rel.name
		$(".inspect-area-middle-title").find("span").text(market);
		getTicker(settings).done(function(data)
		{
			console.log(data)
		})
		
		/*this.assetID = "";
		this.name = "";
		this.decimals = -1;
		this.quantityQNT = "";
		this.account = "";
		this.accountRS = "";
		this.description = "";
		this.numberOfTrades = 0;
		this.numberOfAccounts = 0;
		this.numberOfTransfers = 0;*/
		
	}
	
	function getTicker(settings)
	{
	
		var dfd = new $.Deferred();

        var obj = {}
        obj['run'] = "quotes";
        obj['section'] = "crypto";
        obj['mode'] = "bars";
        obj['exchg'] = "nxtae";
        obj['pair'] = settings.pair
        obj['num'] = "8"
        obj['bars'] = "time"
        obj['len'] = "21600"
		obj['order'] = "asc"

        var params = new IDEX.SkyNETParams(obj)
        var url = params.makeURL()
		console.log(url)
		$.getJSON(url, function(data)
		{
			dfd.resolve(data)	
		})
		
		return dfd.promise()
	}
	
	function makeOrderbook(baseID, relID)
	{
		orderbookPost(baseID, relID).done(function(orderbook)
		{
			console.log(orderbook)
			formatOrderData(orderbook.bids)
			formatOrderData(orderbook.asks)
			
			var bids = orderbook.bids;
			var asks = orderbook.asks.reverse();
			
			var $buyBook = $(".inspect-area-orderbook-bids")
			var $sellBook = $(".inspect-area-orderbook-asks")

			$buyBook.empty()
			$sellBook.empty()
			
			var lastPrice = bids[0].price;
			$(".inspect-area-orderbook-last span").empty().text(String(lastPrice))
			
			$("#inspect-area-high-bid").text(String(lastPrice))
			$("#inspect-area-low-ask").text(String(asks[0].price))
			
			for (var i = 0; i < asks.length; i++)
			{
				var order = asks[i]
				var trString = buildTableRows([[order.price, order.volume, order.total]]);
					
				$sellBook.append(trString)
			}
			
			for (var i = 0; i < bids.length; i++)
			{
				var order = bids[i]
				var trString = buildTableRows([[order.price, order.volume, order.total]]);
					
				$buyBook.append(trString)
			}
		})
	}
	
	
	function buildTableRows(data)
	{
		var row = "";
		var rowWrap = "";
		var tdWrap = "";


			rowWrap = "<div class='inspect-area-orderbook-order-row'></div>"
			tdWrap = "<span class='inspect-area-orderbook-order-col'></span>";
		
		for (var i = 0; i < data.length; ++i)
		{
			var td = "";

			for (var j = 0; j < data[i].length; ++j)
			{
				td += $(tdWrap).text(data[i][j])[0].outerHTML
			}
			
			row += $(td).wrapAll(rowWrap).parent()[0].outerHTML
		}

		return row;
	}
	
	function orderbookPost(baseID, relID)
	{
		var retDFD = new $.Deferred();
		var thisScope = this;
		var params = 
		{
			'requestType':"orderbook", 
			'baseid':baseID, 
			'relid':relID, 
			'allfields':1,
			'maxDepth':8,
			'showAll':0
		};
		
		//var time = Date.now()
		//console.log('starting inspect orderbook ajax');
		
		this.xhr = IDEX.sendPost(params, false, function(orderbookData)
		{
			//console.log(orderbookData);
			//console.log("finished orderbook ajax " + String((Date.now() - time)/1000) + "s");

			retDFD.resolve(orderbookData);
		})
		
		return retDFD.promise();
	}
	
	function formatOrderData(orders)
	{

		var len = orders.length;
		var isAsk = len && orders[0].askoffer;
		orders.sort(IDEX.compareProp('price'))
		
		if (!isAsk)
			orders.reverse();
		
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
		}
	}
	
	
	
	var topPadding = 20;
	var bottomPadding = 20;
	var leftPadding = 20;
	
	IDEX.makeCandleArea = function(candle, chart)
	{
		console.log(candle)
		console.log(chart)
		
		var tab = "2"
		$(".footer-menu-nav-cell[data-tab='"+tab+"']").trigger("click")
		$(".left-bottom-tab-wrap").removeClass("active")
		$(".left-bottom-tab-wrap[data-tab='"+tab+"']").addClass("active")
			
		var phase = candle.phase;
		
		var open = phase.open;
		var high = phase.high;
		var low = phase.low;
		var close = phase.close;
		
		var closedHigher = close > open

		var $svg = $("#inspect_candle_stick");
		var node = "#inspect_candle_stick"
		
		
		
		drawLines(phase)
		var pos = getCandlePositions(phase)
		drawCandleStick(pos, closedHigher)
		var $table = $("#inspectTradesTable")
		$table.find("tbody").empty()
		getTrades(chart.settings).done(function(trades)
		{
			var parsed = parseTrades(trades, phase)
			for (var i = 0; i < parsed.length; i++)
			{
				var trade = parsed[i]
				parsed[i].volume = IDEX.formatNumWidth(Number(parsed[i].volume));
				parsed[i].price = IDEX.formatNumWidth(Number(parsed[i].price));
				parsed[i].amount = IDEX.formatNumWidth(Number(parsed[i].amount));

			}
			var keys = ["price", "amount", "volume", "timestamp"]
			var row = tradeTable(IDEX.objToList(parsed, keys));
			var lastPrice = "0"
			row = $(row).each(function(e, i)
			{
				var price = $(this).find("td:first").text();
				var addClass = Number(price) >= lastPrice ? "text-green" : "text-red";
				$(this).find("td:first").addClass(addClass);
				lastPrice = price;
			})
			$table.find("tbody").empty().append(row);
		})	
		candleInfo(phase, chart)
	}
	
	function candleInfo(phase, chart)
	{
		var $el = $(".inspect-candle-middle")
		var sleuthchart = chart.sleuthchart
		var settings = chart.settings;
		
		var $curpair = $(".inspect-candle-pair")
		
		var pair = settings.pair
		var both = pair.split("_")
		
		console.log(both)
		
		var baseraw = both[0]
		var relraw = both[1]

		var names = getNames(baseraw, relraw)
		var basename = names[0]
		var relname = names[1]
		
		var market = basename + "_" + relname
		$curpair.text(market);	
		
		$(".inspect-candle-open-d").text(String(phase.open))
		$(".inspect-candle-high-d").text(String(phase.high))
		$(".inspect-candle-low-d").text(String(phase.low))
		$(".inspect-candle-close-d").text(String(phase.close))
		$(".inspect-candle-vol-d").text(String(phase.vol))

			
		console.log(phase)
		
		//$el.html(str)
	}
	
	function getNames(baseID, relID)
	{
		
		var nxtass = "5527630"
		
		var base = IDEX.user.getAssetInfo("assetID", baseID)
		var rel = IDEX.user.getAssetInfo("assetID", relID)
		
		if (!($.isEmptyObject(base)))
		{
			var basename = base.name
		}
		else
		{
			var basename = baseID
		}

		if (!($.isEmptyObject(rel)))
		{
			var relname = rel.name
		}
		else
		{
			var relname = relID
		}
		
		return [basename, relname]
	}
	
	
	function getPos(min, max, pointValue, height)
	{
		var bottom = height + topPadding
		
		var num = pointValue - min;
		var range = max - min;
		var ratio = num / range;
		var pos = Number((bottom - (ratio * height)).toFixed(4));
		//console.log(String(pointValue) + "    " + String(ratio) + "  " + String(pos));
		return pos
	}
	
	
	function getPriceFromY (min, max, yPos, height)
	{
		
		var range = max - min;
		var ratio = yPos / height;
		var num = ratio * range
		var price = max - num
		return price
	}
	
	function tradeTable(data)
	{
		var row = "";
		var rowWrap = "<tr></tr>"
		var tdWrap = "<td></td>";
		
		for (var i = 0; i < data.length; ++i)
		{
			var td = "";

			for (var j = 0; j < data[i].length; ++j)
			{
				td += $(tdWrap).text(data[i][j])[0].outerHTML
			}
			
			row += $(td).wrapAll(rowWrap).parent()[0].outerHTML
		}

		return row;
	}
	
	function parseTrades(trades, phase)
	{
		//console.log(trades)
		console.log(phase)
		
		trades = trades.results;
		
		var startTime = phase.startTime / 1000
		var endTime = phase.endTime / 1000
		
		var startIndex = -1;
		var endIndex = -1;
		var len = trades.length;

		
		for (var i = 0; i < len; i++)
		{
			var trade = trades[i]
			
			if (trade.timestamp < startTime)
			{
				continue
			}
			if (trade.timestamp >= startTime && startIndex == -1)
			{
				startIndex = i
			}
			if (trade.timestamp >= endTime)
			{
				endIndex = i
				break;
			}
		}	
		
		//console.log(trades)
		//console.log(startIndex)
		var parsed = trades.slice(startIndex, endIndex+1)
		console.log(parsed)
		return parsed
	}
	
	
	function getTrades(settings)
	{
	
		var dfd = new $.Deferred();
		console.log(settings)
        var obj = {}
        obj['run'] = "quotes";
        obj['section'] = "crypto";
        obj['mode'] = "trades";
        obj['exchg'] = settings.exchange;
        obj['pair'] = settings.pair
        obj['num'] = "500"
        obj['bars'] = settings.bars
        obj['len'] = settings.barWidth
		obj['order'] = "asc"

        var params = new IDEX.SkyNETParams(obj)
        var url = params.makeURL()
		console.log(url)
		$.getJSON(url, function(data)
		{
			dfd.resolve(data)	
		})
		
		return dfd.promise()
	}
	
	
	function drawCandleStick(pos, closedHigher)
	{

		var strokeColor = closedHigher ? "#19B34C" : "#D12E2E";
		var fillColor = closedHigher ?  "transparent" : "#9C0505";
		
		var $svg = $("#inspect_candle_stick");
		var node = "#inspect_candle_stick"
		
		var bbox = d3.select(node)[0][0].getBoundingClientRect();
		var width = bbox.width;
		var height = bbox.height;
	

		var d = 
		[
			"M", pos.left, pos.topBody, 
			"L", pos.left, pos.bottomBody, 
			"L", pos.right, pos.bottomBody, 
			"L", pos.right, pos.topBody, 
			"Z", 
			"M", pos.middle, pos.bottomBody, 
			"L", pos.middle, pos.bottomLeg, 
			"M", pos.middle, pos.topBody, 
			"L", pos.middle, pos.topLeg
		]
		
		var $stick = $svg.find(".stick")
		$stick.empty()
		
		d3.select($stick.get()[0])
		.append("path")
		.attr("d", d.join(" "))
		.attr("fill", fillColor)
		.attr("stroke", strokeColor)
		.attr("stroke-width", 1)
		.attr('shape-rendering', "crispEdges")
	}
	
	
	function getCandlePositions(phase)
	{
		var $svg = $("#inspect_candle_stick");
		var node = "#inspect_candle_stick"
		
		var bbox = d3.select(node)[0][0].getBoundingClientRect();
		var width = bbox.width;
		var height = bbox.height;
		height = height - (topPadding + bottomPadding);

		var open = phase.open;
		var high = phase.high;
		var low = phase.low;
		var close = phase.close;
		
		var closedHigher = close > open
		var top = closedHigher ? close : open;
		var bottom = closedHigher ? open : close;
		
		var bottomBody = getPos(low, high, bottom, height);
		var bottomLeg = getPos(low, high, low, height);
		var topBody = getPos(low, high, top, height);
		var topLeg = getPos(low, high, high, height);
		
		var half = width / 2
		var left = half / 2
		var right = left + half
		var middle = half
		
		left += 0.5
		right += 0.5
		middle += 0.5
		topLeg += 0.5
		topBody += 0.5
		bottomBody += 0.5
		bottomLeg += 0.5
		
		//console.log(String(left) + " " + String(right) + " " + String(middle))
		
		var positions = {}
		positions['left'] = left;
		positions['right'] = right;
		positions['middle'] = middle;
		positions['topLeg'] = topLeg;
		positions['topBody'] = topBody;
		positions['bottomBody'] = bottomBody;
		positions['bottomLeg'] = bottomLeg;
		
		return positions
	}
	
	
	function drawLines(phase)
	{
		var $svg = $("#inspect_candle_stick");
		var node = "#inspect_candle_stick"
		
		var bbox = d3.select(node)[0][0].getBoundingClientRect();
		var width = bbox.width;
		var height = bbox.height;
		height = height - (topPadding + bottomPadding);
		
		var open = phase.open;
		var high = phase.high;
		var low = phase.low;
		var close = phase.close;
		
		var closedHigher = close > open
		

		var sw = 0.5
		var scolor = "#404040"
		
		var $yAxisLine = $svg.find(".yAxisLine");
		$yAxisLine.empty()
		
		$yAxisLine
		.attr("x1", width)
		.attr("x2", width)
		.attr("y1", topPadding)
		.attr("y2", height + topPadding)
		.attr("stroke-width", sw)
		.attr("stroke", scolor)
		
		
		var min = low;
		var max = high;
		
		var $openLine = $svg.find(".openLine");
		var $highLine = $svg.find(".highLine");
		var $lowLine = $svg.find(".lowLine");
		var $closeLine = $svg.find(".closeLine");
		//$openLine.empty()
		//$highLine.empty()
		//$lowLine.empty()
		//$closeLine.empty()
		
		var lowPos = getPos(min, max, low, height)
		var highPos = getPos(min, max, high, height)
		
		var openPos = getPos(min, max, open, height)
		var closePos = getPos(min, max, close, height)
		
		var lineAttr = {
			"stroke-width":1,
			"stroke":"#404040",
			"shape-rendering":"crispEdges",
			"stroke-dasharray": "1,3",
		};
		
		$openLine
		.attr("x1", 0)
		.attr("x2", width)
		.attr("y1", openPos)
		.attr("y2", openPos)
		.attr(lineAttr);
		
		$highLine
		.attr("x1", 0)
		.attr("x2", width)
		.attr("y1", highPos)
		.attr("y2", highPos)
		.attr(lineAttr);
		
		$lowLine
		.attr("x1", 0)
		.attr("x2", width)
		.attr("y1", lowPos)
		.attr("y2", lowPos)
		.attr(lineAttr);
		
		$closeLine
		.attr("x1", 0)
		.attr("x2", width)
		.attr("y1", closePos)
		.attr("y2", closePos)
		.attr(lineAttr);
	}
	

	

	return IDEX;
		

}(IDEX || {}, jQuery));


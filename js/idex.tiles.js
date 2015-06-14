
var IDEX = (function(IDEX, $, undefined)
{
	
	IDEX.buildTilesDom = function()
	{
		var $search = $($("#chartSearchTemplate").html())
		var $dropdown = $($("#dropdownTemplate").html())
		var $ticks = $($("#tickIntervalTemplate").html())
		var $time = $($("#timeIntervalTemplate").html())
		
		var chartHeaderClass = "market-chart-header chart-wrap tile-chart-bar";
		var $chartHeader = $("<div/>", {'class':chartHeaderClass} );
		
		$chartHeader.append($search)
		$chartHeader.append($dropdown)
		$chartHeader.append($ticks)
		$chartHeader.append($time)
		
		
		var tileMainClass = "tile-main"
		var tileMainType = "chart"
		
			var tileHeaderClass = "tile-header"
				var tileHeaderTrigClass = "tile-header-overlay-trig"
				
			var tileBodyClass = "tile-body"
				var tileBodyDataClass = "tile-body-data"
		
		
		
		var $tileMain = $("<div/>", {'class':tileMainClass, 'data-tiletype':tileMainType} );
		
			var $tileHeader = $("<div/>", {'class':tileHeaderClass} );
				var $tileHeaderTrig = $("<div/>", {'class':tileHeaderTrigClass} );
					var $tileHeaderTrigImg = $("<img/>", {'class':"fadeSlowIndy", 'src':"img/gear.png"} );


			var $tileBody = $("<div/>", {'class':tileBodyClass} );
				var $tileBodyData = $("<div/>", {'class':tileBodyDataClass, 'data-tiletype':tileMainType} );


		
		var $tileHeaderFull = 
		$tileHeader
		.append(
			$tileHeaderTrig
			.append(
				$tileHeaderTrigImg
			)
		)
		.append(
			$chartHeader
		)
			
		var $tileBodyFull = $tileBody.append($tileBodyData)
		
		
		var $full = $tileMain.append($tileHeaderFull).append($tileBodyFull)		
		var $create = $($("#tileCreateTemplate").html())
		
		
		var i = 1;
		
		$(".tiles-row").each(function()
		{
			for (var j = 0; j < 2; j++)
			{
				var $tile = $("<div/>", {'class':"tile fadeSlowIndy", 'data-tile':String(i)} );
				$tile.append($create.clone()).append($full.clone())
				//console.log($tile.get()[0])
				$(this).append($tile);
				i++
			}
			
		})
		

		/*var headerClass = "market-chart-header chart-wrap tile-chart-bar";
		
			var searchWrapClass = "mm-chart-search-wrap";
				var searchInputWrapClass = "mm-chart-search-input vert-align";
					var searchInputClass = "skynet-search";
					
			var dropdownClass = "chart-style dropdown-chart";
				var dropdownTitleClass = "dropdown-title dropdown-title-main vert-align"
		
		
		var $header = $("<div/>", {'class':headerClass} );
		
			var $searchWrap = $("<div/>", {'class':searchWrapClass} );
				var $searchInputWrap = $("<div/>", {'class':searchInputWrapClass} );
					var $searchInput = $("<input/>", {'class':searchInputClass, 'type':"text", 'name':"pair"} );
			
			//var $searchEl = $searchWrap.append($searchInputWrap.append($searchInput))
		
		
			var $dropdown = $("<div/>", {'class':dropdownClass} )
				var $searchInputWrap = $("<div/>", {'class':"mm-chart-search-input vert-align"} )
					var $searchInput = $("<input/>", {'class':"skynet-search", 'type':"text", 'name':"pair"} )*/
					
					
		
	}
	
	
	
	IDEX.isDropper = false

	$("#dropper").on("mouseup", function()
	{
		//$("#tileModalTrig").trigger("click");
		//url('img/dropper.png') 4 30, 
		
		$(".tile").each(function()
		{
			var isActive = false;
			var $tileCell = $(this);
			
			$(this).find(".tile-main").each(function()
			{
				if ($(this).hasClass("active"))
				{
					isActive = true;
				}
			})
			
			if (!IDEX.isDropper && !isActive)
			{
				$tileCell.addClass("all-border");
				//$(".mm-tile-grid").css("cursor", "pointer");
			}
			
			else
			{
				$tileCell.removeClass("all-border");
				//$(".mm-tile-grid").css("cursor", "default");
			}
		})
		
		IDEX.isDropper = !IDEX.isDropper;
	})
	
	
	$(".tiles").on("mouseover", ".tile", function()
	{
		if (IDEX.isDropper)
		{
			var isActive = false;
			var $tileCell = $(this);
			
			$(this).find(".tile-main").each(function()
			{
				if ($(this).hasClass("active"))
				{
					isActive = true;
				}
			})
			
			if (!isActive)
				$(this).addClass("tile-hover")
		}
	})
	
	
	$(".tiles").on("mouseout", ".tile", function()
	{
		$(this).removeClass("tile-hover")
	})
	
	
	$(".tiles").on("mouseup", ".tile", function()
	{
		if (IDEX.isDropper)
		{
			$("body").css("cursor", "default");
			IDEX.isDropper = false;
			$(".tile").removeClass("all-border");
			$(this).removeClass("tile-hover")
			$(this).find(".tile-create").addClass("active");
			$(this).addClass("all-border")
			//var $modal = $("#modal-tile")
			//var tileNum = $(this).attr("data-tile")
			//$("#current-tile").val(tileNum);
			//$(modal).trigger("idexShow")

			//$modal.css("visibility", "visible");
			//var isShow = $modal.hasClass("md-show")
			
			//if (isShow)
			//	$modal.removeClass("md-show");
			//else
			//	$modal.addClass("md-show");
			
				

			//console.log($(this))
			//$(".idex-tab-content").prepend($(this).clone())
		}
	})
	

	
	$(".tiles").on("click", ".tile-create-option", function()
	{	
		var $tile = $(this).closest(".tile")
		var tileNum = $tile.attr("data-tile")
		var tileType = $(this).attr("data-tiletype")
		
		$tile.find(".tile-create").removeClass("active");
		$tile.find(".tile-main[data-tiletype='"+tileType+"']").addClass("active");
		$tile.removeClass("all-border")
		console.log(tileType)
		
		if (tileType == "chart")
		{
			var svg = IDEX.makeSVG()
			var $svgEl = $(svg.node())
			var id = "tile_chart_" + tileNum
			$svgEl.attr("id", id)
			$tile.find(".tile-body-data").empty().append($svgEl);
			$tile.find(".tile-chart-bar").attr("data-chart", id);
			$tile.find(".chart-wrap").attr("data-chart", id);
			IDEX.makeTile(id)
		}
		else if (tileType == "orderbook")
		{
			
		}


	})
	
	
	

	$(".tile-orderbook-search-input").on("click", function()
	{
		console.log('in')
		var $wrap = $(this).closest(".tile-main")
		var $popup = $wrap.find(".tile-orderbook-search-popup");
		

		var isActive = $popup.hasClass("active");
		
		if (!isActive)
			$popup.addClass("active")
		else
			$popup.removeClass("active")

	})
	
	
	$(".tile-orderbook-search-popup-button").on("click", function()
	{
		//var $form = $("#" + $(this).attr("data-form"));
		//var params = getPostPayload($(this), "orderbook");

		var $popup = $(this).closest(".tile-orderbook-search-popup");
		var $base = $popup.find("input[name=baseid]")
		var $rel = $popup.find("input[name=relid]")
		
		var baseid = $base.attr("data-asset")
		var relid = $rel.attr("data-asset")

		makeOrderbook(baseid, relid, $popup)

	})
	
	
	function makeOrderbook(baseID, relID, $popup)
	{
		var $wrap = $popup.parent();
		var $curpair = $wrap.find(".tile-orderbook-curpair")
		
		var base = IDEX.user.getAssetInfo("assetID", baseID)
		var rel = IDEX.user.getAssetInfo("assetID", relID)
		var market = base.name + "_" + rel.name
		
		$curpair.text(market)
		
		orderbookPost(baseID, relID).done(function(orderbook)
		{
			$popup.removeClass("active")

			var $buyBook = $wrap.find(".tile-orderbook-orders-bids")
			var $sellBook = $wrap.find(".tile-orderbook-orders-asks")
			
			console.log(orderbook)
			formatOrderData(orderbook.bids)
			formatOrderData(orderbook.asks)
			formatOrderNumbers(orderbook.bids, orderbook.asks)
			var bids = orderbook.bids;
			var asks = orderbook.asks;
			

			$buyBook.empty()
			$sellBook.empty()
			
			var lastPrice = bids[0].price;
			//$(".inspect-area-orderbook-last span").empty().text(String(lastPrice))
			
			
			for (var i = 0; i < asks.length; i++)
			{
				var order = asks[i]
				var trString = buildTableRows([[order.price, order.volume, order.total]]);
					
				$sellBook.append(trString)
			}
			
			for (var i = 0; i < bids.length; i++)
			{
				var order = bids[i]
				var trString = buildTableRows([[order.total, order.volume, order.price]]);
					
				$buyBook.append(trString)
			}
		})
	}
	
	
	function buildTableRows(data)
	{
		var row = "";
		var rowWrap = "";
		var tdWrap = "";


			rowWrap = "<div class='tile-orderbook-order-row'></div>"
			tdWrap = "<span class='tile-orderbook-order-col'></span>";
		
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
			'maxDepth':20,
			'showAll':0
		};
		

		this.xhr = IDEX.sendPost(params, false, function(orderbookData)
		{
			//console.log(orderbookData);

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
	
	
	function formatOrderNumbers(newBids, newAsks)
	{
		var keys = ['price', 'volume', 'total'];
		var len = newBids.length;
		var allBidNumbers = IDEX.getListObjVals(newBids, keys);
		var allAskNumbers = IDEX.getListObjVals(newAsks, keys);

		for (var i = 0; i < keys.length; i++)
		{
			var key = keys[i];
			var allNumbers = IDEX.formatNumberWidth(allBidNumbers[key].concat(allAskNumbers[key]), 6);
			var asks = allNumbers.splice(len);
			var bids = allNumbers;
			
			newBids = IDEX.setListObjVals(newBids, key, bids);
			newAsks = IDEX.setListObjVals(newAsks, key, asks);
		}

	}
	
	

	
	$(".tiles").on("mouseover", ".tile-header-overlay-trig", function()
	{
		$(this).parent().find(".tile-chart-bar").addClass("active");
		//$(this).addClass("active");
	})
	
	
	$(".tiles").on("click", ".tile-header-overlay-trig", function()
	{
		var $el = $(this).parent().find(".tile-chart-bar")
		var has = $el.hasClass("activeLock");
		
		if (has)
		{
			$(this).find("img").removeClass("activeLock")
			$el.removeClass("activeLock")
		}
		else
		{
			$(this).find("img").addClass("activeLock")
			$el.addClass("activeLock");
		}
	})
	
	
	$(".tiles").on("mouseleave", ".tile-chart-bar", function()
	{
		$(this).removeClass("active");
		$(this).parent().find(".tile-cell-header-overlay-trig").removeClass("active");
	})
	

	
	IDEX.makeSVG = function()
	{
		//var $svg = $("<svg></svg>")
		var svg = document.createElementNS(d3.ns.prefix.svg, 'svg');
		svg = d3.select($(svg).get()[0])
		//console.log(svg)
		
		svg
		.attr("height", "100%")
		.attr("width", "100%")
		.attr("class", "unselectable")
		//.style({"background":"#090909"});
		//.style({"background":"black"});

		svg.append("g")
		.attr("class", "candleseries");
		
		svg.append("text")
		.attr("class", "candleInfo")
		.attr("data-axisnum", "1");
		
		
		var xAxis = 
		svg.append("g")
		.attr("class", "sleuthXAxis")
		.attr("data-axisnum", "1");
		
		xAxis.append("g")
		.attr("class", "xLabels");	
		
		xAxis.append("g")
		.attr("class", "xTicks");
		
		xAxis.append("g")
		.attr("class", "xAxisLines");
		
		var yAxis = 
		svg.append("g")
		.attr("class", "sleuthYAxis")
		.attr("data-axisnum", "1");
		
		yAxis.append("g")
		.attr("class", "yLabels");	
		
		yAxis.append("g")
		.attr("class", "yTicksLeft");
		
		yAxis.append("g")
		.attr("class", "yTicksRight");
		
		yAxis.append("g")
		.attr("class", "yGridLines");
		
		yAxis.append("g")
		.attr("class", "yAxisLines");
		
		var yAxis = 
		svg.append("g")
		.attr("class", "sleuthYAxis")
		.attr("data-axisnum", "2");
		
		yAxis.append("g")
		.attr("class", "yLabels");	
		
		yAxis.append("g")
		.attr("class", "yTicksLeft");
		
		yAxis.append("g")
		.attr("class", "yTicksRight");
		
		yAxis.append("g")
		.attr("class", "yGridLines");
		
		yAxis.append("g")
		.attr("class", "yAxisLines");
		
		
		
		svg.append("g")
		.attr("class", "volbars");
		
		svg.append("g")
		.attr("class", "seriesLine");
		
		svg.append("g")
		.attr("class", "mainline");
		
		svg.append("g")
		.attr("class", "boxes");
		
		
		var candleInd = 
		svg.append("g")
		.attr("class", "candleInd")
		
		candleInd.append("g")
		.attr("class", "ind");
		
		candleInd.append("g")
		.attr("class", "ind");
		
		
		var volInd = 
		svg.append("g")
		.attr("class", "volInd")
		
		volInd.append("g")
		.attr("class", "ind");
		
		volInd.append("g")
		.attr("class", "ind");
		
		
		
		var cursor = svg.append("g")
		.attr("class", "cursor_follow");
		
		cursor.append("line")
		.attr("class", "cursor_follow_x");
		
		cursor.append("line")
		.attr("class", "cursor_follow_y");

		var priceFollow = cursor.append("g")
		.attr("class", "yAxis-follow")
		.attr("data-axisnum", "1");
		
		priceFollow.append("path")
		.attr("class", "yAxis-follow-backbox");
		
		priceFollow.append("text")
		.attr("class", "yAxis-follow-text");
		
		
		var volFollow = cursor.append("g")
		.attr("class", "yAxis-follow")
		.attr("data-axisnum", "2");
		
		volFollow.append("path")
		.attr("class", "yAxis-follow-backbox");
		
		volFollow.append("text")
		.attr("class", "yAxis-follow-text");
		
		
		var timeFollow = cursor.append("g")
		.attr("class", "xAxis-follow");
		
		timeFollow.append("rect")
		.attr("class", "xAxis-follow-backbox");
		
		timeFollow.append("text")
		.attr("class", "xAxis-follow-text");
		
		
		svg.append("text")
		.attr("class", "highestPrice");
		
		svg.append("text")
		.attr("class", "lowestPrice");
		
		svg.append("text")
		.attr("class", "cur-market");

		
		return svg
	}
	
	
	
	
	
	$(".modal-confirm").on("click", function()
	{
		var $modal = $(this).closest(".md-modal");
		var type = $("#tile-create-type").val()
		var tileNum = $("#current-tile").val()
		var $tile = $(".mm-tile-cell[data-tile='"+tileNum+"']")
		//var $chart = $("#chartClone").clone()
		//console.log($chart)
		//var canvas = document.createElement('canvas');
		
		var svg = IDEX.makeSVG()
		var $svgEl = $(svg.node())
		var id = "tile_chart_" + tileNum
		$svgEl.attr("id", id)
		
		$tile.find(".tile-cell-data").empty().append($svgEl);
		
		IDEX.makeTile(id)
		
		$modal.removeClass("md-show");
	})
	
	
	$(".idex-modal-trig").on( 'click', function()
	{
		var $modal = $("#" + $(this).attr("data-modal"))
		//$(modal).trigger("idexShow")

		//$modal.css("visibility", "visible");
		var isShow = $modal.hasClass("md-show")
		
		if (isShow)
			$modal.removeClass("md-show");
		else
			$modal.addClass("md-show");
		
		setTimeout(function(){$(modal).trigger("idexShow")}, 300)

	});	
	
	$(".modal-cancel").on("click", function()
	{
		var $modal = $(this).closest(".md-modal");
		$modal.removeClass("md-show");
		//setTimeout(function(){$modal.trigger("idexHide")}, 300)
	})
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));
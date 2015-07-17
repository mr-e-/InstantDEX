

var IDEX = (function(IDEX, $, undefined) 
{
	
	var autoSearchName = [];
	var autoSearchSkynet = [];
	var autoSearchOrderbookExchange = ["nxtae", "unconf", "InstantDEX", "nxtae_nxtae"];
	
	
	
	IDEX.initAutocomplete = function()
	{
		var assets = IDEX.user.allAssets;
		var len = assets.length;

		for (var i = 0; i < len; i++)
		{
			var vals = {}
			vals['name'] = assets[i].name;
			vals['assetid'] = assets[i].assetID
			
			autoSearchName.push({"label":assets[i].name+" <span>("+assets[i].assetID+")</span>","value":assets[i].name, "vals":vals});
		}
	}
	
	
	$('.skynet-search').each(function(index, element)
	{
		IDEX.initSkyNETAuto($(element));
	});
	
	
	IDEX.initSkyNETAuto = function($search)
	{
		$search.autocomplete(
		{
			delay:0,
			html:true,
			open: function(e, ui) { $(this).autocomplete('widget').css({'width':"450px","margin-top":"14px"})},
			source: function(request,response) { skynetMatcher(request, response, autoSearchSkynet) },
			//change: function(e, ui) { skynetSelection($(this), e, ui) },
			select: function(e, ui) { skynetSelection($(this), e, ui) }
		});
	}
	
	
	$('.exchange-search').autocomplete(
	{
		delay:0,
		source: function(request,response) { labelExchangeMatcher(request, response, autoSearchOrderbookExchange) },
		change: function(e, ui) { labelExchangeSelection($(this), e, ui) },
		select: function(e, ui) { labelExchangeSelection($(this), e, ui) }
	});


	$('.asset-search').autocomplete(
	{
		delay: 0,
		html: true,
		create: function(e, ui) { },
		open: function(e, ui) { $(this).autocomplete('widget').css({'width':"180px"})},
		source: function(request,response) { autocompleteMatcher(request, response, autoSearchName) },
		change: function(e, ui) { autocompleteSelection($(this), e, ui) },
		select: function(e, ui) { autocompleteSelection($(this), e, ui) }
	});
	
	
	function labelExchangeMatcher(request, response, auto)
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );
		var a = $.grep(auto, function( item )
		{
			var v = item

			return (matcher.test(v));
		});

		response(a);
	}
	
	
	function labelExchangeSelection($thisScope, e, ui)
	{
		var exchange = ""
		if (ui.item)
		{
			exchange = ui.item.value
		}
	}
	
	
	function skynetMatcher(request, response, auto)
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );

		var a = $.grep(auto, function( item )
		{
			var vals = item.vals

			var pair = vals.pair
			var idPair = vals.idPair
			var exchange = vals.exchange
			
			var pairBoth = pair.split("_")
			

			var ret = matcher.test(pair) || matcher.test(pairBoth[0]) || matcher.test(pairBoth[1]) || matcher.test(idPair) || matcher.test(exchange)
			
			return (ret);
		});

		response(a.slice(0, 60));
	}
	
	
	function skynetSelection($thisScope, e, ui)
	{
		if (!ui.item)
		{
			$thisScope.attr('data-pair', "-1");
		}
		else
		{
			var vals = ui.item.vals;

			if (vals.idPair.split("_").length == 2 && vals.exchange == "nxtae")
			{
				$thisScope.attr('data-pair', vals.idPair);
				var both = vals.idPair.split("_")

			}
			else
			{
				var both = vals.pair.split("_")
				$thisScope.attr('data-pair', vals.pair);
			}
			
			$thisScope.attr('data-exchange', vals.exchange);
			

			var obj = {};
			obj.exchange = vals.exchange
			
			var $wrap = $thisScope.closest(".chart-header")	
			obj.node = $wrap.attr("data-chart");
			
			obj.baseid = both[0];
			obj.relid = both[1];
			console.log(vals)
			
			IDEX.makeChart(obj)
		}
	}
	
	
	function autocompleteSelection($thisScope, e, ui)
	{
		if (!ui.item)
		{
			$thisScope.attr('data-asset', "-1");
		}
		else
		{
			var assetid = ui.item.vals.assetid;
			
			$thisScope.attr('data-asset', assetid);
		}
	}


	function autocompleteMatcher(request, response, auto)
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );
		var a = $.grep(auto, function( item )
		{
			var assetid = item.vals.assetid;
			var assetname = item.vals.name;

			return (matcher.test(assetid) || matcher.test(assetname));
		});

		response(a);
	}
	
	
	IDEX.getSkynet = function(options, len)
	{
		var dfd = new $.Deferred();

		loadSkynetData().done(function(markets)
		{
			var parsed = markets
			var len = parsed.length;
			
			var formatted = []
			
			for (var i = 0; i < len; i++)
			{
				var obj = {}
				obj['baseID'] = ""
				obj['relID'] = ""
				obj['exchange'] = parsed[i].exchange

				var pair = parsed[i].pair;
				var both = pair.split("_")
				
				var baseAsset = IDEX.user.getAssetInfo("assetID", both[0])
				var relAsset = IDEX.user.getAssetInfo("assetID", both[1])
				
				if ("name" in baseAsset)
				{
					obj['baseID'] = baseAsset['assetID']
					obj['baseName']  = baseAsset['name']
				}
				else
				{
					obj['baseName']  = both[0]
				}
				
				if ("name" in relAsset)
				{
					obj['relID'] = relAsset['assetID']
					obj['relName']  = relAsset['name']
				}
				else
				{
					obj['relName']  = both[1]
				}
				
				obj['pair'] = obj['baseName'] + "_" + obj['relName']
				obj['idPair'] = obj['baseID'] + "_" + obj['relID']
				
				var exchangeSpan = "<span class='sky-exchange'>" + obj['exchange'] + "</span>"
				var pairSpan = "<span class='sky-pair'>" + obj['pair'] + " </span>"
				
				var idPair = ""
				var idPairSpan = "";
				
				if (obj['baseID'].length && obj['relID'].length)
				{
					idPair = obj['idPair']
				}
				else if (obj['baseID'].length && obj['exchange'] == "nxtae")
				{
					idPair = obj['baseID'] + "_" + obj['relName']
				}
				else if (obj['relID'].length && obj['exchange'] == "nxtae")
				{
					idPair =  obj['relID'] + "_" + obj['baseName']
				}
				
				obj.idPair = idPair
				idPairSpan = "<span class='sky-idPair'>" + idPair + " </span>"

				
				var wrap = "<div class='sky-auto-wrap' data-idpair='" + idPair +"' data-pair='" + obj['pair'] + "' data-exchange='" + obj['exchange'] + "'>"
				wrap += "<div class='sky-auto-cell'>" + pairSpan + "</div>"
				wrap += "<div class='sky-auto-cell'>" + idPairSpan + "</div>"
				wrap += "<div class='sky-auto-cell sky-cell-ex'>" + exchangeSpan + "</div>"
				wrap += "</div>"
				
				autoSearchSkynet.push({"label":wrap, "value":obj['pair'], "vals":obj});
			}
			dfd.resolve(parsed)	
		})
		
		return dfd.promise()
	}
	
	
	function loadSkynetData()
	{
		var retdfd = new $.Deferred();
		var dfd = new $.Deferred();
		var user = this;
		
		if (localStorage.skynetMarkets)
		{
			var markets = JSON.parse(localStorage.getItem('skynetMarkets'));
			dfd.resolve(markets);
		}
		else
		{
			var obj = {}
			obj['section'] = "crypto";
			obj['run'] = "search";
			obj['field'] = "pair";
			obj['term'] = "";
			obj['key'] = "beta_test";
			obj['filter'] = "";

			var url = IDEX.makeSkynetURL(obj)

			$.getJSON(url, function(data)
			{
				console.log(data)
				var parsed = parseSkynetSearch(data.results)
				var len = parsed.length;
				localStorage.setItem('skynetMarkets', JSON.stringify(parsed));
				dfd.resolve(parsed);
			})
		}
		
		
		dfd.done(function(markets)
		{
			retdfd.resolve(markets);
		})
		
		return retdfd.promise();
	}
	
	
	function parseSkynetSearch(data)
	{
		var exchanges = {}
		var pairs = []
		var parsed = []
		
		var counter = 0;
		for (pair in data)
		{
			var pairExchanges = data[pair].split('|');
			
			for (var i = 0; i < pairExchanges.length; i++)
			{
				var exchange = pairExchanges[i];
				parsed.push({"pair":pair,"exchange":exchange})
			}

			counter++;
		}

		return parsed;
	}
	

    IDEX.makeSkynetURL = function(obj)
    {
		var baseurl = "http://api.finhive.com/v1.0/run.cgi?"
        var arr = []
		
        for (key in obj)
        {
			arr.push(key+"="+obj[key])
        }
        var s = arr.join("&")

        return baseurl+s
    }

	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));



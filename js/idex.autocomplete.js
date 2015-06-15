

var IDEX = (function(IDEX, $, undefined) 
{
	
	var autoSearchName = [];
	var autoSearchAsset = [];
	var autoSearchSkynet = [];
	var autoSearchOrderbookExchange = ["nxtae", "unconf", "InstantDEX", "nxtae_nxtae"];
	
	
	
	IDEX.initAutocomplete = function()
	{
		var assets = IDEX.user.allAssets;
		var len = assets.length;

		for (var i = 0; i < len; i++)
		{
			autoSearchName.push({"label":assets[i].name+" <span>("+assets[i].assetID+")</span>","value":assets[i].name});
			autoSearchAsset.push({"label":assets[i].name+" <span>("+assets[i].assetID+")</span>","value":assets[i].asset});
		}
	}
	

	$('.assets-search').autocomplete(
	{
		delay:0,
		html:true,
		source: function(request,response) { autocompleteMatcher(request, response, autoSearchAsset) }
	});
	
	
	$('.skynet-search').autocomplete(
	{
		delay:0,
		html:true,
		open: function(e, ui) { $(this).autocomplete('widget').css({'width':"450px","margin-top":"14px"})},
		source: function(request,response) { skynetMatcher(request, response, autoSearchSkynet) },
		//change: function(e, ui) { skynetSelection($(this), e, ui) },
		select: function(e, ui) { skynetSelection($(this), e, ui) }
	});
	
	
	$('.auto-label-exchange').autocomplete(
	{
		delay:0,
		source: function(request,response) { labelExchangeMatcher(request, response, autoSearchOrderbookExchange) },
		change: function(e, ui) { labelExchangeSelection($(this), e, ui) },
		select: function(e, ui) { labelExchangeSelection($(this), e, ui) }
	});

	
	$('.assets-fav input').autocomplete(
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
		console.log(exchange)
	}
	
	
	function skynetMatcher(request, response, auto)
	{
		var matcher = new RegExp( "^" + $.ui.autocomplete.escapeRegex( request.term ), 'i' );
		var counter = 0;
		var a = $.grep(auto, function( item )
		{
			if (counter > 10)
				return false;
			var $el = $(item.label)
			var pair = ""
			var exchange = ""
			var idPair = ""
			

			pair = $el.attr("data-pair")
			idPair = $el.attr("data-idpair")
			exchange = $el.attr("data-exchange")

			var ret = matcher.test(pair) || matcher.test(idPair) || matcher.test(exchange)
			
			if (ret)
				counter++
			
			return (ret);
		});

		response(a.slice(0, 20));
	}
	
	
	function skynetSelection($thisScope, e, ui)
	{
		console.log(ui)
		
		if (!ui.item)
		{
			$thisScope.attr('data-pair', "-1");
		}
		else
		{
			var $el = $(ui.item.label)
			var idPair = ""
			var pair = ""
			var exchange = ""
			
			pair = $el.attr("data-pair")
			idPair = $el.attr("data-idpair")
			exchange = $el.attr("data-exchange")

			if (idPair.split("_").length == 2 && exchange == "nxtae")
				$thisScope.attr('data-pair', idPair);
			else
				$thisScope.attr('data-pair', pair);
			
			$thisScope.attr('data-exchange', exchange);
			
			IDEX.chartClick($thisScope)
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
	
	
	IDEX.getSkynet = function(options, len)
	{
		var dfd = new $.Deferred();

		loadSkynetData().done(function(markets)
		{
			var parsed = markets
			var len = parsed.length;
			console.log(parsed)
			
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
				
				if (obj['baseID'].length && obj['relID'].length)
				{
					var idPair = obj['idPair']
					var idPairSpan =  "<span class='sky-idPair'>" + idPair + " </span>"
				}
				else if (obj['baseID'].length && obj['exchange'] == "nxtae")
				{
					var idPair = obj['baseID'] + "_" + obj['relName']
					var idPairSpan = "<span class='sky-idPair'>" + idPair + " </span>"
				}
				else if (obj['relID'].length && obj['exchange'] == "nxtae")
				{
					var idPair =  obj['relID'] + "_" + obj['baseName']
					var idPairSpan = "<span class='sky-idPair'>" + idPair + " </span>"
				}
				else
				{
					var idPair = ""
					var idPairSpan = "";
				}
				
				var wrap = "<div class='sky-auto-wrap' data-idpair='" + idPair +"' data-pair='" + obj['pair'] + "' data-exchange='" + obj['exchange'] + "'>"
				wrap += "<div class='sky-auto-cell'>" + pairSpan + "</div>"
				wrap += "<div class='sky-auto-cell'>" + idPairSpan + "</div>"
				wrap += "<div class='sky-auto-cell sky-cell-ex'>" + exchangeSpan + "</div>"
				wrap += "</div>"
				autoSearchSkynet.push({"label":wrap, "value":obj['pair'], "test":"a"});
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

		console.log(parsed)
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



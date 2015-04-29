

var IDEX = (function(IDEX, $, undefined) 
{

	var autoSearchName = [];
	var autoSearchAsset = [];
	
	IDEX.initAutocomplete = function()
	{
		var assets = IDEX.user.allAssets;
		var len = assets.length;
		
		for (var i = 0; i < len; i++)
		{
			IDEX.auto.push({"label":assets[i].name+" <span>("+assets[i].assetid+")</span>","value":assets[i].name});
			IDEX.auto2.push({"label":assets[i].name+" <span>("+assets[i].assetid+")</span>","value":assets[i].asset});
		}
	}
	

	$('.assets-search').autocomplete(
	{
		delay:0,
		html:true,
		source: function(request,response) { autocompleteMatcher(request, response, autoSearchAsset) }
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


	return IDEX;
	
	
}(IDEX || {}, jQuery));



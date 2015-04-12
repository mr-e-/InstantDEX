
var IDEX = (function(IDEX, $, undefined) {


	IDEX.auto = [];
	IDEX.auto2 = [];
	
/*******	AUTOCOMPLETE	*******/

$('.assets-search').autocomplete({
	delay:0,
	html:true,
	source: function(request,response) { autocompleteMatcher(request, response, IDEX.auto2) }
});

$('.assets-fav input').autocomplete({
	delay: 0,
	html: true,
	create: function(e, ui) { },
	open: function(e, ui) { $(this).autocomplete('widget').css({'width':"153px"})},
	source: function(request,response) { autocompleteMatcher(request, response, IDEX.auto) },
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
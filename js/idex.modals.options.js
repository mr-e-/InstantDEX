
var IDEX = (function(IDEX, $, undefined) {



function saveChartFavorites()
{
	var parsed = {};
	
    $(".chart-control").each(function() 
	{
		var name = $(this).val();
		var id = $(this).attr('chart-id');
		var asset = $(this).attr('data-asset');
		if (asset == "-1")
		{
			name = IDEX.user.favorites[id].name
			asset = IDEX.user.favorites[id].asset
			$(this).val(name)
			$(this).attr('data-asset', asset)
		}

		$("#chart-curr-"+id).attr("data-asset", asset);
		$("#chart-curr-"+id).text(name);
		parsed[id] = {"name":name,"id":id,"asset":asset}
    });
	
	localStorage.setItem('chartFavorites', JSON.stringify(parsed));

	for (var id in parsed)
	{
		if ((Number(id) > 90) && (Number(id) % 2 != 0))
		{
			var baseID = parsed[id].asset;
			var relID = parsed[String(Number(id)+1)].asset;
			
			if (baseID != IDEX.user.favorites[id].asset)
			{
				var divid = $("#chart-curr-"+id).closest(".mini-chart").find(".mini-chart-area-4").attr('id');
				
				if (baseID != "-1" && relID != "-1")
					IDEX.makeMiniChart(baseID, relID, divid);
			}
		}
	}
	/*
		var sibIndex = (Number(id) % 2) != 0 ? 1 : -1;
	
		if(parsed[id].asset == parsed[id+sibIndex].asset)
		{
			
		}
	*/
	
	IDEX.user.favorites = parsed
}


function saveOptions()
{
	var minperc = $(".option-minperc").val();
	var duration = $(".option-duration").val();
	
	IDEX.user.options['minperc'] = minperc;
	IDEX.user.options['duration'] = duration;
	
	localStorage.setItem('options', JSON.stringify(IDEX.user.options));
}



$("#modal-04").on("idexHide", saveChartFavorites)
$("#modal-05").on("idexHide", saveOptions)


	return IDEX;
	
}(IDEX || {}, jQuery));
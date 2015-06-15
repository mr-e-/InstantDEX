

/*
	//$.growl.error({'message':"Order placed", 'location':"bl"});
	//$.growl.warning({'message':"Order placed", 'location':"bl"});
	//$.growl.notice({'message':"Order placed", 'location':"bl"});
*/

var IDEX = (function(IDEX, $, undefined) 
{	

	$(".curr-pair").on("click", function()
	{
		//$("#tempBuyClick").trigger("click");
		var params = {"requestType":"allorderbooks"}
		params['plugin'] = "InstantDEX";
		//console.log(params)
		IDEX.sendPost(params).done(function(data)
		{
			//ssconsole.log(data)
		});
	})

	
	$(".chart-style").on("mouseover", function()
	{
		$(this).find(".dropdown-wrap").addClass("active");
		$(this).find(".dropdown-title").addClass("active");
	})
	
	$(".chart-style").on("mouseleave", function()
	{
		$(this).find(".dropdown-wrap").removeClass("active");
		$(this).find(".dropdown-title").removeClass("active");

	})
	
	

	$(".browseArea-navbar-cell").on("mouseup", function()
	{
		if (!($(this).hasClass("active")))
		{
			$(this).parent().find(".browseArea-navbar-cell").removeClass("active");
			$(this).addClass("active");

			var tab = $(this).attr('data-tab');
			var $parent = $(".browseArea-body")
			$parent.find(".browseArea-tab").removeClass("active");
			$parent.find(".browseArea-tab[data-tab='"+tab+"']").addClass("active");
			//$(".util-title").text($(this).find("span").text())
		}
	})
	
	
	
	$(".util-min").on("click", function()
	{
		console.log("a")
		var $browseArea = $(".browseArea")
		var $utilArea = $("#utilArea")
		var $utilBody = $(".util-body")
		//console.log($el)
		
		var utilExpanded = $utilBody.hasClass("active");
		
		if (utilExpanded)
		{
			$utilArea.removeClass("active");
			$utilBody.removeClass("active");
			$browseArea.addClass("browseExpanded")
		}
		else
		{
			$utilArea.addClass("active");
			$utilBody.addClass("active");
			$browseArea.removeClass("browseExpanded")
		}
		
		$(window).trigger("resize")
		
	})
	
	
	
	$(".footer-menu-nav-cell").on("click", function()
	{
		var $browseArea = $(".browseArea")
		var $utilArea = $("#utilArea")
		var $utilBody = $(".util-body")
		
		var utilExpanded = $utilBody.hasClass("active");
		
		if (!utilExpanded)
		{
			$utilArea.addClass("active");
			$utilBody.addClass("active");
			$browseArea.removeClass("browseExpanded")
			$(window).trigger("resize")

		}

		var tab = $(this).attr("data-tab")
		$utilBody.find(".tab-wrap").removeClass("active")
		
		var $tab = $utilBody.find(".tab-wrap[data-tab='" + tab + "']")
		$tab.addClass("active")
	})
	

	
	IDEX.isSearchPopup = false;
	IDEX.$searchTrig = null;
	
	$("#cm_search_trig").on("click", function()
	{
		IDEX.$searchTrig = $(this)
		
		var $popup = $(".cm-search-popup");
		var isActive = $popup.hasClass("active");
		
		if (!isActive)
			$popup.addClass("active")
		else
			$popup.removeClass("active")
	})
	
	
	
	$(".cm-search-popup-button").on("click", function()
	{
		//var $form = $("#" + $(this).attr("data-form"));
		//var params = getPostPayload($(this), "orderbook");

		var $popup = $(".cm-search-popup");
		var $parent = $(this).parent()
		var $base = $popup.find("input[name=baseid]")
		var $rel = $popup.find("input[name=relid]")
		
		var baseid = $base.attr("data-asset")
		var relid = $rel.attr("data-asset")
		
		
		if (IDEX.changeMarket(baseid, relid))
		{
			//$form.trigger("reset");
			$popup.removeClass("active")
		}
		else
		{
			//$popup.removeClass("active")
		}
	})
	
	
	
	$("#cm_favs_trig").on("click", function()
	{
		IDEX.$favstrig = $(this)
		
		var $popup = $(".cm-favs-popup");
		var isActive = $popup.hasClass("active");
		
		if (!isActive)
			$popup.addClass("active")
		else
			$popup.removeClass("active")
	})
	
	
	
	$(".cm-favs-popup-row").on("click", function()
	{
	
		var $el = $(this).find("span");
		var both = $el.text().split("_");
		var base = both[0]
		var rel = both[1]
		
		base = IDEX.user.getAssetInfo("name", base)
		rel = IDEX.user.getAssetInfo("name", rel)
		
		IDEX.changeMarket(base.assetID, rel.assetID);
		$("#cm_favs_trig").trigger("click");
	})
	
	
	
	$(".cm-info-header-menu-cell").on("mouseup", function()
	{
		if (!($(this).hasClass("active")))
		{
			$(this).parent().find(".cm-info-header-menu-cell").removeClass("active");
			//$(this).removeClass("idex-mousedown");
			$(this).addClass("active");

			var tab = $(this).attr('data-tab');
			var $parent = $(".cm-info-body")
			$parent.find(".cm-info-tab").hide();
			$parent.find(".cm-info-tab[data-tab='"+tab+"']").show();
			//$(".util-title").text($(this).find("span").text())
		}
	})
	
	
	$(".cm-info-header-menu-min").on("click", function()
	{
		var $cmInfoBody = $(".cm-info-body")
		var isInfoMin = !($cmInfoBody.hasClass("active"))
		
		var $cmInfo = $(".cm-info");
		var $orderbooks = $(".orderbook-orderbox-wrap");
		

		if (isInfoMin)
		{
			$cmInfoBody.addClass("active")
			$cmInfo.removeClass("cm-info-minimized")
			$orderbooks.removeClass("full")
		}
		else
		{
			$cmInfoBody.removeClass("active")
			$cmInfo.addClass("cm-info-minimized")
			$orderbooks.addClass("full")
		}

	})
	
	

	$("#temp_click_one").on("click", function()
	{	
		IDEX.makeTable("marketOpenOrdersTable", function()
		{
			
		});
	})
	
	
		
	$(".cm-orderbox-header").on("click", function()
	{
		var $mainWrap = $(this).parent();
		var $bodyWrap = $mainWrap.find(".cm-orderbox-body")
		var isOrderboxExpanded = $mainWrap.hasClass("active")
		
		if ($mainWrap.hasClass("cm-orderbox-sell"))
			var str = ".cm-sellbook"
		else
			var str = ".cm-buybook"
			
		var $orderbook = $(str)
		
		if (isOrderboxExpanded)
		{
			$mainWrap.removeClass("active")
			$bodyWrap.removeClass("active")
			$orderbook.removeClass("orderbookMin")
			
		}
		else
		{
			$mainWrap.addClass("active")
			$bodyWrap.addClass("active")
			
			$orderbook.addClass("orderbookMin")
		}
	})


	$(".mm-search-trig").on("click", function()
	{
		IDEX.$searchTrig = $(this)
		if (!IDEX.isSearchPopup)
			$(".mm-search-popup").css("display", "block");
		else
			$(".mm-search-popup").css("display", "none");
		
		IDEX.isSearchPopup = !IDEX.isSearchPopup;
	})
	
	
	$(".mm-search-popup-field").on("click", function()
	{
		var field =  $(this).attr("data-field")
		var $popup = $(".mm-search-popup")
		
		if (!($(this).hasClass("active")))
		{
			var $parent = $(this).parent()
			$parent.find(".mm-search-popup-field").removeClass("active")
			$(this).addClass("active");
			$popup.find(".mm-search-popup-input").removeClass("active");
			$popup.find(".mm-search-popup-input[data-field='"+field+"']").addClass("active");

			if (field == "ex")
			{
				console.log('ex')
				//$popup.css("height","300px");
			}
			else if (field == "pair")
			{
				console.log("pair")
			}
		}
	})
	
	
	$(".mm-search-popup-button").on("click", function()
	{
		var $parent = IDEX.$searchTrig.closest(".main-menu-tab-wrap");
		var $popup = $(".mm-search-popup")
		var $active = $popup.find(".mm-search-popup-input.active")
		var $inputs = $active.find("input")
		var field = $(".mm-search-popup-field.active").attr("data-field")
		var vals = []
		
		$inputs.each(function()
		{
			var name = $(this).attr("name")
			var val = $(this).val()
			
			vals.push({"name":name, "val":val})
		})
		
		
		$parent.find(".mm-sub-tab-wrap").hide();
		var $wrap = $parent.find(".mm-sub-tab-wrap[data-field='"+field+"']")
		$wrap.find(".mm-search-title").text(vals[0].val)
		$wrap.show();
		
		$popup.find(".mm-search-popup-field").removeClass("active")
		$popup.find(".mm-search-popup-input").removeClass("active");
		$popup.css("display", "none");
		IDEX.isSearchPopup = false;
		
		//getPoloData();
		
	})
	
	
	$(".mm-sub-tab-trig").on("mouseup", function()
	{
		if (!($(this).hasClass("active")))
		{
			$(this).parent().find(".mm-sub-tab-trig").removeClass("active");
			$(this).addClass("active");

			var tab = $(this).attr('data-tab');
			var $parent = $(this).closest(".main-menu-tab-wrap");
			$parent.find(".mm-sub-tab-wrap").hide();
			$parent.find(".mm-sub-tab-wrap[data-tab='"+tab+"']").show();
			//$(".util-title").text($(this).find("span").text())
		}
	})
	

	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));







var IDEX = (function(IDEX, $, undefined)
{
	
	
	$(".orderbook-label-color-input").each(function()
	{
		var $el = $(this).parent().find(".orderbook-label-color-box-wrap");
		var isLower = $(this).attr("data-ltype") == "bg";
		var name = "orderbook-label-color-box"
		if (isLower)
			name += " lower"
		
		$(this).spectrum({
			flat: true,
			showInput: false,
			showAlpha:true,
			showButtons:false,
			containerClassName:name,
			replacerClassName:'orderbook-label-color-replacer',
			preferredFormat: "rgb",
			appendTo: $el,
		})
	});
	
	

	IDEX.labels = []
	IDEX.isLabelPopup = false;
	
	
	IDEX.OrderbookLabel = function(obj) 
	{	
		this.exchange = "";
		this.nxtrs = "";
		this.market = "";
		this.bgcolor = "";
		this.textcolor = "";
		
		this.name = "";
		this.isVisible = false;
		this.isActive = false;

		IDEX.constructFromObject(this, obj);
	};
	
	
	$(".cm-orderbook-label-popup-close").on("mouseup", function()
	{
		$(".orderbook-label-popup").css("display", "none");
		IDEX.isLabelPopup = false
		$(".order-row").removeClass("label-temp")
	})
	
	$(".cm-orderbook-label-trig").on("mouseup", function()
	{
		if (!IDEX.isLabelPopup)
			$(".orderbook-label-popup").css("display", "block");
		else
			$(".orderbook-label-popup").css("display", "none");
		
		$(".order-row").removeClass("label-temp")
		IDEX.isLabelPopup = !IDEX.isLabelPopup;
	})
	
	
	$(".orderbook-label-color-trig").on("focus", function()
	{
		var $el = $(this).parent().find(".orderbook-label-color-box")

		$el.addClass("active")
	})
	
	
	$(".orderbook-label-color-trig").on("focusout", function()
	{
		var $el = $(this).parent().find(".orderbook-label-color-box")
		
		$el.removeClass("active")
	})
	
	
	$(".orderbook-label-color-input").on('move.spectrum', function(e, tinycolor)
	{
		var $ex = $("#label_example")
		
		var $el = $(this).parent().find(".orderbook-label-color-trig")
		var $conf = $(".orderbook-label-popup-left")
		
		var exchange = $conf.find("input[name='ex']").val()
		var ltype = $(this).attr("data-ltype")
		var colorClass = ltype == "bg" ? "background-color" : "color";

		var rgba = tinycolor.toRgbString()
		
		updateStyle(colorClass, rgba)
		

		$el.val(rgba)
		$ex.addClass("label-temp")
		//IDEX.colorOrderbook(exchange)
	});
	
	
	function updateStyle(colorClass, color)
	{
		var $style = $("#temp_label_style");
		
		if (colorClass == "background-color")
			var cClass = "cbg"
		else
			var cClass = "ctext"
		
		$style.attr("data-"+cClass, color)
		
		var cbg = $style.attr("data-cbg")
		var ctext = $style.attr("data-ctext")
		
		var str = "." + "label-temp" 
		str += " { " + "background-color" + ":" + cbg + "; " + "color" + ":" + ctext + "; }"
		$style.html(str)
	}
	
	function loadStyle(label)
	{
		
		var bgcolor = label.bgcolor
		var textcolor = label.textcolor
		var $style = $("#temp_label_style");
		
		
		$style.attr("data-cbg", bgcolor)
		$style.attr("data-ctext", textcolor)
		
		var cbg = $style.attr("data-cbg")
		var ctext = $style.attr("data-ctext")
		
		var str = "." + "label-temp" 
		str += " { " + "background-color" + ":" + cbg + "; " + "color" + ":" + ctext + "; }"
		$style.html(str)
	}
	
	
	function makeStyle()
	{
		var style = document.createElement('style');
		style.type = 'text/css';
		
		style.innerHTML = "." + labelClass + " { color:" + textColor + "; background-color:" + bgColor + "; }";
		//document.getElementsByTagName('head')[0].appendChild(style);
	}
	
	function initStyle(label)
	{
		var name = label.name
		var $style = $("#"+name);
		var bgcolor = label.bgcolor
		var textcolor = label.textcolor

		$style.attr("data-cbg", bgcolor)
		$style.attr("data-ctext", textcolor)
	
		var str = "." + name 
		str += " { " + "background-color" + ":" + bgcolor + "; " + "color" + ":" + textcolor + "; }"
		$style.html(str)
	}
	
	
	function loadColorBox(obj)
	{
		//var obj = getInputValues()
		
		$("#orderbook_label_bgcolor").spectrum("set", obj.bgcolor);
		$("orderbook_label_textcolor").spectrum("set", obj.textcolor);
	}
	
	
	IDEX.colorOrderbook = function(exchange)
	{
		$(".order-row").removeClass("label-temp")
		if (exchange)
		{
			var $book = $("#sellBook")
			var $rows = $book.find(".order-row")
			var $style = $("#temp_label_style");


			$rows.each(function()
			{
				var order = IDEX.getRowData($(this), $(this).index());

				if (order.exchange == exchange)
					$(this).addClass("label-temp")
			})
		}
	}
	
	
	$("#add_orderbook_label").on("click", function()
	{
		var $table = $(".orderbook-label-popup-table")
		var lastIndex = IDEX.labels.length + 1;
		var name = "Label-"+String(lastIndex)
		var newRow = IDEX.buildLabelRow(name)
		
		$table.append($(newRow))
		var newLabel = new IDEX.OrderbookLabel({"name":name});
		IDEX.labels.push(newLabel)
	})
	
	
	$(".orderbook-label-popup-confirm-wrap").on("click", function()
	{
		saveLabel()
	})
	
	
	function saveLabel()
	{
		var label = getActiveLabel();
		console.log(label)
		if (label)
		{
			var inputVals = getInputValues()
			
			var name = label.name;
			var isVis = label.isVisible;
			var isActive = label.isActive;
			
			var updatedLabel = new IDEX.OrderbookLabel(inputVals)
			updatedLabel.isVisible = isVis;
			updatedLabel.name = name;
			updatedLabel.isActive = isActive;
			
			console.log(updatedLabel)
			
			var index = IDEX.labels.indexOf(label)
			IDEX.labels[index] = updatedLabel;
			initStyle(updatedLabel)
			IDEX.loadVis()
		}
	}
	
	
	$(".orderbook-label-popup-table").on("click", ".orderbook-label-popup-all-row .label-popup-all-name", function(e)
	{
		/*var has = $(e.target).hasClass("label-popup-all-name");

		if (!has)
		{
			e.stopPropagation()
			return
		}*/
		var $wrap = $(".orderbook-label-popup-left")
		var $overlay = $(".label-left-overlay");
		
		
		var elClass = ".orderbook-label-popup-all-row"
		var $parent = $(this).parent()
		
		var isActive = $parent.hasClass("active")
		
		$parent.parent().find(elClass).removeClass("active");
		
		var index = $parent.index() - 2
		
		console.log(index)
		console.log(isActive)
		
		if (isActive)
		{
			unloadLabel();
		}
		else
		{
			$parent.addClass("active");
			IDEX.loadLabel(index);
		}
	})
	
	
	IDEX.loadLabel = function(index)
	{
		var $overlay = $(".label-left-overlay");
		$overlay.removeClass("active")
		
		var $ex = $("#label_example")
		var label = IDEX.labels[index]
		console.log(label)
		
		$(".label-temp").removeClass("label-temp")
		
		$ex.text(label.name)
		removeActiveLabel()
		label.isActive = true;
		setInputValues(label)
		loadColorBox(label)
		loadStyle(label)
		//IDEX.colorOrderbook(label.exchange)
	}
	
	function unloadLabel()
	{
		var $wrap = $(".orderbook-label-popup-left")
		var $overlay = $(".label-left-overlay");
		var $ex = $("#label_example")
		$ex.text("")
		
		$overlay.addClass("active");
		removeActiveLabel();
		
		$wrap.find("input[name='ex']").val("")
		$wrap.find("input[name='ctext']").val("")
		$wrap.find("input[name='cbg']").val("")
		$wrap.find("input[name='rs']").val("")
		
		$(".label-temp").removeClass("label-temp")
	}
	

	
	$(".orderbook-label-popup-table").on("click", ".orderbook-label-popup-all-row .label-popup-all-vis", function(e)
	{
		var $parent = $(this).parent()
		var index = $parent.index() - 2
		var isActive = $(this).hasClass("active")
		var label = IDEX.labels[index]
		
		if (isActive)
		{
			$(this).removeClass("active")
			label.isVisible = false

			$("." + label.name).removeClass(label.name)
			IDEX.loadVis()
		}
		else
		{
			$(this).addClass("active")
			label.isVisible = true;
			IDEX.loadVis()
		}
		
		console.log(label)
	})
	

	
	IDEX.loadVis = function()
	{
		var vis = IDEX.getVisibleLabels()
		var visMap = IDEX.getVisibleMap(vis)
		console.log(vis)
		var $book = $("#sellBook")
		var $rows = $book.find(".order-row")
		var $style = $("#temp_label_style");

		
		$rows.each(function()
		{
			var order = IDEX.getRowData($(this), $(this).index());
			
			for (var exchange in visMap)
			{
				var label = visMap[exchange]
				//console.log(exchange)
				
				if (order.exchange == exchange)
				{
					for (var i = 0; i < 5; i++)
					{
						$(this).removeClass("Label-" + String(i))
					}
					$(this).addClass(label.name)
					break;
				}
			}
		})
		
		var $book = $("#buyBook")
		var $rows = $book.find(".order-row")

		$rows.each(function()
		{
			var order = IDEX.getRowData($(this), $(this).index());
			
			for (var exchange in visMap)
			{
				var label = visMap[exchange]
				//console.log(exchange)
				
				if (order.exchange == exchange)
				{
					for (var i = 0; i < 5; i++)
					{
						$(this).removeClass("Label-" + String(i))
					}
					$(this).addClass(label.name)
					break;
				}
			}
		})
	}
	
	
	function unloadVis()
	{
		
	}
	
	
	IDEX.getVisibleMap = function(vis)
	{
		var exchanges = {}
		
		for (var i = 0; i < vis.length; i++)
		{
			var label = vis[i];
			exchanges[label.exchange] = label;
		}
		
		return exchanges
	}
	
	
	IDEX.getVisibleLabels = function()
	{
		var vis = [];
		
		for (var i = 0; i < IDEX.labels.length; i++)
		{
			var label = IDEX.labels[i]
			
			if (label.isVisible)
			{
				vis.push(label);
				break;
			}
		}
		
		return vis;
	}
	
	
	function getActiveLabel()
	{
		var ret = false;
		
		for (var i = 0; i < IDEX.labels.length; i++)
		{
			var label = IDEX.labels[i]
			
			if (label.isActive)
			{
				ret = label;
				break;
			}
		}
		
		return ret;
	}
	
	
	function removeActiveLabel()
	{
		for (var i = 0; i < IDEX.labels.length; i++)
		{
			IDEX.labels[i].isActive = false;
		}
	}
	
	
	function getInputValues()
	{
		var $wrap = $(".orderbook-label-popup-left")
		
		var obj = {}
		obj.exchange = $wrap.find("input[name='ex']").val()
		obj.textcolor = $wrap.find("input[name='ctext']").val()
		obj.bgcolor = $wrap.find("input[name='cbg']").val()
		obj.nxtrs = $wrap.find("input[name='rs']").val()
		obj.market = $wrap.find("input[name='market']").val()
		
		return obj
	}
	
	
	function setInputValues(label)
	{
		var $wrap = $(".orderbook-label-popup-left")
		
		var obj = {}
		$wrap.find("input[name='ex']").val(label.exchange)
		$wrap.find("input[name='ctext']").val(label.textcolor)
		$wrap.find("input[name='cbg']").val(label.bgcolor)
		$wrap.find("input[name='rs']").val(label.nxtrs)
		
		//console.log($wrap.find("input"))
		//console.log($wrap.find("input[name='ex']").val())
		//$wrap.find("input[name='market']").val()
		
		return obj
	}
	
	
	IDEX.buildLabelRow = function(name)
	{
		var rowWrap = "<div class='orderbook-label-popup-all-row'></div>"
		var tdWrapName = "<div class='orderbook-label-popup-all-row-cell label-popup-all-name'></div>";
		var tdWrapVis = "<div class='orderbook-label-popup-all-row-cell label-popup-all-vis'></div>";
		var tdName = "<span>" + name + "</span>"
		var tdVis = "<img class='vert-align' src='img/eye.png'>"
		

		var tdNameStr = $(tdWrapName).html(tdName)[0].outerHTML
		var tdVisStr = $(tdWrapVis).html(tdVis)[0].outerHTML
			
		var combined = tdNameStr + tdVisStr
			
		var row = $(combined).wrapAll(rowWrap).parent()[0].outerHTML
		
		return row
	}
	
	
	/*$(".orderbook-label-popup-table").on("mouseover", ".orderbook-label-popup-all-row", function(e)
	{
		var has = $(e.target).hasClass("label-popup-all-name");
		console.log($(e.target))
		if (!has)
		{
			e.stopPropagation()
		}
		else
		{
			$(this).addClass("labelHover")
		}
	})
	
	$(".orderbook-label-popup-table").on("mouseleave", ".orderbook-label-popup-all-row", function(e)
	{
		$(this).removeClass("labelHover")
	})

	$(".orderbook-label-popup-table").on("mouseover", ".label-popup-all-vis", function(e)
	{
		//e.preventDefault();
		$(".orderbook-label-popup-all-row").trigger("mouseleave")
	})*/

	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));



var IDEX = (function(IDEX, $, undefined) {
	
IDEX.SATOSHI = 100000000;

IDEX.compareProp = function(prop)
{
	return function(a, b)
	{
		return a[prop] - b[prop];
	}
}


IDEX.toRS = function(id)
{
	var s = new NxtAddress()
	s.set(id)
	return s.toString();
}

IDEX.toSatoshi = function(number)
{
	return Math.round(Number(number) * IDEX.SATOSHI) / IDEX.SATOSHI;
}


IDEX.addElClass = function(row, rowClass)
{
	var s = "";
	
	$(row).each(function(e, p)
	{
		$(p).addClass(rowClass);
		s += $(p)[0].outerHTML;
	})
	
	return s;
}

IDEX.addElAttr = function(row, data, rowAttr)
{
	var s = "";
	
	$(row).each(function(e, p)
	{
		$(p).attr(rowAttr, data);
		s += $(p)[0].outerHTML;
	})
	
	return s;
}


IDEX.addElDataAttr = function(row, data, keys)
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


IDEX.objToList = function(data, keys)
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


IDEX.compObjs = function(aObj, bObj, keys)
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

IDEX.getFormData = function($form) 
{
	var serialized = $form.serializeArray();
	var data = {};

	for (var s in serialized) 
		data[serialized[s]['name']] = serialized[s]['value'];

	return data;
}


IDEX.extractPostPayload = function($element)
{
	var params = {};

	if ($element.is("button"))
	{
		var $form = $("#" + $element.attr("data-form"));
		params = IDEX.getFormData($form);
	}
	else
	{
		params = $element.data();
	}

	return params;
}


IDEX.buildPostPayload = function(method, data)
{
	var params = {'requestType':method};

	for (var i = 0; i < IDEX.snPostParams[method].length; ++i)
	{
		for (var key in data)
		{
			if (key == IDEX.snPostParams[method][i])
			{
				params[key] = data[key];
				break;
			}
		}
	}

	return params;
}


IDEX.constructFromObject = function(classInstance, obj)
{

	if (obj)
	{
		for (var key in obj)
		{
			classInstance[key] = obj[key];
		}
	}
	
	return classInstance
}


IDEX.getAssetInfo = function(key, val)
{
	var arr = [];
	var assetInfo = {};
	var len = IDEX.allAssets.length;
	
	for (var i = 0; i < len; ++i)
	{
		if (IDEX.allAssets[i][key] == val)
		{
			arr.push(IDEX.allAssets[i]);
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



IDEX.buildTableRows = function(data, tableType)
{
	var row = "";
	var rowWrap = "";
	var tdWrap = "";

	if (tableType == "table")
	{
		rowWrap = "<tr></tr>"
		tdWrap = "<td></td>";
	}
	else if (tableType == "span")
	{
		rowWrap = "<div class='order-row'></div>"
		tdWrap = "<span class='order-col'></span>";
	}
	
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


IDEX.getRowData = function($row, index)
{
	var isAsk = ($row.closest(".bookname").attr('id') == "buyBook") ? "bids" : "asks";
	var rowData = index >= IDEX.currentOrderbook[isAsk].length ? null : IDEX.currentOrderbook[isAsk][index];

	return rowData;
}

	return IDEX;
	
}(IDEX || {}, jQuery));
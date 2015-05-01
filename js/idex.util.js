

var IDEX = (function(IDEX, $, undefined)
{
	
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

	
	IDEX.getListObjVals = function(listObj, keys)
	{
		var obj = {};
		var len = listObj.length;

		for (var j = 0; j < keys.length; j++)
		{
			var key = keys[j];
			var vals = [];
			
			for (var i = 0; i < len; i++)
				vals.push(listObj[i][key]);
			
			obj[key] = vals;
		}
		
		return obj;
	}

	
	IDEX.setListObjVals = function(listObj, key, vals)
	{
		var len = listObj.length;
		
		for (var i = 0; i < len; i++)
			listObj[i][key] = vals[i];
		
		return listObj;	
	}


	IDEX.objToList = function(data, keys)
	{
		var arr = [];

		for (var i = 0; i < data.length; ++i)
		{
			var loopArr = [];

			for (var j = 0; j < keys.length; ++j)
			{
				if (!(keys[j] in data[i]))
					loopArr.push("")
				else
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


	/*
	function getBiggestWidth(newBids, newAsks)
	{
		var joined = newBids.concat(newAsks);
		var len = joined.length;
		var biggestWidth = -1;
		
		for (var i = 0; i < len; i++)
		{
			var num = joined[i];
			var numStr = String(num);
			var wholeDigits = numStr.split(".")[0]
			if (wholeDigits.length > biggestWidth)
				biggestWidth = wholeDigits.length
		}
		
		return biggestWidth
	}*/

	IDEX.formatNumberWidth = function(allNumbers, decimals)
	{
		var maxWidth = 8 + 1;
		var biggestWidth = -1;
		var len = allNumbers.length;
		
		for (var i = 0; i < len; i++)
		{
			var num = allNumbers[i];
			var numStr = String(num);
			var wholeDigits = numStr.split(".")[0]
			if (wholeDigits.length > biggestWidth)
				biggestWidth = wholeDigits.length
		}
		
		for (var i = 0; i < len; i++)
		{
			var num = allNumbers[i];
			var numStr = String(num);
			var digits = numStr.split(".");
			var wholeDigits = digits[0];
			var decDigits = digits[1];
			//var hasDecimal = numStr.search("\\.");
			if (numStr.length > maxWidth)
			{
				var extra = numStr.length - maxWidth;
				decDigits = decDigits.slice(0, (decDigits.length - extra));
			}
			if (wholeDigits.length < biggestWidth)
			{
				var extra = biggestWidth - wholeDigits.length;
				decDigits = decDigits.slice(0, ((decDigits.length) - extra));
			}
			allNumbers[i] = wholeDigits + "." + decDigits;
		}
		
		//console.log(allNumbers)
		return allNumbers
	}

	
	return IDEX;
	
}(IDEX || {}, jQuery));
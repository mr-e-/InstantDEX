
var IDEX = (function(IDEX, $, undefined) 
{   


	function toggleLoading(node, isLoading)
	{
		if (node[0] != "#")
			node = "#"+node
		var $parent = $(node).parent();
		var $loading = $parent.find(".chart-loading")
		if (isLoading)
		{
			$loading.show();
		}
		else
		{
			$loading.hide()
		}
	}
	


	IDEX.formatTimeDate = function(d)
	{
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
		  "July", "Aug", "Sept", "Oct", "Nov", "Dec"
		];
		//console.log(d)
		var month = monthNames[d.getMonth()]
		var day = d.getDate()
		var hours = String(d.getHours())
		var minutes = d.getMinutes()
		
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
		
		return month + ". " + day + " " + hours + ":" + minutes
	}
	
	IDEX.formatTime = function(d)
	{
		var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
		  "July", "Aug", "Sept", "Oct", "Nov", "Dec"
		];
		//console.log(d)
		var month = monthNames[d.getMonth()]
		var day = d.getDate()
		var hours = String(d.getHours())
		var minutes = d.getMinutes()
		
		minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
		
		return month + ". " + day 
	}
	
	IDEX.convertNXTTime = function(timestamp)
	{
		return timestamp + GENESIS_TIMESTAMP
	}
	

	
	
	IDEX.getYAxisNodes = function(node, index)
	{	
		var obj = {}
		var $axisGroup = $(node).find(".sleuthYAxis[data-axisnum='" + String(index) +"']")
		
		obj['labels'] = $axisGroup.find(".yLabels")
		obj['ticksLeft'] = $axisGroup.find(".yTicksLeft")
		obj['ticksRight'] = $axisGroup.find(".yTicksRight")
		obj['gridLines'] = $axisGroup.find(".yGridLines")
		
		return obj;
	}
	
	IDEX.getXAxisNodes = function(node, index)
	{	
		var obj = {}
		var $axisGroup = $(node).find(".sleuthXAxis[data-axisnum='" + String(index) +"']")
		
		obj['labels'] = $axisGroup.find(".xLabels")
		obj['ticks'] = $axisGroup.find(".xTicks")
		
		return obj;
	}
	
	
	
	//axis.canvas = document.createElement('canvas');
	//axis.ctx = this.canvas.getContext("2d");
	//axis.ctx.font = this.labels.fontSize + " Roboto"; 
	
	function getTextPixelWidth(text, fontSize)
	{
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		ctx.font = fontSize + " Roboto"; 
		
		return ctx.measureText(text).width;
	}
	
	
	function getMaxTextWidth(vals, fontSize, ctx)
	{
		var max = 0
		
		for (var i = 0; i < vals.length; i++)
		{
			var text = String(Number(vals[i].toPrecision(3)));
			var wid = ctx.measureText(text).width;
			
			if (wid > max)
				max = wid
		}
		
		return max
	}
	

	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));
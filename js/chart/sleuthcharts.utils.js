
var IDEX = (function(IDEX, $, undefined) 
{   



	Sleuthcharts = (function(Sleuthcharts) 
	{
		
		
		
		Sleuthcharts.Padding = function()
		{
			this.top = 0;
			this.bottom = 0;
			this.left = 0;
			this.right = 0;
		}
		
		Sleuthcharts.Positions = function()
		{

			this.top = 0;
			this.bottom = 0;
			this.left = 0;
			this.right = 0;
		}
		
		
		Sleuthcharts.extend = function(objA, objB)
		{
			if (!objA)
			{
				objA = {}
			}

			for (var key in objB)
			{
				objA[key] = objB[key];
			}

			
			return objA
		}
		
		Sleuthcharts.extendClass = function(parent, members)
		{
			var object = function () { return undefined; };
			object.prototype = new parent();
			Sleuthcharts.extend(object.prototype, members);
			
			return object;
		}
		
		
		Sleuthcharts.formatTime = function(d)
		{
			var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "June",
			  "July", "Aug", "Sept", "Oct", "Nov", "Dec"
			];

			var month = monthNames[d.getMonth()]
			var day = d.getDate()
			var hours = String(d.getHours())
			var minutes = d.getMinutes()
			
			minutes = minutes < 10 ? "0"+String(minutes) : String(minutes)
			
			return month + ". " + day 
			//return month + ". " + day + " " + hours + ":" + minutes

		}
		

		return Sleuthcharts;
		
		
	}(Sleuthcharts || {}));
		
		
		
		

	


	

	


	
	
	

	
	function getTextPixelWidth(text, fontSize)
	{
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext("2d");
		ctx.font = fontSize + " Roboto"; 
		
		return ctx.measureText(text).width;
	}
	
	
	IDEX.getMaxTextWidth = function(vals, fontSize, ctx)
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
	
	
	IDEX.convertNXTTime = function(timestamp)
	{
		return timestamp + GENESIS_TIMESTAMP
	}
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));
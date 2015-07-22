
var IDEX = (function(IDEX, $, undefined) 
{   



	Sleuthcharts = (function(Sleuthcharts) 
	{
		
		
		
		Sleuthcharts.Padding = function()
		{
			this.padding = 
			{
				"top":0,
				"bottom":0,
				"left":0,
				"right":0,
			};
		}
		
		Sleuthcharts.Positions = function()
		{
			this.positions = 
			{
				"top":0,
				"bottom":0,
				"left":0,
				"right":0,
			};
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
	
	
	IDEX.convertNXTTime = function(timestamp)
	{
		return timestamp + GENESIS_TIMESTAMP
	}
	
	
	
	return IDEX;
	
}(IDEX || {}, jQuery));
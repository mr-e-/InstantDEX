
Sleuthcharts = (function(Sleuthcharts) 
{
	
	
	var Renderer = Sleuthcharts.Renderer = function()
	{
		this.init.apply(this, arguments)
	}
	
	Renderer.prototype = 
	{
		
	}
	
	
	Sleuthcharts.drawCanvasPath = function(ctx, d, style)
	{
		
		var pathKeys = {
			M: "moveTo", 
			L: "lineTo",
			C: "bezierCurveTo",
			Z: "closePath"
		};
		
		var defaultOptions = {
			strokeColor: "transparent",
			fillColor: "transparent",
			lineWidth: 1,
			lineDash: [0, 0],
		};
		
		
		style = Sleuthcharts.extend(defaultOptions, style);
		
		
		var all = [];
		var obj = {};
		
		for (var i = 0; i < d.length; i++)
		{
			var val = d[i];
			
			if (val in pathKeys)
			{
				if (i > 0)
				{
					all.push(obj);
				}
				
				obj = {};
				obj.vals = [];
				obj.func = pathKeys[val];
				obj.index = i;
			}
			else
			{
				obj.vals.push(val);
			}
			
			if (i == d.length - 1)
			{
				all.push(obj);
			}
		}
		
		
		ctx.beginPath();
		ctx.lineWidth = style.lineWidth;
		ctx.setLineDash(style.lineDash);
		ctx.strokeStyle = style.strokeColor;
		ctx.fillStyle = style.fillColor;
		
		for (var i = 0; i < all.length; i++)
		{
			var loop = all[i];
			var funcName = loop.func;
			var vals = loop.vals;
			
			var ctxFunc = ctx[funcName];
			
			ctxFunc.apply(ctx, vals);
		}
		
		ctx.fill();
		ctx.stroke();
		
	};
	
	
	Sleuthcharts.drawCanvasLine = function(ctx, d, style)
	{
		var strokeColor = style.strokeColor;
		var fillColor = style.fillColor;
		var lineWidth = 1;
		
		var pathKeys = 
		{
			M: "moveTo", 
			L: "lineTo",
			C: "bezierCurveTo",
			Z: "closePath"
		};
		
		var all = [];
		var obj = {};
		
		for (var i = 0; i < d.length; i++)
		{
			var val = d[i];
			
			if (val in pathKeys)
			{
				if (i > 0)
				{
					all.push(obj);
				}
				
				obj = {};
				obj.vals = [];
				obj.func = pathKeys[val];
				obj.index = i;
			}
			else
			{
				obj.vals.push(val);
			}
			
			if (i == d.length - 1)
			{
				all.push(obj);
			}
		}
		
		
		ctx.beginPath();
		ctx.lineWidth = 1;
		ctx.strokeStyle = strokeColor;
		ctx.fillStyle = fillColor;
		
		for (var i = 0; i < all.length; i++)
		{
			var loop = all[i];
			var funcName = loop.func;
			var vals = loop.vals;
			
			var ctxFunc = ctx[funcName];
			
			ctxFunc.apply(ctx, vals);
		}
		
		ctx.fill();
		ctx.stroke();
		
	};
		
	
	
	
	
	return Sleuthcharts;
	
	
}(Sleuthcharts || {}));






var IDEX = (function(IDEX, $, undefined) 
{
	var nxtURL = "http://127.0.0.1:7777/nxt";
	var snURL = "http://127.0.0.1:7777/InstantDEX";
	var strURL = "http://127.0.0.1:7777/stringified"
	
	var lastTime = new Date().getTime()
	var q = []

	
	
	IDEX.sendPost = function(params, isNXT, callback) 
	{
		var dfd = new $.Deferred();
		var url = isNXT ? nxtURL : snURL;

		var time = new Date().getTime()
		var waitTime = 0;

		lastTime = time

		if (time - lastTime < 300)
			waitTime = 300 + (q.length * 300)
						
				
		/*if (!isNXT)
			params.plugin = "InstantDEX";
        else
			params.plugin = "nxt";*/
		
		if (!isNXT)
		{
			params = {"stringified":params}
			params = JSON.stringify(params);
			url = strURL;
		}
		else
		{
			
		}
		//console.log(JSON.stringify(params));
		var ajaxSettings = 
		{
			type: "POST",
			url: url,
			data: params,
			contentType: 'application/x-www-form-urlencoded',
			xhrFields: {
				withCredentials: true
			},
		};
		
		
		var obj = {}
		obj.ajaxSettings = ajaxSettings;
		obj.callback = callback;
		obj.dfd = dfd;
		obj.params = params;
		q.push(obj)

		
		setTimeout(function()
		{
			var xhr = $.ajax(ajaxSettings);
			
			xhr.done(function(data)
			{
				//console.log(data);
                if (typeof data == "string")
                    data = $.parseJSON(data);
				
				//console.log(data);
				

				dfd.resolve(data);
				
				if (callback)
					callback(data);
				
				q.pop()
			})
			
			xhr.fail(function(data)
			{
				console.log(data);
				if (data.statusText == "abort")
				{

				}
				
				dfd.reject(data);
				
				if (callback)
					callback(data);
				
				q.pop()
			})
			
			
			
		}, waitTime)
		
		return dfd.promise()
	}

	

	
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));


var IDEX = (function(IDEX, $, undefined) 
{
	
	var nxtURL = "http://127.0.0.1:7777/nxt?";
	var snURL = "http://127.0.0.1:7777/InstantDEX?";
	
	var lastTime = new Date().getTime()
	var q = []

	IDEX.sendPost = function(params, isNXT, callback) 
	{
		var time = new Date().getTime()
		
		var waitTime = 0;
		
		if (time - lastTime < 300)
		{
			waitTime = 300 + (q.length * 300)
		}
		
		lastTime = time
				
		var dfd = new $.Deferred();
		var url = isNXT ? nxtURL : snURL;
		
		if (!isNXT)
		{
			//params['timeout'] = 0;
			//params['plugin'] = "InstantDEX";
		}
		
		var ajaxSettings = 
		{
			type: "POST",
			url: url,
			data: params,
			contentType: 'application/x-www-form-urlencoded',
			xhrFields: {
				withCredentials: true
			},
			//timeout:10000,
		};
		
		var obj = {}
		obj.ajaxSettings = ajaxSettings;
		obj.callback = callback;
		obj.dfd = dfd;
		obj.params = params;
		q.push(obj)
		
		var index = q.length - 1;
		//console.log(waitTime)
		//console.log(JSON.stringify(params))
		console.log(params)
		
		setTimeout(function()
		{
			var xhr = $.ajax(ajaxSettings);

			//console.log(new Date().getTime())
			
			xhr.done(function(data)
			{
				data = $.parseJSON(data);
				//console.log(data)
				
				dfd.resolve(data);
				
				if (callback)
					callback(data);
				q.pop()
				//q.splice(index, 1);
			})
			
			xhr.fail(function(data)
			{
				//console.log(data)
				//$.growl.error({'message':message, 'location':"tl"});

				if (data.statusText == "abort")
				{
					//data = "abort";
				}
				
				dfd.reject(data);
				
				if (callback)
					callback(data);
				
				q.pop()
			})
			
			
			/*if (callback)
				return xhr;
			else
				return dfd.promise();*/
			
		}, waitTime)
		
		return dfd.promise()
	}

	
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));
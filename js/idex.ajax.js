

var IDEX = (function(IDEX, $, undefined) 
{
	
	var nxtURL = "http://127.0.0.1:7777/nxt?";
	var snURL = "http://127.0.0.1:7777/InstantDEX?";
	

	IDEX.sendPost = function(params, isNXT, callback) 
	{
		var dfd = new $.Deferred();
		var url = isNXT ? nxtURL : snURL;
		
		if (!isNXT)
		{
			params['timeout'] = 10000;
			params['plugin'] = "InstantDEX";
		}
		
		var ajaxSettings = 
		{
			type: "POST",
			url: url,
			data: params,
			contentType: 'application/x-www-form-urlencoded',
			xhrFields: {
				withCredentials: true
			}
		};
		
		/*
			//accepts:'text/plain',
			//dataType:'json',
			beforeSend:function(xhr)
			{
				console.log(xhr)
				xhr.setRequestHeader('authorization', '1');
			},
			//cache:false,
		*/
		
		var xhr = $.ajax(ajaxSettings);
		
		console.log(params)
		
		xhr.done(function(data)
		{
			data = $.parseJSON(data);
			//console.log(data)
			dfd.resolve(data);
			if (callback)
				callback(data);
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
		})
		
		
		if (callback)
			return xhr;
		else
			return dfd.promise();
	}


	
	
	

	return IDEX;
	
	
}(IDEX || {}, jQuery));
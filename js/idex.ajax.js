

var IDEX = (function(IDEX, $, undefined) 
{
	var windowsServerUsername = "user";
	var windowsServerPassword = "pass";
	var windowsServerAuth = btoa (windowsServerUsername + ":" + windowsServerPassword);
	
	var nxtURL = "http://127.0.0.1:7777/nxt?";
	var snURL = "http://127.0.0.1:7777/InstantDEX?";
	
	var lastTime = new Date().getTime()
	var q = []

    
    var windowsURL = "http://127.0.0.1:12345";
    var idCounter = 1;
	
	
	IDEX.sendPost = function(params, isNXT, callback) 
	{
		var dfd = new $.Deferred();
		var url = isNXT ? nxtURL : snURL;

		var time = new Date().getTime()
		var waitTime = 0;

		lastTime = time

		if (time - lastTime < 300)
			waitTime = 300 + (q.length * 300)
						
				
		if (!isNXT)
			params['plugin'] = "InstantDEX";
        else
			params['plugin'] = "nxt";
            
		
		
        if (IDEX.isWindows)
        {
            url = windowsURL;
            var a = {};
            a.method = "sendPost"
            a.id = idCounter++;
            a.params = params
            a = JSON.stringify(a);

            var ajaxSettings = 
            {
                type: "POST",
                url: url,
                data: a,
                contentType: 'application/json-rpc',
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + windowsServerAuth);
				},
            };
        }
        else
        {
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
        }
		
		
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

				
                if (IDEX.isWindows)
                {
                    var data = data['result']['retval'];

                    if (typeof data == "string")
                        data = $.parseJSON(data)
                }
                else
                {
                    data = $.parseJSON(data);
                }
				

				dfd.resolve(data);
				
				if (callback)
					callback(data);
				
				q.pop()
			})
			
			xhr.fail(function(data)
			{
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
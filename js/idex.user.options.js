	

var IDEX = (function(IDEX, $, undefined)
{	
	var defaultOptions = {
		"duration":6000,
		"minperc":75
	}

	IDEX.User.prototype.initOptions = function()
	{	
		var options = {};
		
		if (localStorage.options)
		{
			options = JSON.parse(localStorage.getItem("options"));
		}
		else
		{
			options = defaultOptions;
			localStorage.setItem('options', JSON.stringify(options));
		}
		
		this.updateOptionsDom(options);
		this.options = options;
	}
	
	
	IDEX.User.prototype.updateOptionsDom = function(options)
	{
		$(".option-minperc").val(options['minperc']);
		$(".option-duration").val(options['duration']);
	}
	
	
	IDEX.User.prototype.setOptions = function()
	{
		
	}
	
	
	IDEX.User.prototype.saveOptions = function()
	{
		var minperc = $(".option-minperc").val();
		var duration = $(".option-duration").val();
		
		this.options['minperc'] = minperc;
		this.options['duration'] = duration;
		
		localStorage.setItem('options', JSON.stringify(this.options));
	}

	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
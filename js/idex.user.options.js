	

var IDEX = (function(IDEX, $, undefined)
{	

	IDEX.User.prototype.initLabels = function()
	{
		var $table = $(".orderbook-label-popup-table")
		var orderbookLabels = [];
				
				
		if (localStorage.orderbookLabels)
		{
			orderbookLabels = JSON.parse(localStorage.getItem('orderbookLabels'));
		}

		for (var i = 0; i < orderbookLabels.length; i++)
		{
			var label = orderbookLabels[i];
			label.isActive = false;
			label.isVisible = false;
			IDEX.makeLabelStyle(label)
			var name = label.name
			var newRow = IDEX.buildLabelRow(name)
			
			$table.append($(newRow))
		}

		this.labels = orderbookLabels;
	}
	

	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));
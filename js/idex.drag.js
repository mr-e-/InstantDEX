
var IDEX = (function(IDEX, $, undefined) 
{

	interact('.draggable').draggable(
	{
		inertia: false,
		onmove: dragMoveListener,
		/*restrict: {
		  restriction: "parent",
		  endOnly: true,
		  elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
		},*/

	});

	function dragMoveListener (event) 
	{
		var target = event.target
		target = $(target).parent().get()[0]

		var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx
		var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
		
		var $el = $(".orderbook-label-popup")
		var offset = $el.offset()
		//console.log($(".orderbook-label-popup").position())
		var mouseY = event.clientY
		var mouseX = event.clientX
		var topPos = offset.top
		var leftPos = offset.left
		
		var height = 30
		var width = 448
		
		var isInsideY = (mouseY > topPos) && (mouseY < topPos + height)
		var isInsideX = (mouseX > leftPos) && (mouseX < leftPos + width)
		
		if (isInsideY && isInsideX)
		{
			//$el.css("cursor", "pointer !important")
			target.style.webkitTransform =
			target.style.transform =
			'translate(' + x + 'px, ' + y + 'px)';

			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);
		}
		else
		{
			//event.stopPropagation()
		}
	}






	return IDEX;

}(IDEX || {}, jQuery));



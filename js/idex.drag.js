
var IDEX = (function(IDEX, $, undefined) 
{


	// target elements with the "draggable" class
	interact('.draggable')
	.draggable({
		// enable inertial throwing
		inertia: false,
		// keep the element within the area of it's parent
		/*restrict: {
		  restriction: "parent",
		  endOnly: true,
		  elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
		},*/

		onmove: dragMoveListener,

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
		
		//console.log(target)
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

	// this is used later in the resizing demo
	window.dragMoveListener = dragMoveListener;
	/* The dragging code for '.draggable' from the demo above
	* applies to this demo as well so it doesn't have to be repeated. */

	// enable draggables to be dropped into this
	interact('.dropzone').dropzone({
		// only accept elements matching this CSS selector
		accept: '#yes-drop',
		// Require a 75% element overlap for a drop to be possible
		overlap: 0.75,

		// listen for drop related events:

		ondropactivate: function (event) {
			console.log(1)
			// add active dropzone feedback
			event.target.classList.add('drop-active');
		},
		ondragenter: function (event) {
			console.log(2)
			var draggableElement = event.relatedTarget,
			dropzoneElement = event.target;

			// feedback the possibility of a drop
			dropzoneElement.classList.add('drop-target');
			draggableElement.classList.add('can-drop');
			draggableElement.textContent = 'Dragged in';
		},
		ondragleave: function (event) {
			console.log(3)
			// remove the drop feedback style
			event.target.classList.remove('drop-target');
			event.relatedTarget.classList.remove('can-drop');
			event.relatedTarget.textContent = 'Dragged out';
		},
		ondrop: function (event) {
			event.relatedTarget.textContent = 'Dropped';
		},
		ondropdeactivate: function (event) {
			// remove active dropzone feedback
			event.target.classList.remove('drop-active');
			event.target.classList.remove('drop-target');
		}
	});
	
	interact('.resize-drag')
	.draggable({
		onmove: window.dragMoveListener
	})
	.resizable({
		edges: { left: true, right: true, bottom: true, top: true }
	})
	.on('resizemove', function (event) {
		var target = event.target,
			x = (parseFloat(target.getAttribute('data-x')) || 0),
			y = (parseFloat(target.getAttribute('data-y')) || 0);

	// update the element's style
		target.style.width  = event.rect.width + 'px';
		target.style.height = event.rect.height + 'px';

		// translate when resizing from top or left edges
		x += event.deltaRect.left;
		y += event.deltaRect.top;

		target.style.webkitTransform = target.style.transform =
			'translate(' + x + 'px,' + y + 'px)';

		target.setAttribute('data-x', x);
		target.setAttribute('data-y', y);
		//target.textContent = event.rect.width + '×' + event.rect.height;
	});


	return IDEX;

}(IDEX || {}, jQuery));



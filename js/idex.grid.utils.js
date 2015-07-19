


var IDEX = (function(IDEX, $, undefined) 
{
	
	
	var $mainGrid = $("#main_grid");
	var $tileAdd = $("#tile_add");
	var $contentWrap = $("#content_wrap");
	
	
	$(".mainHeader-grid-ico-wrap").each(function()
	{
		var gridType = $(this).attr("data-grid");
		$(this).tooltipster({
			content:IDEX.capitalizeFirstLetter(gridType),
			arrow:false,
			offsetY:-15
		})
	})
	
	
	IDEX.getArrowDirections = function($arrow)
	{
		var arrowDirections = {};
		var direction = $arrow.attr("data-arrow");
		
		arrowDirections.direction = direction;
		arrowDirections.isTop = direction == "top";
		arrowDirections.isBottom = direction == "bottom";
		arrowDirections.isLeft = direction == "left";
		arrowDirections.isRight = direction == "right";
		arrowDirections.isMiddle = direction == "middle"
		
		arrowDirections.isHoriz = (direction == "left" || direction == "right");
		arrowDirections.isVert = (direction == "top" || direction == "bottom");
		
		return arrowDirections;
	}
	
	
	
	IDEX.checkIfMouseIsInsideBorder = function(mouseY, mouseX, pos)
	{
		var isInsideBorder = {};
		var borderWidth = 4;
		var direction = ""

		isInsideBorder.top = mouseY > pos.top && mouseY < (pos.top + borderWidth);
		isInsideBorder.bottom = mouseY < pos.bottom && mouseY > (pos.bottom - borderWidth);

		isInsideBorder.left = mouseX > pos.left && mouseX < (pos.left + borderWidth);
		isInsideBorder.right = mouseX < pos.right && mouseX > (pos.right - borderWidth);
		
		isInsideBorder.isInside = (isInsideBorder.top || isInsideBorder.bottom || isInsideBorder.left || isInsideBorder.right)
		
		for (key in isInsideBorder)
		{
			if (key == "isInside")
				continue;
			if (isInsideBorder[key])
				direction = key;
		}
		
		isInsideBorder.direction = direction;
		
		return isInsideBorder;
	}
	
	
	IDEX.getPositions = function($el, isAbs)
	{
		var positions = {};

		var offset = $el.offset()
		if (isAbs)
			offset = $el.position();
		
		var width = $el[0].getBoundingClientRect().width
		var height = $el[0].getBoundingClientRect().height
		
		positions.height = height;
		positions.width = width;
		positions.top = offset.top;
		positions.bottom = positions.top + height;
		positions.left = offset.left;
		positions.right = positions.left + width;
		
		return positions
	}
	
	
	
	
	return IDEX;
	
	
}(IDEX || {}, jQuery));

	
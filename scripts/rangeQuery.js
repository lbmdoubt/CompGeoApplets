$(document).ready(function(){
    var canvasPos, xCanvasPos, yCanvasPos;
    var xCanvasPosPre, yCanvasPosPre;
    var points = new Array();
    var canvas, xCanvas, yCanvas, kdCanvas;
    var startTime = -1;
    var selectedPointIndex = -1;
    var selectedPointYTreeIndex = -1;
    var highlightedPointIndex = -1;
    var selectedXNodeIndex = -1;
    var selectedYNodeIndex = -1;
	var maxPoints = 200;
	var xTree = new Array();
    var yTreeList = null;
	var yTree = new Array();
	var yTreePoints = new Array();
    var yTreeIndex = -1;
    var selectRectStart = null;
    var selectRect = null;
    var isMouseDown = false;
    var isMouseDownXCanvas = false;
    var isMouseDownYCanvas = false;
	var xRangeLeft = -1;
	var xRangeRight = -1;
    var yRangeTop = -1;
    var yRangeBottom = -1;
    var xCanvasXOffset = 0;
    var xCanvasYOffset = 0;
    var yCanvasXOffset = 0;
    var yCanvasYOffset = 0;
    var xCanvasXOffsetMax = 0;
    var xCanvasYOffsetMax = 0;
    var xCanvasXOffsetMin = 0;
    var xCanvasYOffsetMin = 0;
    var yCanvasXOffsetMax = 0;
    var yCanvasYOffsetMax = 0;
    var yCanvasXOffsetMin = 0;
    var yCanvasYOffsetMin = 0;
    var xCanvasWidth;
    var xCanvasHeight;
    var yCanvasWidth;
    var yCanvasHeight;
    var kdCanvasWidth;
    var kdCanvasHeight;
    
    //get images to draw
    var redRect10px = document.getElementById("rect_red_10px");
    var greenRect10px = document.getElementById("rect_green_10px");
    var whiteRect10px = document.getElementById("rect_white_10px");
    var blueRect10px = document.getElementById("rect_blue_10px");
    var redCirc10px = document.getElementById("circ_red_10px");
    var whiteCirc10px = document.getElementById("circ_white_10px");
    var blueCirc10px = document.getElementById("circ_blue_10px");
    
    var mode = 0; //0:Orthogonal Range Tree, 1: kdTree
    
    var kdTreeButton = document.getElementById("kdTree");
    var rangeTreeButton = document.getElementById("rangeTree");

    //set up action listeners
    canvas = document.getElementById('rangeQueryCanvas');
    xCanvas = document.getElementById('xTreeCanvas');
    yCanvas = document.getElementById('yTreeCanvas');
    kdCanvas = document.getElementById('kdTreeCanvas');
	var clearButton = document.getElementById('rangeQueryClear');
    
    xCanvasWidth = xCanvas.width;
    xCanvasHeight = xCanvas.height;
    yCanvasWidth = yCanvas.width;
    yCanvasHeight = yCanvas.height;
    kdCanvasWidth = kdCanvas.width;
    kdCanvasHeight = kdCanvas.height;
    
    $( ".kdTree" ).css( "display", "none" );
    
	clearButton.onclick=function(){
        xCanvasXOffset = 0;
        xCanvasYOffset = 0;
        selectedXNodeIndex = -1;
        clearRangeQueryCanvas();
    };
    if(kdTreeButton != null){
        kdTreeButton.onclick=function(){
            if(kdTreeButton.checked){
                mode = 1;
                $( ".rangeQuery" ).css( "display", "none" );
                $( ".kdTree" ).css( "display", "block" );
                redraw();
            }
        }
    }
    if(rangeTreeButton != null){
        rangeTreeButton.onclick=function(){
            if(rangeTreeButton.checked){
                mode = 0;
                $( ".rangeQuery" ).css( "display", "block" );
                $( ".kdTree" ).css( "display", "none" );
                
                constructRangeTrees();
                redraw();
            }
        }
    }
    canvas.addEventListener('mousedown', function(){ mouseDown()}, false);
    canvas.addEventListener('mouseup', function(){ mouseUp()}, false);
    canvas.addEventListener('mousemove', function(e) {
        canvasPos = getCanvasPos(e, 'rangeQueryCanvas');
		xCanvasPos = null;
		yCanvasPos = null;
        mouseMove();
        redraw();
    }, false);
    canvas.addEventListener('mouseout', function(e) {
        canvasPos = null;
		xCanvasPos = null;
		yCanvasPos = null;
        startTime = -1;
        selectedPointIndex = -1;
        highlightedPointIndex = -1;
        redraw();
    }, false);
    xCanvas.addEventListener('mousemove', function(e) {
        xCanvasPos = getCanvasPos(e, 'xTreeCanvas');
		canvasPos = null;
		yCanvasPos = null;
        
        if(isMouseDownXCanvas){
            if(xCanvasPos.x > 0 && xCanvasPos.y > 0){
                xCanvasXOffset += xCanvasPos.x - xCanvasPosPre.x;
                xCanvasYOffset += xCanvasPos.y - xCanvasPosPre.y;
                xCanvasXOffset = Math.max(Math.min(xCanvasXOffset, xCanvasXOffsetMax), xCanvasXOffsetMin);
                xCanvasYOffset = Math.max(Math.min(xCanvasYOffset, xCanvasYOffsetMax), xCanvasYOffsetMin);
            } else {
                isMouseDownXCanvas = false
            }
        }
        
        redraw();
        xCanvasPosPre=xCanvasPos;
    }, false);
    xCanvas.addEventListener('mousedown', function(e){ 
        isMouseDownXCanvas = true;
        startTime = new Date().getTime();
    }, false);
    xCanvas.addEventListener('mouseup', function(e){ 
        isMouseDownXCanvas = false;
        clickXCanvas();
        startTime = -1;
    }, false);
    xCanvas.addEventListener('mouseout', function(e) {
        canvasPos = null;
		xCanvasPos = null;
		yCanvasPos = null;
        startTime = -1;
    }, false);
    yCanvas.addEventListener('mousemove', function(e) {
        yCanvasPos = getCanvasPos(e, 'yTreeCanvas');
		canvasPos = null;
		xCanvasPos = null;
        
        if(isMouseDownYCanvas){
            if(yCanvasPos.x > 0 && yCanvasPos.y > 0){
                yCanvasXOffset += yCanvasPos.x - yCanvasPosPre.x;
                yCanvasYOffset += yCanvasPos.y - yCanvasPosPre.y;
                yCanvasXOffset = Math.max(Math.min(yCanvasXOffset, yCanvasXOffsetMax), yCanvasXOffsetMin);
                yCanvasYOffset = Math.max(Math.min(yCanvasYOffset, yCanvasYOffsetMax), yCanvasYOffsetMin);
            } else {
                isMouseDownYCanvas = false;
            }
        }
        
        redraw();
        yCanvasPosPre=yCanvasPos;
    }, false);
    yCanvas.addEventListener('mousedown', function(e){ 
        isMouseDownYCanvas = true;
        startTime = new Date().getTime();
    }, false);
    yCanvas.addEventListener('mouseup', function(e){ 
        isMouseDownYCanvas = false;
        startTime = -1;
    }, false);
    yCanvas.addEventListener('mouseout', function(e) {
        canvasPos = null;
		xCanvasPos = null;
		yCanvasPos = null;
        startTime = -1;
    }, false);

    function getCanvasPos(e, canvasId){
		var c = document.getElementById(canvasId);
        var rect = c.getBoundingClientRect();
        var pos = {x: e.clientX - rect.left, y: e.clientY - rect.top};
        if (pos.x > rect.width - 5 || pos.y > rect.height - 5){ //don't register position when its close to the border
            pos = {x: -1, y: -1};
        }
        return pos;
    }

    function mouseDown(){
        isMouseDown = true;
        startTime = new Date().getTime();
        selectedPointIndex = -1;
		if(canvasPos != null){
			for(var i = 0; i < points.length; i++){
				if(Math.abs(points[i].x - canvasPos.x) <= 4 && Math.abs(points[i].y - canvasPos.y) <= 4){
					selectedPointIndex = i;
				}
			}
			if(selectedPointIndex < 0){
                selectRectStart = canvasPos;
			}
		}
    }

    function mouseUp(){
        isMouseDown = false;
        addPoint();
        startTime = -1;
        selectedPointIndex = -1;
    }

    function addPoint()
    {
		if(canvasPos == null){
			return;
		}
        var endTime = new Date().getTime();
        var newPointAdded = false;
        if(selectedPointIndex < 0 && endTime - startTime < 200){
			if(points.length > maxPoints){
				return;
			}
            points.push({x:canvasPos.x, y:canvasPos.y, i:points.length});
            newPointAdded = true;
            selectedXNodeIndex = -1;
            yTreeList = null;
        } else {
            endTime = new Date().getTime();
            if(startTime > 0){
                if(endTime - startTime < 200){
                    points.splice(selectedPointIndex, 1);
                    selectedPointIndex = -1;
                    selectedXNodeIndex = -1;
                    yTreeList = null;
                }
            }
        }
        //remove duplicate points
        var selectedPoint = selectedPointIndex;
        if(selectedPoint < 0 && newPointAdded){
            //ignore newly added point
            selectedPoint = points.length - 1
        }
        if(selectedPoint >= 0){
            for(var i = points.length - 1; i >= 0; i--){
                if(i != selectedPoint && Math.abs(points[i].x - canvasPos.x) <= 8 && Math.abs(points[i].y - canvasPos.y) <= 8){
                    points.splice(i, 1);
                }
            }
        }
        if(mode == 0){
            constructRangeTrees();
        }
        redraw();
    }

    function mouseMove(){
        var endTime = new Date().getTime();
        if(startTime > 0){
            movePoint();
        }
        if(canvasPos != null && selectedPointIndex < 0 && selectRectStart != null && isMouseDown && endTime - startTime > 200 && startTime > 0 && canvasPos.x > 0 && canvasPos.y > 0){
			selectRect = {x1:selectRectStart.x, y1:selectRectStart.y, x2:canvasPos.x, y2:canvasPos.y};
        }
    }

    function movePoint(){
        if(selectedPointIndex >= 0 && canvasPos != null && canvasPos.x > 1 && canvasPos.y > 1){
            points[selectedPointIndex] = canvasPos;
            selectedXNodeIndex = -1;
            yTreeList = null;
            if(mode == 0){
                constructRangeTrees();
            }
        }
    }

    function redraw()
    {
		fixScale();
        clearCanvas();
        var ctx=canvas.getContext("2d");
        ctx.save();
        
        if(mode == 0){
            calcHoverColors();
            
            if(xRangeLeft >= 0 && xRangeRight >= 0 && xRangeRight >= xRangeLeft){
                xRangeRight = Math.min(xRangeRight, canvas.width);
                ctx.strokeStyle = "#00FF00";
                ctx.fillStyle = "#00FF00";
                ctx.globalAlpha = 0.2;
                ctx.fillRect(xRangeLeft, 0, xRangeRight - xRangeLeft, canvas.height);
                ctx.globalAlpha = 1.0;
                ctx.beginPath();
                ctx.moveTo(xRangeLeft,0);
                ctx.lineTo(xRangeLeft,canvas.height);
                ctx.moveTo(xRangeRight,0);
                ctx.lineTo(xRangeRight,canvas.height);
                ctx.stroke();
            }
            
            if(yRangeTop >= 0 && yRangeBottom >= 0 && yRangeBottom >= yRangeTop){
               yRangeBottom = Math.min(yRangeBottom, canvas.height);
                ctx.strokeStyle = "#00FF00";
                ctx.fillStyle = "#00FF00";
                ctx.globalAlpha = 0.2;
                ctx.fillRect(0, yRangeTop, canvas.width, yRangeBottom - yRangeTop);
                ctx.globalAlpha = 1.0;
                ctx.beginPath();
                ctx.moveTo(0,yRangeTop);
                ctx.lineTo(canvas.width,yRangeTop);
                ctx.moveTo(0,yRangeBottom);
                ctx.lineTo(canvas.height,yRangeBottom);
                ctx.stroke();
            }
        }
		
        if(selectRect != null){
            var x = Math.min(selectRect.x1, selectRect.x2);
            var y = Math.min(selectRect.y1, selectRect.y2);
            var x2 = Math.max(selectRect.x1, selectRect.x2);
            var y2 = Math.max(selectRect.y1, selectRect.y2);
            var xDiff = x2 - x;
            var yDiff = y2 - y;
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = "#0000FF";
            ctx.fillRect(x,y,xDiff,yDiff);
            ctx.globalAlpha = 1.0;
            ctx.beginPath();
            ctx.strokeStyle = "#0000FF";
            ctx.rect(x,y,xDiff,yDiff);
            ctx.stroke();
            ctx.strokeStyle = "#000000";
            
            //draw out range sections
            if(mode == 0){
                for(var i = 0; i < xTree.length; i++){
                    if(xTree[i].inRange && (xTree[i].parent < 0 || !xTree[xTree[i].parent].inRange)){
                        ctx.beginPath();
                        ctx.strokeStyle = "#0000FF";
                        ctx.globalAlpha = 0.4;
                        ctx.moveTo(xTree[i].min, y);
                        ctx.lineTo(xTree[i].min, y2);
                        if(xTree[i].max != xTree[i].min){
                            ctx.moveTo(xTree[i].max, y);
                            ctx.lineTo(xTree[i].max, y2);
                        }
                        ctx.stroke();
                        ctx.globalAlpha = 1.0;
                    
                        for(var j = 0; j < yTreeList[i].tree.length; j++){
                            if(yTreeList[i].tree[j].inRange && (yTreeList[i].tree[j].parent < 0 || !yTreeList[i].tree[yTreeList[i].tree[j].parent].inRange)){
                                ctx.beginPath();
                                ctx.strokeStyle = "#0000FF";
                                ctx.globalAlpha = 0.4;
                                ctx.moveTo(xTree[i].min, yTreeList[i].tree[j].min);
                                ctx.lineTo(xTree[i].max, yTreeList[i].tree[j].min);
                                if(yTreeList[i].tree[j].max != yTreeList[i].tree[j].min){
                                    ctx.moveTo(xTree[i].min, yTreeList[i].tree[j].max);
                                    ctx.lineTo(xTree[i].max, yTreeList[i].tree[j].max);
                                }
                                ctx.stroke();
                                ctx.globalAlpha = 1.0;
                                
                            }
                        }
                    }
                }
            }
        }
        
        for(var i = 0; i < points.length; i++){
            if(highlightedPointIndex == i){
                ctx.fillStyle = "#FF0000";
				ctx.fillRect(points[i].x - 2,points[i].y - 2,5,5);
            } else if (highlightedPointIndex < 0 || Math.abs(points[i].x - points[highlightedPointIndex].x) > 4 || Math.abs(points[i].y - points[highlightedPointIndex].y) > 4){
                ctx.fillStyle = points[i].color;
                ctx.fillRect(points[i].x - 1,points[i].y - 1,3,3);
            }
        }
		
        if(mode == 0){
            drawXTree();
            drawYTree();
        }
        
        ctx.restore();
    }

	function fixScale(){
		canvas.height = canvas.getContext("2d").canvas.clientHeight;
		canvas.width = canvas.getContext("2d").canvas.clientWidth;
		xCanvas.height = xCanvas.getContext("2d").canvas.clientHeight;
		xCanvas.width = xCanvas.getContext("2d").canvas.clientWidth;
		yCanvas.height = yCanvas.getContext("2d").canvas.clientHeight;
		yCanvas.width = yCanvas.getContext("2d").canvas.clientWidth;
	}
	
    function clearRangeQueryCanvas(){
        points = new Array();
        xTree = new Array();
        yTree = new Array();
        selectRect = null;
        selectRectStart = null;
        xRangeLeft = -1;
        xRangeRight = -1;
        yRangeTop = -1;
        yRangeBottom = -1;
        redraw();
    }

    function clearCanvas()
    {
        //var c=$(".panes div:not(:hidden) canvas")[0];
        var ctx=canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx=xCanvas.getContext("2d");
        ctx.clearRect(0, 0, xCanvasWidth, xCanvasHeight);
		ctx=yCanvas.getContext("2d");
        ctx.clearRect(0, 0, yCanvasWidth, yCanvasHeight);
    }
	
	function calcHoverColors(){
		highlightedPointIndex = -1;
        for(var i = 0; i < points.length; i++){
            if(canvasPos != null && Math.abs(points[i].x - canvasPos.x) <= 4 && Math.abs(points[i].y - canvasPos.y) <= 4){
				points[i].color="#FF0000";
				highlightedPointIndex = i;
            } else {
				points[i].color="#000000";
            }
        }
		
        yTreeIndex = -1;
		if(xTree.length > 0){
			xTree[0].color="#222222";
			xRangeLeft = -1;
			xRangeRight = -1;
            var isHoveringOverNode = false;
			for(var i=0; i < xTree.length; i++){
				if(xTree[i].isLeaf && xTree[i].refPoint == highlightedPointIndex){
					xTree[i].color="#FF0000";
				} else if((xCanvasPos != null && Math.abs(xTree[i].x - xCanvasPos.x + xCanvasXOffset) < 6 && Math.abs(xTree[i].y - xCanvasPos.y + xCanvasYOffset) < 6 && selectedXNodeIndex < 0) || selectedXNodeIndex == i){
                    isHoveringOverNode = true;
                    
                    yTree = yTreeList[i].tree;
                    yTreePoints = yTreeList[i].points;
                    yTreeIndex = i;
                    
                    for(var j = 0; j < yTree.length; j++){
                        yCanvasXOffsetMin = Math.min(yCanvas.width - yTree[j].x - 10, yCanvasXOffsetMin);
                        yCanvasXOffsetMax = Math.max(-1 * yTree[j].x + 10, yCanvasXOffsetMax);
                        yCanvasYOffsetMin = Math.min(yCanvas.height - yTree[j].y - 10, yCanvasYOffsetMin);
                        yCanvasYOffsetMax = Math.max(-1 * yTree[j].y + 10, yCanvasYOffsetMax);
                    }
                    
                    yCanvasXOffset = Math.max(Math.min(yCanvasXOffset, yCanvasXOffsetMax), yCanvasXOffsetMin);
                    yCanvasYOffset = Math.max(Math.min(yCanvasYOffset, yCanvasYOffsetMax), yCanvasYOffsetMin);
                    
                    for(var j = 0; j < yTree.length; j++){
                        yTree[j].color = "#222222";
                    }
                    
                    if(xTree[i].isLeaf){
                        xTree[i].color = "#FF0000";
                    } else {
                        xTree[i].color = "#00FF00";
                    }
					if(!xTree[i].isLeaf){
                        if(xTree[xTree[i].leftChild].isLeaf){
                            xTree[xTree[i].leftChild].color = "#FF0000";
                        } else {
                            xTree[xTree[i].leftChild].color = xTree[i].color;
                        }
                        if(xTree[xTree[i].rightChild].isLeaf){
                            xTree[xTree[i].rightChild].color = "#FF0000";
                        } else {
                            xTree[xTree[i].rightChild].color = xTree[i].color;
                        }
                        xRangeLeft = xTree[i].min;
                        xRangeRight = xTree[i].max;
					} else {
                        points[xTree[i].refPoint].color = xTree[i].color;
					}
				} else {
					if(!xTree[i].isLeaf){
                        if(xTree[xTree[i].leftChild].isLeaf && xTree[i].color == "#00FF00"){
                            xTree[xTree[i].leftChild].color = "#FF0000";
                        } else {
                            xTree[xTree[i].leftChild].color = xTree[i].color;
                        }
                        if(xTree[xTree[i].rightChild].isLeaf && xTree[i].color == "#00FF00"){
                            xTree[xTree[i].rightChild].color = "#FF0000";
                        } else {
                            xTree[xTree[i].rightChild].color = xTree[i].color;
                        }
					} else {
						points[xTree[i].refPoint].color = xTree[i].color;
					}
				}
			}
            if(!isHoveringOverNode){
                yTree = new Array();
            }
		}
        if(yTree.length > 0 && selectedXNodeIndex >= 0){
            yTree[0].color = "#222222";
			yRangeTop = -1;
			yRangeBottom = -1;
            var isHoveringOverNode = false;
			for(var i=0; i < yTree.length; i++){
				if(yTree[i].isLeaf && yTreePoints[yTree[i].refPoint].i == highlightedPointIndex){
					yTree[i].color="#FF0000";
				} else if((yCanvasPos != null && Math.abs(yTree[i].x - yCanvasPos.x + yCanvasXOffset) < 6 && Math.abs(yTree[i].y - yCanvasPos.y + yCanvasYOffset) < 6 && selectedYNodeIndex < 0) || selectedYNodeIndex == i){
                    isHoveringOverNode = true;
                    
                    if(yTree[i].isLeaf){
                        yTree[i].color = "#FF0000";
                    } else {
                        yTree[i].color = "#00FF00";
                    }
					if(!yTree[i].isLeaf){
                        if(yTree[yTree[i].leftChild].isLeaf){
                            yTree[yTree[i].leftChild].color = "#FF0000";
                        } else {
                            yTree[yTree[i].leftChild].color = yTree[i].color;
                        }
                        if(yTree[yTree[i].rightChild].isLeaf){
                            yTree[yTree[i].rightChild].color = "#FF0000";
                        } else {
                            yTree[yTree[i].rightChild].color = yTree[i].color;
                        }
                        yRangeTop = yTree[i].min;
                        yRangeBottom = yTree[i].max;
					} else {
                        yTreePoints[yTree[i].refPoint].color = yTree[i].color;
					}
				} else {
					if(!yTree[i].isLeaf){
                        if(yTree[yTree[i].leftChild].isLeaf && yTree[i].color == "#00FF00"){
                            yTree[yTree[i].leftChild].color = "#FF0000";
                        } else {
                            yTree[yTree[i].leftChild].color = yTree[i].color;
                        }
                        if(yTree[yTree[i].rightChild].isLeaf && yTree[i].color == "#00FF00"){
                            yTree[yTree[i].rightChild].color = "#FF0000";
                        } else {
                            yTree[yTree[i].rightChild].color = yTree[i].color;
                        }
					} else {
						yTreePoints[yTree[i].refPoint].color = yTree[i].color;
					}
				}
            }
            
            if(isHoveringOverNode){
                for(var i=0; i < yTree.length; i++){
                    if(yTree[i].isLeaf){
                        for(var j = 0; j < xTree.length; j++){
                            if(xTree[j].isLeaf && xTree[j].refPoint == yTreePoints[yTree[i].refPoint].i){
                                xTree[j].color = yTree[i].color;
                            }
                        }
                    }
                }
            }
        }
        
		for(var i=0; i < xTree.length; i++){
            if(selectRect != null && xTree[i].min >= Math.min(selectRect.x1, selectRect.x2) && xTree[i].max <= Math.max(selectRect.x1, selectRect.x2)){
                if(!(xTree[i].isLeaf && xTree[i].refPoint == highlightedPointIndex)){
                    xTree[i].color = "#0000FF";
				}
                xTree[i].inRange = true;
                for(var j = 0; j < yTreeList[i].tree.length; j++){
                    if(yTreeList[i].tree[j].min >= Math.min(selectRect.y1, selectRect.y2) && yTreeList[i].tree[j].max <= Math.max(selectRect.y1, selectRect.y2)){
                        yTreeList[i].tree[j].color = "#0000FF";
                        yTreeList[i].tree[j].inRange = true;
                    } else {
                        yTreeList[i].tree[j].inRange = false;
                    }
                }
                if(yTreeIndex == i){
                    for(var j = 0; j < yTree.length; j++){
                        if(yTree[j].min >= Math.min(selectRect.y1, selectRect.y2) && yTree[j].max <= Math.max(selectRect.y1, selectRect.y2)){
                            if(!(yTree[j].isLeaf && yTreePoints[yTree[j].refPoint].i == highlightedPointIndex)){
                                yTree[j].color = "#0000FF";
                            } else {
                                yTree[j].color = "#FF0000";
                            }
                            yTree[j].inRange = true;
                        } else {
                            yTree[j].inRange = false;
                        }
                    }
                }
            } else {
                xTree[i].inRange = false;
                for(var j = 0; j < yTreeList[i].tree.length; j++){
                    yTreeList[i].tree[j].inRange = false;
                }
                if(yTreeIndex == i){
                    for(var j = 0; j < yTree.length; j++){
                        yTree[j].inRange = false;
                    }
                }
            }
        }
	}
    
	function drawXTree(){
		if(xTree.length <= 0){
			return;
		}
		var xCtx=xCanvas.getContext("2d");
		xCtx.save();
		 
		
		for(var i=0; i < xTree.length; i++){
            //draw the lines connecting the tree
            if(!xTree[i].isLeaf){
				xCtx.strokeStyle=xTree[i].color;
                xCtx.beginPath();
                xCtx.moveTo(xTree[i].x + xCanvasXOffset,xTree[i].y + xCanvasYOffset);
                xCtx.lineTo(xTree[xTree[i].leftChild].x + xCanvasXOffset,xTree[xTree[i].leftChild].y + xCanvasYOffset);
                xCtx.stroke();
                xCtx.beginPath();
                xCtx.moveTo(xTree[i].x + xCanvasXOffset,xTree[i].y + xCanvasYOffset);
                xCtx.lineTo(xTree[xTree[i].rightChild].x + xCanvasXOffset,xTree[xTree[i].rightChild].y + xCanvasYOffset);
                xCtx.stroke();
            }
        
            //draw the nodes
            xCtx.beginPath();
            if(xTree[i].isLeaf && xTree[i].refPoint == highlightedPointIndex){
				xCtx.strokeStyle=xTree[i].color;
            } else if(xCanvasPos != null && Math.abs(xTree[i].x - xCanvasPos.x) < 6 && Math.abs(xTree[i].y - xCanvasPos.y) < 6){
				xCtx.strokeStyle=xTree[i].color;
            } else {
				xCtx.strokeStyle=xTree[i].color;
			}
			if(xTree[i].isLeaf){
                if(xTree[i].color == "#222222"){
                    xCtx.drawImage(whiteCirc10px, xTree[i].x - 5 + xCanvasXOffset, xTree[i].y - 5 + xCanvasYOffset);
                } else if(xTree[i].color == "#FF0000"){
                    xCtx.drawImage(redCirc10px, xTree[i].x - 5 + xCanvasXOffset, xTree[i].y - 5 + xCanvasYOffset);
                } else if(xTree[i].color == "#0000FF"){
                    xCtx.drawImage(blueCirc10px, xTree[i].x - 5 + xCanvasXOffset, xTree[i].y - 5 + xCanvasYOffset);
                } else {
                    xCtx.arc(xTree[i].x + xCanvasXOffset,xTree[i].y + xCanvasYOffset,5,0,2*Math.PI);
                }
            } else {
                if(xTree[i].color == "#222222"){
                    xCtx.drawImage(whiteRect10px, xTree[i].x - 5 + xCanvasXOffset, xTree[i].y - 5 + xCanvasYOffset);
                } else if(xTree[i].color == "#FF0000"){
                    xCtx.drawImage(redRect10px, xTree[i].x - 5 + xCanvasXOffset, xTree[i].y - 5 + xCanvasYOffset);
                } else if(xTree[i].color == "#00FF00"){
                    xCtx.drawImage(greenRect10px, xTree[i].x - 5 + xCanvasXOffset, xTree[i].y - 5 + xCanvasYOffset);
                } else if(xTree[i].color == "#0000FF"){
                    xCtx.drawImage(blueRect10px, xTree[i].x - 5 + xCanvasXOffset, xTree[i].y - 5 + xCanvasYOffset);
                } else {
                    xCtx.rect(xTree[i].x - 5 + xCanvasXOffset, xTree[i].y - 5 + xCanvasYOffset, 10, 10);
                }
            }
            xCtx.stroke();
		}
		
		xCtx.restore();
	}
    
    
    function clickXCanvas(){
        var endTime = new Date().getTime();
        if(startTime < 0 || endTime - startTime < 200){
            selectedXNodeIndex = -1;
        }
        for(var i = 0; i < xTree.length; i++){
            if(Math.abs(xTree[i].x - xCanvasPos.x + xCanvasXOffset) < 6 && Math.abs(xTree[i].y - xCanvasPos.y + xCanvasYOffset) < 6){
                selectedXNodeIndex = i;
            }
        }
    }
    
    function drawYTree(){
		if(yTree.length <= 0){
			return;
		}
		var yCtx=yCanvas.getContext("2d");
		yCtx.save();
		 
		
		for(var i=0; i < yTree.length; i++){
            //draw the lines connecting the tree
            if(!yTree[i].isLeaf){
				yCtx.strokeStyle=yTree[i].color;
                yCtx.beginPath();
                yCtx.moveTo(yTree[i].x + yCanvasXOffset,yTree[i].y + yCanvasYOffset);
                yCtx.lineTo(yTree[yTree[i].leftChild].x + yCanvasXOffset,yTree[yTree[i].leftChild].y + yCanvasYOffset);
                yCtx.stroke();
                yCtx.beginPath();
                yCtx.moveTo(yTree[i].x + yCanvasXOffset,yTree[i].y + yCanvasYOffset);
                yCtx.lineTo(yTree[yTree[i].rightChild].x + yCanvasXOffset,yTree[yTree[i].rightChild].y + yCanvasYOffset);
                yCtx.stroke();
            }
        
            //draw the nodes
            yCtx.beginPath();
            if(yTree[i].isLeaf && yTreePoints[yTree[i].refPoint].i == highlightedPointIndex){
				yCtx.strokeStyle=yTree[i].color;
            } else if(yCanvasPos != null && Math.abs(yTree[i].x - yCanvasPos.x) < 6 && Math.abs(yTree[i].y - yCanvasPos.y) < 6){
				yCtx.strokeStyle=yTree[i].color;
            } else {
				yCtx.strokeStyle=yTree[i].color;
			}
			if(yTree[i].isLeaf){
                if(yTree[i].color == "#222222"){
                    yCtx.drawImage(whiteCirc10px, yTree[i].x - 5 + yCanvasXOffset, yTree[i].y - 5 + yCanvasYOffset);
                } else if(yTree[i].color == "#FF0000"){
                    yCtx.drawImage(redCirc10px, yTree[i].x - 5 + yCanvasXOffset, yTree[i].y - 5 + yCanvasYOffset);
                } else if(yTree[i].color == "#0000FF"){
                    yCtx.drawImage(blueCirc10px, yTree[i].x - 5 + yCanvasXOffset, yTree[i].y - 5 + yCanvasYOffset);
                } else {
                    yCtx.arc(yTree[i].x + yCanvasXOffset,yTree[i].y + yCanvasYOffset,5,0,2*Math.PI);
                }
            } else {
                if(yTree[i].color == "#222222"){
                    yCtx.drawImage(whiteRect10px, yTree[i].x - 5 + yCanvasXOffset, yTree[i].y - 5 + yCanvasYOffset);
                } else if(yTree[i].color == "#FF0000"){
                    yCtx.drawImage(redRect10px, yTree[i].x - 5 + yCanvasXOffset, yTree[i].y - 5 + yCanvasYOffset);
                } else if(yTree[i].color == "#00FF00"){
                    yCtx.drawImage(greenRect10px, yTree[i].x - 5 + yCanvasXOffset, yTree[i].y - 5 + yCanvasYOffset);
                } else if(yTree[i].color == "#0000FF"){
                    yCtx.drawImage(blueRect10px, yTree[i].x - 5 + yCanvasXOffset, yTree[i].y - 5 + yCanvasYOffset);
                } else {
                    yCtx.rect(yTree[i].x - 5 + yCanvasXOffset, yTree[i].y - 5 + yCanvasYOffset, 10, 10);
                }
            }
            yCtx.stroke();
		}
		
		yCtx.restore();
	}
    
    function constructRangeTrees(){
        constructXTree();
        
        yTreeList = new Array();
        for(var i = 0; i < xTree.length; i++){
            yTreeList.push(constructYTreeFromNode(xTree[i]));
        }
    }
    
	function constructXTree()
	{
        xCanvasXOffsetMin = 0;
        xCanvasXOffsetMax = 0;
        xCanvasYOffsetMin = 0;
        xCanvasYOffsetMax = 0;
		if(points.length == 0){
			xTree = new Array();
			return;
		}
		var selectedPoint;
		if(selectedPointIndex >= 0){
			selectedPoint = points[selectedPointIndex];
		}
		points.sort(function(a, b){return a.x - b.x});
        for(var i = 0; i < points.length; i++){
            points[i].i = i;
        }
		if(selectedPointIndex >= 0){
			for(var i = 0; i < points.length; i++){
				if(selectedPoint == points[i]){
					selectedPointIndex = i;
				}
			}
		}
		xTree = constructTreeSub(points, 0, points.length);
		xTree[0].isRoot = true;
		for(var i = 0; i < xTree.length; i++){
			if(!xTree[i].isLeaf)
			{
				xTree[i].rightChild = i + xTree[i].rightChild;
				xTree[i].leftChild = i + xTree[i].leftChild;
			}
			xTree[i].parent = i + xTree[i].parent;
		}
		
		width = xCanvasWidth;
        console.log(width);
		
		xTree[0].x = width / 2;
		xTree[0].y = 25;
		for(var i=0; i < xTree.length; i++){
			if(!xTree[i].isLeaf){
                //calculate positions of children
                var xChange = xTree[i].rightChild - xTree[i].leftChild;
                //left child
                xTree[xTree[i].leftChild].y = xTree[i].y + 20;
                xTree[xTree[i].leftChild].x = xTree[i].x - xChange * 10;
                
                //right child
                xTree[xTree[i].rightChild].y = xTree[i].y + 20;
                xTree[xTree[i].rightChild].x = xTree[i].x + xChange * 10;
            }
            xCanvasXOffsetMin = Math.min(xCanvas.width - xTree[i].x - 10, xCanvasXOffsetMin);
            xCanvasXOffsetMax = Math.max(-1 * xTree[i].x + 10, xCanvasXOffsetMax);
            xCanvasYOffsetMin = Math.min(xCanvas.height - xTree[i].y - 10, xCanvasYOffsetMin);
            xCanvasYOffsetMax = Math.max(-1 * xTree[i].y + 10, xCanvasYOffsetMax);
		}
        xCanvasXOffset = Math.max(Math.min(xCanvasXOffset, xCanvasXOffsetMax), xCanvasXOffsetMin);
        xCanvasYOffset = Math.max(Math.min(xCanvasYOffset, xCanvasYOffsetMax), xCanvasYOffsetMin);
        
        //calculate the range of each node
        for(var i = xTree.length - 1; i >= 0; i--){
            var minVal, maxVal;
            if(xTree[i].isLeaf){
                minVal = points[xTree[i].refPoint].x;
                maxVal = points[xTree[i].refPoint].x;
                xTree[i].min = minVal;
                xTree[i].max = maxVal;
            } else {
                minVal = xTree[i].min;
                maxVal = xTree[i].max;
            }
            if(i > 0){
                if(xTree[xTree[i].parent].min < 0){
                    xTree[xTree[i].parent].min = minVal;
                } else {
                    xTree[xTree[i].parent].min = Math.min(xTree[xTree[i].parent].min, minVal);
                }
                if(xTree[xTree[i].parent].max < 0){
                    xTree[xTree[i].parent].max = maxVal;
                } else {
                    xTree[xTree[i].parent].max = Math.max(xTree[xTree[i].parent].max, maxVal);
                }
            }
        }
	}
	
	function constructYTreeFromNode(xRootNode){
        var left = xRootNode;
        var right = xRootNode;
        while(!left.isLeaf){
            left = xTree[left.leftChild];
        }
        while(!right.isLeaf){
            right = xTree[right.rightChild];
        }
        var pointList = points.slice(left.refPoint, right.refPoint + 1);
        return {points:pointList, tree:constructYTree(pointList)};
	}
    
    function constructYTree(pointList){
        yCanvasXOffsetMin = 0;
        yCanvasXOffsetMax = 0;
        yCanvasYOffsetMin = 0;
        yCanvasYOffsetMax = 0;
        
        var tree;
        
		if(pointList.length == 0){
			tree = new Array();
			return tree;
		}
        
		var selectedPoint;
		if(selectedPointIndex >= 0){
			selectedPoint = points[selectedPointIndex];
		}
		pointList.sort(function(a, b){return a.y - b.y});
		if(selectedPointIndex >= 0){
			for(var i = 0; i < pointList.length; i++){
				if(selectedPoint == pointList[i]){
					selectedPointYTreeIndex = i;
				}
			}
		}
		tree = constructTreeSub(pointList, 0, pointList.length);
		tree[0].isRoot = true;
		for(var i = 0; i < tree.length; i++){
			if(!tree[i].isLeaf)
			{
				tree[i].rightChild = i + tree[i].rightChild;
				tree[i].leftChild = i + tree[i].leftChild;
			}
			tree[i].parent = i + tree[i].parent;
		}
		width = yCanvasWidth;
		tree[0].x = width / 2;
		tree[0].y = 25;
		for(var i=0; i < tree.length; i++){
			if(!tree[i].isLeaf){
                //calculate positions of children
                var xChange = tree[i].rightChild - tree[i].leftChild;
                //left child
                tree[tree[i].leftChild].y = tree[i].y + 20;
                tree[tree[i].leftChild].x = tree[i].x - xChange * 10;
                
                //right child
                tree[tree[i].rightChild].y = tree[i].y + 20;
                tree[tree[i].rightChild].x = tree[i].x + xChange * 10;
            }
		}
        
        //calculate the range of each node
        for(var i = tree.length - 1; i >= 0; i--){
            var minVal, maxVal;
            if(tree[i].isLeaf){
                minVal = pointList[tree[i].refPoint].y;
                maxVal = pointList[tree[i].refPoint].y;
                tree[i].min = minVal;
                tree[i].max = maxVal;
            } else {
                minVal = tree[i].min;
                maxVal = tree[i].max;
            }
            if(i > 0){
                if(tree[tree[i].parent].min < 0){
                    tree[tree[i].parent].min = minVal;
                } else {
                    tree[tree[i].parent].min = Math.min(tree[tree[i].parent].min, minVal);
                }
                if(tree[tree[i].parent].max < 0){
                    tree[tree[i].parent].max = maxVal;
                } else {
                    tree[tree[i].parent].max = Math.max(tree[tree[i].parent].max, maxVal);
                }
            }
        }
        
        return tree;
	}
	
	function constructTreeSub(sortedPoints, startIndex, endIndex)
	{
		var size=endIndex - startIndex;
		if(size == 1){
			return [{parent:-1, isLeaf:true, leftChild:-1, rightChild:-1, max:-1, min:-1, refPoint:startIndex, x:-1, y:-1, inRange:false}];
		}
		var split = startIndex + Math.ceil(size / 2);
		var rootNode={parent:-1, isLeaf:false, leftChild:1, rightChild:-1, max:-1, min:-1, refPoint:-1, x:-1, y:-1, inRange:false};
		var tree = new Array();
		tree.push(rootNode);
		var leftSubtree = constructTreeSub(sortedPoints, startIndex, split);
		leftSubtree[0].parent = -1;
		rootNode.rightChild = leftSubtree.length + 1;
		var rightSubtree = constructTreeSub(sortedPoints, split, endIndex);
		rightSubtree[0].parent = -1 * (rootNode.rightChild);
		tree.push.apply(tree, leftSubtree);
		tree.push.apply(tree, rightSubtree);
		return tree;
	}
});
$(document).ready(function(){
    var canvasPos, xCanvasPos, yCanvasPos;
    var points = new Array();
    var canvas, xCanvas, yCanvas;
    var startTime = -1;
    var selectedPointIndex = -1;
    var highlightedPointIndex = -1;
	var maxPoints = 200;
	var xTree = new Array();
	var yTree = new Array();
    var selectRect = null;
    var isMouseDown = false;

    //set up action listeners
    canvas = document.getElementById('rangeQueryCanvas');
    xCanvas = document.getElementById('xTreeCanvas');
    yCanvas = document.getElementById('yTreeCanvas');
	var clearButton = document.getElementById('rangeQueryClear');
	clearButton.onclick=function(){clearRangeQueryCanvas()};
    console.log("elements retrieved");
    canvas.addEventListener('mousedown', function(){ mouseDown()}, false);
    canvas.addEventListener('mouseup', function(){ mouseUp()}, false);
    canvas.addEventListener('mousemove', function(e) {
        canvasPos = getCanvasPos(e, 'rangeQueryCanvas');
		xCanvasPos = null;
		yCanvasPos = null;
        mouseMove();
        redraw();
    }, false);
    xCanvas.addEventListener('mousemove', function(e) {
        xCanvasPos = getCanvasPos(e, 'xTreeCanvas');
		canvasPos = null;
		yCanvasPos = null;
        mouseMove();
        redraw();
    }, false);
    yCanvas.addEventListener('mousemove', function(e) {
        yCanvasPos = getCanvasPos(e, 'yTreeCanvas');
		canvasPos = null;
		xCanvasPos = null;
        mouseMove();
        redraw();
    }, false);

    function getCanvasPos(e, canvasId){
		var c = document.getElementById(canvasId);
        var rect = c.getBoundingClientRect();
        return {x: e.clientX - rect.left, y: e.clientY - rect.top};
    }

    function mouseDown(){
        isMouseDown = true;
        startTime = new Date().getTime();
        selectedPointIndex = -1;
		if(canvasPos != null){
			for(i = 0; i < points.length; i++){
				if(Math.abs(points[i].x - canvasPos.x) <= 4 && Math.abs(points[i].y - canvasPos.y) <= 4){
					selectedPointIndex = i;
				}
			}
			if(selectedPointIndex < 0){
				selectRect = {x1:canvasPos.x, y1:canvasPos.y, x2:canvasPos.x, y2:canvasPos.y};
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
        endTime = new Date().getTime();
        if(selectedPointIndex < 0 && endTime - startTime < 200){
			if(points.length > maxPoints){
				return;
			}
            points[points.length] = canvasPos;
        } else {
            endTime = new Date().getTime();
            if(startTime > 0){
                if(endTime - startTime < 200){
                    points.splice(selectedPointIndex, 1);
                }
            }
        }
        //remove duplicate points
        var selectedPoint = selectedPointIndex;
        if(endTime - startTime < 200){
            if(selectedPoint < 0){
                //ignore newly added point
                selectedPoint = points.length - 1
            }
            for(i = points.length - 1; i >= 0; i--){
                if(i != selectedPoint && Math.abs(points[i].x - canvasPos.x) <= 8 && Math.abs(points[i].y - canvasPos.y) <= 8){
                        points.splice(i, 1);
                }
            }
        }
		constructXTree();
        redraw();
    }

    function mouseMove(){
        endTime = new Date().getTime();
        if(startTime > 0){
            movePoint();
        }
        if(canvasPos != null && selectedPointIndex < 0 && selectRect != null && isMouseDown && endTime - startTime > 200){
            selectRect.y2 = canvasPos.y;
            selectRect.x2 = canvasPos.x;
        }
    }

    function movePoint(){
        if(selectedPointIndex >= 0 && canvasPos != null){
            points[selectedPointIndex] = canvasPos;
        }
    }

    function redraw()
    {
		fixScale();
        clearCanvas();
        var ctx=canvas.getContext("2d");
        ctx.save();
        
		calcHoverColors();
		
        if(selectRect != null){
            var x = Math.min(selectRect.x1, selectRect.x2);
            var y = Math.min(selectRect.y1, selectRect.y2);
            var xDiff = Math.max(selectRect.x1, selectRect.x2) - x;
            var yDiff = Math.max(selectRect.y1, selectRect.y2) - y;
            ctx.globalAlpha = 0.2;
            ctx.fillStyle = "#0000FF";
            ctx.fillRect(x,y,xDiff,yDiff);
            ctx.globalAlpha = 1.0;
            ctx.strokeStyle = "#0000FF";
            ctx.rect(x,y,xDiff,yDiff);
            ctx.stroke();
            ctx.strokeStyle = "#000000";
        }
        
        for(i = 0; i < points.length; i++){
			ctx.fillStyle = points[i].color;
            if(highlightedPointIndex == i){
				ctx.fillRect(points[i].x - 2,points[i].y - 2,5,5);
            } else {
                ctx.fillRect(points[i].x - 1,points[i].y - 1,3,3);
            }
        }
		
		drawXTree();
		
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
        redraw();
    }

    function clearCanvas()
    {
        //var c=$(".panes div:not(:hidden) canvas")[0];
        var ctx=canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx=xCanvas.getContext("2d");
        ctx.clearRect(0, 0, xCanvas.width, xCanvas.height);
		ctx=yCanvas.getContext("2d");
        ctx.clearRect(0, 0, yCanvas.width, yCanvas.height);
    }
	
	function calcHoverColors(){
		highlightedPointIndex = -1;
        for(i = 0; i < points.length; i++){
            if(canvasPos != null && Math.abs(points[i].x - canvasPos.x) <= 4 && Math.abs(points[i].y - canvasPos.y) <= 4){
				points[i].color="#FF0000";
				highlightedPointIndex = i;
            } else {
				points[i].color="#000000";
            }
        }
		
		if(xTree.length > 0){
			xTree[0].color="#222222";
			for(i=0; i < xTree.length; i++){
				if(xTree[i].isLeaf && xTree[i].refPoint == highlightedPointIndex){
					xTree[i].color="#FF0000";
				} else if(xCanvasPos != null && Math.abs(xTree[i].x - xCanvasPos.x) < 6 && Math.abs(xTree[i].y - xCanvasPos.y) < 6){
					xTree[i].color = "#FF0000";
					if(!xTree[i].isLeaf){
						xTree[xTree[i].leftChild].color = xTree[i].color;
						xTree[xTree[i].rightChild].color = xTree[i].color;
					} else {
						points[xTree[i].refPoint].color = xTree[i].color;
					}
				} else {
					if(!xTree[i].isLeaf){
						xTree[xTree[i].leftChild].color = xTree[i].color;
						xTree[xTree[i].rightChild].color = xTree[i].color;
					} else {
						points[xTree[i].refPoint].color = xTree[i].color;
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
		 
		
		for(i=0; i < xTree.length; i++){
            xCtx.beginPath();
            if(xTree[i].isLeaf && xTree[i].refPoint == highlightedPointIndex){
				xCtx.strokeStyle=xTree[i].color;
            } else if(xCanvasPos != null && Math.abs(xTree[i].x - xCanvasPos.x) < 6 && Math.abs(xTree[i].y - xCanvasPos.y) < 6){
				xCtx.strokeStyle=xTree[i].color;
            } else {
				xCtx.strokeStyle=xTree[i].color;
			}
			if(xTree[i].isLeaf){
                xCtx.arc(xTree[i].x,xTree[i].y,5,0,2*Math.PI);
            } else {
                xCtx.rect(xTree[i].x - 5, xTree[i].y - 5, 10, 10);
            }
            xCtx.stroke();
		}
		
		xCtx.restore();
	}
    
	function constructXTree()
	{
		if(points.length == 0){
			xTree = new Array();
			return;
		}
		var selectedPoint;
		if(selectedPointIndex >= 0){
			selectedPoint = points[selectedPointIndex];
		}
		points.sort(function(a, b){return a.x - b.x});
		if(selectedPointIndex >= 0){
			for(i = 0; i < points.length; i++){
				if(selectedPoint == points[i]){
					selectedPointIndex = i;
				}
			}
		}
		xTree = constructTreeSub(points, 0, points.length);
		xTree[0].isRoot = true;
		for(i = 0; i < xTree.length; i++){
			if(!xTree[i].isLeaf)
			{
				xTree[i].rightChild = i + xTree[i].rightChild;
				xTree[i].leftChild = i + xTree[i].leftChild;
				xTree[i].parent = i + xTree[i].parent;
			}
		}
		
		width = xCanvas.width;
		
		xTree[0].x = width / 2;
		xTree[0].y = 25;
		for(i=0; i < xTree.length; i++){
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
		}
		
		
	}
	
	function constructTreeSub(sortedPoints, startIndex, endIndex)
	{
		var size=endIndex - startIndex;
		if(size == 1){
			return [{parent:-1, isLeaf:true, leftChild:-1, rightChild:-1, refPoint:startIndex, x:-1, y:-1}];
		}
		var split = startIndex + Math.ceil(size / 2);
		var rootNode={parent:-1, isLeaf:true, leftChild:1, rightChild:-1, refPoint:-1, x:-1, y:-1};
		var tree = new Array();
		tree.push(rootNode);
		rootNode.isLeaf = false;
		var leftSubtree = constructTreeSub(sortedPoints, startIndex, split);
		leftSubtree.parent = -1;
		rootNode.rightChild = leftSubtree.length + 1;
		var rightSubtree = constructTreeSub(sortedPoints, split, endIndex);
		rightSubtree.parent = -1 * (rootNode.rightChild);
		tree.push.apply(tree, leftSubtree);
		tree.push.apply(tree, rightSubtree);
		return tree;
	}
});
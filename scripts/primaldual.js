$(document).ready(function(){
    var pos;
    var posDual;
    var points = new Array();
    var pointsDual = new Array();
    var canvas;
    var dualcanvas;
    var startTime = -1;
    var startTimeDual = -1;
    var selectedPointIndex = -1;
    var selectedPointIndexDual = -1;
	var maxPoints = 200;

    //set up action listeners
    canvas = document.getElementById('primal');
    dualcanvas = document.getElementById('dual');
	var clearButton = document.getElementById('clearButton');
	clearButton.onclick=function(){clearPrimalDualCanvas()};
    canvas.addEventListener('mousedown', function(){ mouseDown()}, false);
    canvas.addEventListener('mouseup', function(){ mouseUp()}, false);
    canvas.addEventListener('mousemove', function(e) {
        pos = getCanvasPos(e);
        mouseMove();
        clearCanvas();
        redraw();
    }, false);
    dualcanvas.addEventListener('mouseup', function(){ mouseUpDual()}, false);
    function mouseUpDual(){
        addPointDual();
        startTimeDual = -1;
        selectedPointIndexDual = -1;
    }

    function addPointDual(){
        if(selectedPointIndexDual < 0){
            if(pointsDual.length < maxPoints){
                pointsDual[pointsDual.length] = posDual;
            }
        } else {
            endTimeDual = new Date().getTime();
            if(startTimeDual > 0){
                if(endTimeDual - startTimeDual < 250){
                    pointsDual.splice(selectedPointIndexDual, 1);
                }
            }
        }
        //remove duplicate points
        var selectedPointDual = selectedPointIndexDual;
        if(selectedPointDual < 0){
            //ignore newly added point
            selectedPointDual = pointsDual.length - 1
        }
        for(i = pointsDual.length - 1; i >= 0; i--){
            if(i != selectedPointDual && Math.abs(pointsDual[i].x - posDual.x) <= 8 && Math.abs(pointsDual[i].y - posDual.y) <= 8){
                    pointsDual.splice(i, 1);
            }
        }
        redraw();
    }

    dualcanvas.addEventListener('mousedown', function(){ mouseDownDual()}, false);
    function mouseDownDual(){
        startTimeDual = new Date().getTime();
        selectedPointIndexDual = -1;
        for(i = 0; i < pointsDual.length; i++){
            if(Math.abs(pointsDual[i].x - posDual.x) <= 4 && Math.abs(pointsDual[i].y - posDual.y) <= 4){
                selectedPointIndexDual = i;
            }
        }
    }
    dualcanvas.addEventListener('mousemove', function(e){
        posDual = getCanvasPosDual(e);
        mouseMoveDual();
        clearCanvas();
        redraw();
    }, false);

    redraw();
    
    function mouseMoveDual(){
        endTimeDual = new Date().getTime();
        if(startTimeDual > 0){
            movePointDual();
        }
    }

    function movePointDual(){
        if(selectedPointIndexDual >= 0){
            pointsDual[selectedPointIndexDual] = posDual;
        }
    }    
    
    function getCanvasPosDual(e){
        var rect = dualcanvas.getBoundingClientRect();
        return {x: e.clientX - rect.left, y: e.clientY - rect.top};
    }
    
    function getCanvasPos(e){
        var rect = canvas.getBoundingClientRect();
        return {x: e.clientX - rect.left, y: e.clientY - rect.top};
    }

    function mouseDown(){
        startTime = new Date().getTime();
        selectedPointIndex = -1;
        for(i = 0; i < points.length; i++){
            if(Math.abs(points[i].x - pos.x) <= 4 && Math.abs(points[i].y - pos.y) <= 4){
                selectedPointIndex = i;
            }
        }
    }

    function mouseUp(){
        addPoint();
        startTime = -1;
        selectedPointIndex = -1;
    }

    function addPoint()
    {
        if(selectedPointIndex < 0){
			if(points.length < maxPoints){
				points[points.length] = pos;
			}
        } else {
            endTime = new Date().getTime();
            if(startTime > 0){
                if(endTime - startTime < 250){
                    points.splice(selectedPointIndex, 1);
                }
            }
        }
        //remove duplicate points
        var selectedPoint = selectedPointIndex;
        if(selectedPoint < 0){
            //ignore newly added point
            selectedPoint = points.length - 1
        }
        for(i = points.length - 1; i >= 0; i--){
            if(i != selectedPoint && Math.abs(points[i].x - pos.x) <= 8 && Math.abs(points[i].y - pos.y) <= 8){
                    points.splice(i, 1);
            }
        }
        redraw();
    }

    function mouseMove(){
        endTime = new Date().getTime();
        if(startTime > 0){
            movePoint();
        }
    }

    function movePoint(){
        if(selectedPointIndex >= 0){
            points[selectedPointIndex] = pos;
        }
    }

    function redraw()
    {
		fixScale();
        var ctx=canvas.getContext("2d");
        var ctx2=dualcanvas.getContext("2d");
        ctx.save();
        ctx2.save();
        clearCanvas();
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.closePath();
        ctx.strokeStyle="#222222";
        ctx.stroke();
        ctx2.beginPath();
        ctx2.moveTo(0, dualcanvas.height / 2);
        ctx2.lineTo(dualcanvas.width, dualcanvas.height / 2);
        ctx2.moveTo(dualcanvas.width / 2, 0);
        ctx2.lineTo(dualcanvas.width / 2, dualcanvas.height);
        ctx2.closePath();
        ctx2.strokeStyle="#222222";
        ctx2.stroke();
        for(i = 0; i < points.length; i++){
            if(Math.abs(points[i].x - pos.x) <= 4 && Math.abs(points[i].y - pos.y) <= 4){
                if(selectedPointIndex < 0 || i == selectedPointIndex){
					ctx.fillStyle="#FF0000";
                    ctx2.strokeStyle="#FF0000";
                }
            } else {
				ctx.fillStyle="#000000";
                ctx2.strokeStyle="#000000";
            }
            ctx.fillRect(points[i].x - 2,points[i].y - 2,5,5);
            ctx2.beginPath();
            truex = (points[i].x - dualcanvas.width / 2) / (canvas.width / 10);
            truey = dualcanvas.height / 2 - points[i].y;
            pointone =  dualcanvas.height / 2 - (- dualcanvas.width / 2 * truex - truey);
            pointtwo = dualcanvas.height / 2 - (dualcanvas.width / 2 * truex - truey);
            ctx2.moveTo(0, pointone);
            ctx2.lineTo(dualcanvas.width, pointtwo);
            ctx2.lineWidth = 1;
            ctx2.closePath();
            ctx2.stroke();
        }
        for(i = 0; i < pointsDual.length; i++){
            if(Math.abs(pointsDual[i].x - posDual.x) <= 4 && Math.abs(pointsDual[i].y - posDual.y) <= 4){
                if(selectedPointIndex < 0 || i == selectedPointIndex){
                    ctx2.fillStyle="#FF0000";
                    ctx.strokeStyle="#FF0000";
                }
            } else {
                ctx2.fillStyle="#000000";
                ctx.strokeStyle="#000000";
            }
            ctx2.fillRect(pointsDual[i].x - 2,pointsDual[i].y - 2,5,5);
            ctx.beginPath();
            truex = (pointsDual[i].x - canvas.width / 2) / (dualcanvas.width / 10);
            truey = canvas.height / 2 - pointsDual[i].y;
            pointone =  canvas.height / 2 - (- canvas.width / 2 * truex - truey);
            pointtwo = canvas.height / 2 - (canvas.width / 2 * truex - truey);
            ctx.moveTo(0, pointone);
            ctx.lineTo(dualcanvas.width, pointtwo);
            ctx.lineWidth = 1;
            ctx.closePath();
            ctx.stroke();
        }
        ctx.restore();
        ctx2.restore();
    }

	function fixScale(){
		//fix the canvas scaling problems
		canvas.height = canvas.getContext("2d").canvas.clientHeight;
		canvas.width = canvas.getContext("2d").canvas.clientWidth;
        dualcanvas.height = dualcanvas.getContext("2d").canvas.clientHeight;
        dualcanvas.width = dualcanvas.getContext("2d").canvas.clientWidth;
	}
	
    function clearPrimalDualCanvas(){
        points = new Array();
        pointsDual = new Array();
        redraw();
    }

    function clearCanvas()
    {
        //var c=$(".panes div:not(:hidden) canvas")[0];
        //var ctx=canvas.getContext("2d");
        var ctx2=dualcanvas.getContext("2d");
        //ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx2.clearRect(0, 0, dualcanvas.width, dualcanvas.height);
    }
});
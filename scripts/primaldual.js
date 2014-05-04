$(document).ready(function(){
    var pos;
    var points = new Array();
    var dualpoints = new Array();
    var canvas;
    var startTime = -1;
    var selectedPointIndex = -1;
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
                    ctx.fillRect(points[i].x - 2,points[i].y - 2,5,5);
                    ctx2.beginPath();
                    truex = (dualcanvas.height / 2 - points[i].y)/(points[i].x - dualcanvas.width / 2);
                    truey = points[i].y;
                    pointone = truey;
                    pointtwo = dualcanvas.width * truex + truey;
                    console.log(pointone);
                    console.log(pointtwo);
                    ctx2.moveTo(dualcanvas.width, pointone);
                    ctx2.lineTo(0, pointtwo);
                    ctx2.lineWidth = 1;
                    ctx2.closePath();
                    ctx2.strokeStyle="#FF0000";
                    ctx2.stroke();
                }
            } else {
				ctx.fillStyle="#000000";
                ctx.fillRect(points[i].x - 1,points[i].y - 1,3,3);
                ctx2.fillStyle="#000000";
                ctx2.beginPath();
                truex = (dualcanvas.height / 2 - points[i].y)/(points[i].x - dualcanvas.width / 2);
                truey = points[i].y;
                pointone = truey;
                pointtwo = dualcanvas.width * truex + truey;
                ctx2.moveTo(dualcanvas.width, pointone);
                ctx2.lineTo(0, pointtwo);
                ctx2.lineWidth = 1;
                ctx2.closePath();
                ctx2.fill();
                ctx2.strokeStyle="#000000";
                ctx2.stroke();
            }
        }
        ctx.restore();
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
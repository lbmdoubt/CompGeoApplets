var pos;
var points = new Array();
var canvas;

$(document).ready(function(){
    //set up action listeners
    canvas = document.getElementById('voronoiCanvas');
    canvas.addEventListener('click', function(){ addPoint('voronoiCanvas')}, false);
    canvas.addEventListener('mousemove', function(e) {
        pos = getCanvasPos(e);
        redraw();
    }, false);
    //fix the canvas scaling problems
    canvas.height = canvas.getContext("2d").canvas.clientHeight;
    canvas.width = canvas.getContext("2d").canvas.clientWidth;
});

function getCanvasPos(e){
    var rect = canvas.getBoundingClientRect();
    return {x: e.clientX - rect.left, y: e.clientY - rect.top};
}

function addPoint()
{
    var index = -1;
    for(i = 0; i < points.length; i++){
        if(Math.abs(points[i].x - pos.x) <= 3 && Math.abs(points[i].y - pos.y) <= 3){
            index = i;
        }
    }
    if(index < 0){
        points[points.length] = pos;
    } else {
        points.splice(index, 1);
    }
    redraw();
}

function redraw()
{
    var ctx=canvas.getContext("2d");
    clearCanvas();
    ctx.save();
    ctx.fillStyle="#000000";
    for(i = 0; i < points.length; i++){
        if(Math.abs(points[i].x - pos.x) <= 3 && Math.abs(points[i].y - pos.y) <= 3){
            ctx.fillRect(points[i].x - 2,points[i].y - 2,5,5);
        } else {
            ctx.fillRect(points[i].x - 1,points[i].y - 1,3,3);
        }
    }
    ctx.restore();
}

function clearVoronoiCanvas(){
    points = new Array();
    redraw();
}

function clearCanvas()
{
    //var c=$(".panes div:not(:hidden) canvas")[0];
    var ctx=canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

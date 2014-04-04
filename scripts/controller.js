function clearCanvas(canvasId)
{
var c=document.getElementById(canvasId);
var ctx=c.getContext("2d");
ctx.save();
ctx.clearRect(0, 0, c.width, c.height);
ctx.restore();
}

function redraw(canvasId)
{
var c=document.getElementById(canvasId);
var ctx=c.getContext("2d");
ctx.save();
ctx.fillStyle="#FF0000";
ctx.fillRect(0,0,150,75);
ctx.restore();
}
$(function() {
    // setup ul.tabs to work as tabs for each div directly under div.panes
    $("ul.tabs").tabs("div.panes > div");
});

function clearCanvas()
{
    var c=$(".panes div:not(:hidden) canvas")[0];
    var ctx=c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
}

function drawPoint(canvasId)
{
    var c=document.getElementById(canvasId);
    var ctx=c.getContext("2d");
    ctx.save();
    ctx.fillStyle="#FF0000";
    ctx.fillRect(0,0,150,75);
    ctx.restore();
}
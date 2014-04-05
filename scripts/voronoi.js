$(document).ready(function(){
    var canvas = document.getElementById('voronoiCanvas');
    canvas.addEventListener('click', function(){ drawPoint('voronoiCanvas')}, false);
});


// Declarations
var currentX = -10, currentY = -10;

var canvas, context, scale, width, height, originX, originY;

var mouseDown = false, clickX, clickY;

var ctrl = false; //ctrl down

//var theFunction = function(x) { return 10*x/(1 + x*x) + 15*(x - 7)/(1 + (x - 7)*(x - 7)); }
var theFunction = function(x) { return 3.7*x*(1-x); };
  
var initialVal = 1;

var onLoad = function() {
    console.log("loading");
    
    canvas = document.getElementById("canvas");
    //if(!canvas.getContext()){ return; }
    context = canvas.getContext("2d");
    
    canvas.ondblclick = onDblClick;
    canvas.onmousemove = onMouseMove;
    canvas.onmousedown = function(e){ 
        e = e || window.event;
        mouseDown = true; 
        clickX = e.clientX - canvas.offsetLeft;
        clickY = e.clientY - canvas.offsetTop;
    };
    canvas.onmouseup = function() { mouseDown = false; };
    document.onkeydown = function(e) { ctrl = e.ctrlKey; };
    document.onkeyup = function() { ctrl = false; };
    
    if(canvas.addEventListener){
       canvas.addEventListener("mousewheel", onMouseWheel, false);
       canvas.addEventListener("DOMMouseScroll", onMouseWheel, false);
    }
    console.log(canvas.onkeypress);
    
    
    scale = 2/canvas.height;       
    width = canvas.width, height = canvas.height;
    originX = width/2, originY = height/2;
    draw(); 
}

var differentiate = function(f, h) {
    return function(x){
        return (f(x + h) - f(x - h)) / (2 * h);
    }
}

var iterate = function(f) {
    return function(x) {
        return f(f(x));
    }
}

var powOf10 = function(x) {
    if(x < 1) {
        return -1 + powOf10(x*10);
    } else if(x >= 10) {
        return 1 + powOf10(x / 10);
    } else {
        return 0;
    }
}

var axes = function() {
    // The main axes;            
    context.strokeStyle = "888888";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(0, originY);
    context.lineTo(width, originY);
    context.stroke();
    
    context.beginPath();
    context.moveTo(originX, 0);
    context.lineTo(originX, height);
    context.stroke();
    
    //The notches
    var increment = Math.pow(10, powOf10(height*scale) - 1);
    //increment /= increment % 10;
    
    if (increment == 0) { increment = 0.1; }
    
    var temp = increment/scale;
    
    //console.log(increment/scale);
    while(temp < height/15){
        if(temp < height / 40){
            increment *= 5;
        } else if(temp < height / 30){
            increment *= 5;
        } else if(temp < height / 20) {
            increment *= 2.5;
        } else {
            increment *= 2;
        }
        temp = increment/scale;
    }
    
    context.font = "bold 12px sans-serif";
    context.textAlign = "center";
    context.fillStyle = "#444444";
    
    var limit = (width - originX) * scale;
    for(var i = increment; i <= limit; i += increment) {
        notchX(i);
    }
    limit = (-width - originX) * scale;
    for(var i = -increment; i >= limit; i -= increment) {
        notchX(i);
    }
    limit = (height + originY) * scale;
    
    if(originY < 0) {
        console.log(increment);
    }
    
    for(var i = increment; i <= limit; i += increment) {
        notchY(i);
    }
    limit = -(height - originY) * scale;
    for(var i = -increment; i >= limit; i -= increment) {
        notchY(i);
    }
    
}

// Formats the numbers on the axes;
var display = function(x) {
    /*if(x >= 1){
        if(x < 10){
            return x.toPrecision(3);
        } else if(x > 1000000){
            return x.toPrecision(2);
        } else {
            return x;
        }
    } else if(*/
    return scale <= 0.004 ? x.toPrecision(3) : x;
}

var notchX = function(x) {
    context.fillText(display(x), originX + x/scale, originY - 10);
    context.beginPath();
    context.moveTo(originX + x/scale, originY - 5);
    context.lineTo(originX + x/scale, originY + 5);
    context.stroke();
}

var notchY = function(x) {
    context.fillText(display(x), originX + 20, originY - x/scale + 4);
    context.beginPath();
    context.moveTo(originX + 5, originY - x/scale);
    context.lineTo(originX - 5, originY - x/scale);
    context.stroke();
}

var plot = function(f, color){
    color = color || "000000"
    context.strokeStyle = color;
    context.lineWidth = 2.5;
    context.beginPath();
    var y0 = originY - f(-originX*scale)/scale;
    context.moveTo(0, y0);
    
    for(var i = 0; i < width; i++){
        var y1 = originY - f((i - originX)*scale)/scale
        if(Math.abs(y0 - y1) > height){
            context.stroke();
            context.beginPath();
            context.moveTo(i, y1);
        } else {
            context.lineTo(i, y1);
        }
        y0 = y1;
    }
    context.stroke();

}

var cobweb = function(f, x0, iterations){
    context.strokeStyle = "#000000";
    context.lineWidth = 1;
    x0 /= scale;
    context.beginPath();
    context.moveTo(originX + x0, originY);
    //context.lineTo(originX + x0 + 10, originY - f((x0)*scale)/scale);
    
    for(var i = 0; i < iterations; i++){
        if(Math.abs(x0) > width){
            //console.log(x0);
            break;
        }
        //console.log(x0);
        var x1 = f((x0)*scale)/scale;
        
        if(Math.abs(x0 - x1) < 1){
            context.lineTo(originX + x0, originY - x1);
            break;
        }
        context.lineTo(originX + x0, originY - x1);
        context.lineTo(originX + x1, originY - x1);
        x0 = x1;
    }
    
    context.stroke();

}

function draw() {
    context.clearRect(0, 0, width, height);
    context.fillStyle = "0F4D92"
    context.beginPath();
    context.arc(currentX, currentY, 4, 0, 2*Math.PI);
    context.fill();
    
    axes();
    var f2 = iterate(theFunction);
    plot((function(x){ return x; }), "#B22222");
    plot(theFunction, "0F4D92");
    var df = differentiate(theFunction, 0.001);
    plot(df, "#006600");
    //plot(f2, "#FF7F00");
    cobweb(theFunction, initialVal, 1000);
    
    // Draws
    context.fillStyle = "000000";
    context.beginPath();
    context.arc(originX + initialVal/scale, originY, 4, 0, 2*Math.PI);
    context.fill();
}

var onMouseMove = function(e) {
    e = e || window.event;
    
    var posX = e.clientX - canvas.offsetLeft, 
        posY = e.clientY - canvas.offsetTop;
    
    currentX = posX;
    currentY = originY - theFunction((posX - originX)*scale)/scale;
       
    if(mouseDown){
    
        if(e.button === 2) {
        
            initialVal = (posX - originX)*scale;
        } else {
    
        originX += (posX - clickX)*0.5;
        originY += (posY - clickY)*0.5;
        clickX = posX;
        clickY = posY;
        
        }
    }
    
    draw();
}

var onMouseWheel = function(e) {
    e = e || window.event;
    
    var posX = e.clientX - canvas.offsetLeft, 
        posY = e.clientY - canvas.offsetTop,
        zoom = e.wheelDelta < 0 ? 1.1 : 1/1.1;
    
    originX = posX - (posX - originX) / zoom;// * width/height;
    originY = posY - (posY - originY) / zoom;
    
    scale *= zoom;
    
    context.clearRect(0, 0, width, height);
    draw();
}

var onDblClick = function(e) {
    e = e || window.event;
    
    var posX = e.clientX - canvas.offsetLeft, 
        posY = e.clientY - canvas.offsetTop,
        zoom = ctrl === false ? 1/2 : 2;
    
    originX = posX - (posX - originX) / zoom;// * width/height;
    originY = posY - (posY - originY) / zoom;
    console.log("ctrl = " + ctrl);
    
    scale *= zoom;
    
    context.clearRect(0, 0, width, height);
    draw();
}
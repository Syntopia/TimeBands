/**
 * @author Mikael Hvidtfeldt Christensen / twitter: @SyntopiaDK, web: hvidtfeldts.net
 */

 
var timebands = {
    REVISION: '0.0.1'
};

var Viewport = function(svg) {
	this.zoom = 1.0;
	this.centerX = 0.0;
	this.svg = svg;
	this.scalableElements = [];
	var self = this;
	this.svg.addEventListener('mousewheel', function(e) { self.mouseWheel(e); }, false);
	this.svg.addEventListener('mousedown', function(e) { self.mouseDown(e); }, false);
	this.svg.addEventListener('mouseup', function(e) { self.mouseUp(e); }, false);
	//this.svg.addEventListener('mouseout', function(e) { self.mouseUp(e); }, false); // check if dragging outside window.
	this.svg.addEventListener('mousemove', function(e) { self.mouseMove(e); }, false); 
	
}

Viewport.prototype.mouseUp = function (e) {
	this.dragging = false;
}
Viewport.prototype.mouseMove = function (e) {
	if (this.dragging) {
		var rect = svg.getBoundingClientRect();
		var mX = e.clientX - rect.left;
		var mY = e.clientY - rect.top;
		this.centerX = this.centerXDown+2.0*(mX-this.mouseDownX)/this.zoom;
		this.redraw();
	
	}
}
Viewport.prototype.mouseDown = function (e) {
	var rect = svg.getBoundingClientRect();
	this.mouseDownX = e.clientX - rect.left;
	this.mouseDownY = e.clientY - rect.top;
	this.centerXDown = this.centerX;
	this.dragging = true;
	this.dirty = true;
}

Viewport.prototype.redraw = function() {
var top = svg.getElementById('svgtop');
	var transform = "matrix(sx 0 0 1 tx 0)".replace("sx", this.zoom).replace("tx", this.centerX*this.zoom);
	top.setAttribute("transform", transform);
	console.log(transform);
	for (var i = 0; i < this.scalableElements.length; i++) {
		var rectNode = this.scalableElements[i].childNodes[0];
		var textNode = this.scalableElements[i].childNodes[1];
		textNode.setAttribute("transform", "scale(" + (1/this.zoom) + ",1)");
		var width = textNode.getBBox().width+5;
		var rectWidth = rectNode.getBBox().width*this.zoom;
		var ratio = rectWidth/width;
		var opacity = 1;
		if (ratio<0.5) {
			rectNode.setAttribute("visibility","hidden");
		} else {
			rectNode.setAttribute("visibility","visibility");
		}
		if (ratio<1) {
			opacity = 0;
		} else {
			if (ratio<1.5) {
				opacity = mix(0,1,(ratio-1)*2);
			}
		} 
		textNode.setAttribute("x", (rectWidth/2-width/2));
	
		if (textNode.textContent.startsWith("Jan")) {
			console.log(textNode.textContent + " " + width + " " + rectWidth);
		}
		textNode.setAttribute("opacity",opacity);
		
	}
};

Viewport.prototype.mouseWheel = function (e) {
	var factor = 1.;
	if (e.wheelDelta <0) {
		factor = 1.1;
	} else {
		factor = 1/1.1;
	}
	e.preventDefault();


	var rect = svg.getBoundingClientRect();
    var mX = e.clientX - rect.left;
	var w = svg.getBoundingClientRect().width;	
	var dx = mX;
	console.log(dx + " " + w + " " + mX);
	//this.centerX += dx*this.zoom*(1-factor);
	this.zoom *= factor;
	//this.centerX = 0;
	this.redraw();
	return false;
}




var TextBoxStyle = function() {
	this.rx = 0;
	this.ry = 0;
	this.strokeWidth = 0.1;
	this.textStroke = "#000";
	this.textStrokeWidth = 0;
	this.opacity = 1;
	this.bgfill = "white";
	this.textFill = "#000";
	this.fontSize = 18;
};

var Band = function(timeBand, height, name) {
	if (height !== undefined) {
		this.height = height;
	} else {
		this.height = timeBand.defaultBandHeight;
	}
	this.yOffset = 0;
	this.timeBand = timeBand;
	timeBand.addBand(this);
	if (name !== undefined) {
		var s = new TextBoxStyle();
		s.opacity = 0.8;
		s.strokeWidth = 0;
		s.bgfill = "#eef";
		s.fontSize = 30;
		s.textStroke = "#fff";
		s.textStrokeWidth = 0;
		s.rx = 10;
		s.ry = 10;
		var g = this.add(0,8, name, s, undefined, this.timeBand.svg);
		var rectNode = g.childNodes[0];
		var textNode = g.childNodes[1];
		var width = textNode.getBBox().width+5;
		rectNode.setAttribute("width", width+5);
	
		
	}
};

Band.prototype = {
	constructor: Band,

	init: function(canvasID) {
		this.addListeners(canvasID);
	},
	
	add: function(fromDay, toDay, text, style, hint, target) {
		if (target === undefined) {
			target = this.timeBand.top;
		}	
		var groupElement = timebands.addBox(target,
							this.timeBand.cellWidth * fromDay,this.yOffset,
							this.timeBand.cellWidth * (toDay-fromDay),this.height,
							text,style,hint);
		if (target === this.timeBand.top) {
			this.timeBand.scalableElements.push(groupElement);
		}
		return groupElement;
	}
}

var TimeBand = function(svg, startYear, startMonth) {
	this.startYear = startYear;
	this.scalableElements = [];
	this.startMonth = startMonth;
	this.defaultBandHeight = 20;
	this.svg = svg;
	this.cellWidth = 20;
	this.top = svg.getElementById('svgtop');
	this.nextYOffset = 0;
	this.bands = [];
};

TimeBand.prototype = {
	constructor: TimeBand,

	addBand: function(band) {
		this.bands.push(band);
		band.yOffset = this.nextYOffset;
		this.nextYOffset += band.height; 
		console.log("Added band "+ band + ". Current offset: " + this.nextYOffset);
	}
};
	

/**
* Taken from: http://stackoverflow.com/questions/3224834/get-difference-between-2-dates-in-javascript
* (post by Shyam Habarakada)
*/
timebands.dateDiffInDays = function(a, b) {
  // Discard the time and time-zone information.
  var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24)); // ms per day
}
	
/**
 * This functions was taken from RobG answer here:
 * http://stackoverflow.com/questions/6117814/get-week-of-year-in-javascript-like-in-php
 */
timebands.getWeekNumber = function(){
    var d = new Date(+this);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};
	
timebands.addBox = function(svg, x,y,w,h,text, style, hint) {
	var g = document.createElementNS("http://www.w3.org/2000/svg", 'g'); 
	g.setAttribute("transform", "translate(" + x + "," + y + ")");
	
	var e = document.createElementNS("http://www.w3.org/2000/svg", 'rect'); 
	e.style.fill = style.bgfill; 
	e.style.stroke = "black";
	e.setAttribute("x", 0);
	e.setAttribute("y", 0);
	e.setAttribute("width", w);
	e.setAttribute("height", h);
	e.setAttribute("rx", style.rx);
	e.setAttribute("ry", style.ry);
	e.style.strokeWidth = style.strokeWidth;
	e.style.opacity = style.opacity; 

	var t = document.createElementNS("http://www.w3.org/2000/svg", 'text'); 
	//t.style.fill = style.textFill; 
	t.setAttribute("x", 5);
	t.setAttribute("transform", "scale(1,1)");
	t.style.fontfamily = "Helvetica";
	//t.style.stroke = style.textStroke;
//	t.style.strokeWidth = style.textStrokeWidth;
	
	t.setAttribute("y", h-3);
	t.setAttribute("font-size", style.fontSize);
	t.textContent = text;
	g.appendChild(e);
	g.appendChild(t);
	
	if (hint !== undefined) {
		var ti = document.createElementNS("http://www.w3.org/2000/svg", 'title'); 
		ti.textContent = hint;
		g.appendChild(ti);
	}
		
	svg.appendChild(g);
	return g;
};

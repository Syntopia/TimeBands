/**
 * @author Mikael Hvidtfeldt Christensen / twitter: @SyntopiaDK, web: hvidtfeldts.net
 */

 
var timebands = {
    REVISION: '0.0.0'
};

var TextBoxStyle = function() {
	this.rx = 0;
	this.ry = 0;
	this.strokeWidth = 1;
	this.opacity = 1;
	this.bgfill = "none";
	this.textFill = "black";
	this.fontSize = 18;
};

var Band = function(timeBand, height) {
	if (height !== undefined) {
		this.height = height;
	} else {
		this.height = timeBand.defaultBandHeight;
	}
	this.yOffset = 0;
	this.timeBand = timeBand;
	timeBand.addBand(this);
};

Band.prototype = {
	constructor: Band,

	init: function(canvasID) {
		this.addListeners(canvasID);
	},
	
	add: function(fromDay, toDay, text, style, hint) {
		var textElement = timebands.addBox(this.timeBand.top,
							this.timeBand.cellWidth * fromDay,this.yOffset,
							this.timeBand.cellWidth * (toDay-fromDay),this.height,
							text,style,hint);
		this.timeBand.scalableElements.push(textElement);
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
	t.setAttribute("x", 5);
	t.setAttribute("transform", "scale(1,1)");
	t.style.fontfamily = "Helvetica";
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

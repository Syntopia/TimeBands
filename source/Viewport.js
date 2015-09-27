var Viewport = function(svg) {
	this.zoom = 1.0;
	this.centerX = 0.0;
	this.svg = svg;
	this.scalableElements = [];
	var self = this;
	this.svg.addEventListener('wheel', function(e) {
		self.mouseWheel(e);
	}, false);
	this.svg.addEventListener('mousedown', function(e) {
		self.mouseDown(e);
	}, false);
	this.svg.addEventListener('mouseup', function(e) {
		self.mouseUp(e);
	}, false);
	this.svg.addEventListener('mousemove', function(e) {
		self.mouseMove(e);
	}, false);
}

Viewport.prototype.mouseUp = function(e) {
	this.dragging = false;
}

Viewport.prototype.mouseMove = function(e) {
	if (this.dragging) {
		var rect = svg.getBoundingClientRect();
		var mX = e.clientX - rect.left;
		var mY = e.clientY - rect.top;
		this.centerX = this.centerXDown + 2.0 * (mX - this.mouseDownX) / this.zoom;
		this.redraw(false, e);
	}
}

Viewport.prototype.mouseDown = function(e) {
	var rect = svg.getBoundingClientRect();
	this.mouseDownX = e.clientX - rect.left;
	this.mouseDownY = e.clientY - rect.top;
	this.centerXDown = this.centerX;
	this.dragging = true;
	this.dirty = true;
}

var ScaleInfo = function(textWidth, rectWidth, textHeight, rectHeight, uniformScale) {
	this.textWidth = textWidth;
	this.rectWidth = rectWidth;
	this.textHeight = textHeight;
	this.rectHeight = rectHeight;
	this.uniformScale = uniformScale;
	this.getRatio = function() {
		return rectWidth / textWidth;
	}
	this.getHeightRatio = function() {
		return rectHeight / textHeight;
	}
}

Viewport.prototype.redraw = function(rescale, e) {
	var top = svg.getElementById('svgtop');
	var transform = "matrix(sx 0 0 1 tx 0)".replace("sx", this.zoom).replace("tx", this.centerX * this.zoom);
	top.setAttribute("transform", transform);

	var rect = svg.getBoundingClientRect();
	var mX = e.clientX - rect.left;
	var w = svg.getBoundingClientRect().width;
	var dx = mX * this.zoom;
	var from = -this.centerX;
	//console.log("From: " + from + " to: " + (from + w / this.zoom) + " me:" + (from + (mX / this.zoom)));

	if (!rescale) return;

	if (this.scaleMap === undefined) {
		this.scaleMap = new Map();
		for (var i = 0; i < this.scalableElements.length; i++) {
			var rectNode = this.scalableElements[i].childNodes[0];
			var textNode = this.scalableElements[i].childNodes[1];
			var width = textNode.getBBox().width + 5;
			var rectWidth = rectNode.getBBox().width;
			var height = textNode.getBBox().height-10 ;
			var rectHeight = rectNode.getBBox().height;
			if (this.scalableElements[i].uniformScale) {
				console.log(width);
				width = this.scalableElements[i].uniformScale;
			}
			this.scaleMap.set(this.scalableElements[i], new ScaleInfo(width, rectWidth,height,rectHeight, this.scalableElements[i].uniformScale));
		}
	}

	for (var i = 0; i < this.scalableElements.length; i++) {
		var rectNode = this.scalableElements[i].childNodes[0];
		var textNode = this.scalableElements[i].childNodes[1];
		textNode.setAttribute("transform", "scale(" + (1 / this.zoom) + ",1)");
		var scaleInfo = this.scaleMap.get(this.scalableElements[i]);
		var ratio = scaleInfo.getRatio() * this.zoom;
		
		var opacity = 1;
		if (scaleInfo.rectWidth * this.zoom < 5) {
			rectNode.setAttribute("visibility", "hidden");
		} else {
			rectNode.setAttribute("visibility", "visible");
		}
		if (ratio < 0.1) {
			textNode.setAttribute("visibility", "hidden");
		} else {
			textNode.setAttribute("visibility", "visible");
			if (ratio < 1) {
				if (scaleInfo.uniformScale) {
					textNode.setAttribute("visibility", "hidden");
				rectNode.setAttribute("visibility", "hidden");
			} else {
					textNode.setAttribute("transform", "scale(" + (ratio / this.zoom)+ "," + ratio +  ")");
					textNode.setAttribute("x", 0);
					textNode.setAttribute("y", ((1.0/ratio)*2.0*scaleInfo.rectHeight/ 2 - scaleInfo.textHeight / 2));
				}
			} else {
				textNode.setAttribute("x", (scaleInfo.rectWidth * this.zoom / 2 - scaleInfo.textWidth / 2));
				textNode.setAttribute("y", (2.0*scaleInfo.rectHeight/ 2 - scaleInfo.textHeight / 2));
			}
		}

		textNode.setAttribute("opacity", opacity);
	}
};

Viewport.prototype.mouseWheel = function(e) {
	var factor = 1.;
	if (e.deltaY > 0) {
		factor = 1.2;
	} else {
		factor = 1 / 1.2;
	}
	e.preventDefault();

	var rect = svg.getBoundingClientRect();
	var mX = e.clientX - rect.left;
	var w = svg.getBoundingClientRect().width;
	var dx = mX / this.zoom;
	var from = -this.centerX;

	this.zoom *= factor;

	var dx2 = mX / this.zoom;
	this.centerX += (dx2 - dx);
	from = -this.centerX;

	this.redraw(true, e);
	return false;
}

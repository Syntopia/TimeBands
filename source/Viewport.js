var Viewport = function(svg) {
	this.zoom = 1.0;
	this.centerX = 0.0;
	this.svg = svg;
	this.scalableElements = [];
	var self = this;
	this.svg.addEventListener('mousewheel', function(e) {
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

var ScaleInfo = function(textWidth, rectWidth) {
	this.textWidth = textWidth;
	this.rectWidth = rectWidth;
	this.getRatio = function() {
		return rectWidth / textWidth;
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
	console.log("From: " + from + " to: " + (from + w / this.zoom) + " me:" + (from + (mX / this.zoom)));


	if (!rescale) return;

	if (this.scaleMap === undefined) {
		this.scaleMap = new Map();
		for (var i = 0; i < this.scalableElements.length; i++) {
			var rectNode = this.scalableElements[i].childNodes[0];
			var textNode = this.scalableElements[i].childNodes[1];
			var width = textNode.getBBox().width + 5;
			var rectWidth = rectNode.getBBox().width;
			this.scaleMap.set(this.scalableElements[i], new ScaleInfo(width, rectWidth));
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
			rectNode.setAttribute("visibility", "visibility");
		}
		if (ratio < 0.3) {
			textNode.setAttribute("visibility", "hidden");
		} else {
			textNode.setAttribute("visibility", "visibility");
			if (ratio < 1) {
				textNode.setAttribute("transform", "scale(" + (ratio / this.zoom) + "," + 1 + ")");
				textNode.setAttribute("x", 0);
				//textNode.setAttribute("y", textNode.getBBox().height / ratio);

			} else {
				textNode.setAttribute("x", (scaleInfo.rectWidth * this.zoom / 2 - scaleInfo.textWidth / 2));
			}
		}

		textNode.setAttribute("opacity", opacity);
	}
};

Viewport.prototype.mouseWheel = function(e) {
	var factor = 1.;
	if (e.wheelDelta > 0) {
		factor = 1.4;
	} else {
		factor = 1 / 1.4;
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

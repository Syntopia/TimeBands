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
		s.strokeWidth = 0.5;
		s.bgfill = "#fff";
		s.fontSize = 20;
		s.textStroke = "#fff";
		s.textStrokeWidth = 0;
		s.textFill = "#000";
		s.rx = 5;
		s.ry = 5;
		var bottom = this.timeBand.svg.getElementById('svgbottom');
		var g = this.add(0, 8, name, s, undefined, bottom);
		var rectNode = g.childNodes[0];
		var textNode = g.childNodes[1];
		var width = textNode.getBBox().width + 5;
		rectNode.setAttribute("width", width + 5);
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
		var y = this.yOffset;
		var h = this.height;
		if (style.section) {
			y -= this.yOffset;
			h += this.yOffset;
		}
		var groupElement = timebands.addBox(target,
			this.timeBand.cellWidth * fromDay, y,
			this.timeBand.cellWidth * (toDay - fromDay), h,
			text, style, hint);
		if (target === this.timeBand.top) {
			this.timeBand.scalableElements.push(groupElement);
		}
		if (!style.section) {
			var self = this;
			groupElement.addEventListener('click', function(e) {
				self.boxClicked(groupElement);
			});
			groupElement.addEventListener('mouseover', function(e) {
				self.boxMouseover(groupElement);
			});
			groupElement.addEventListener('mouseout', function(e) {
				self.boxMouseout(groupElement);
			});
		}
		return groupElement;
	},

	boxClicked: function(e) {},

	boxMouseover: function(e) {
		var rectNode = e.childNodes[0];
		var textNode = e.childNodes[1];
		rectNode.style.stroke = "red";
		rectNode.style.strokeWidth = "2";

	},

	boxMouseout: function(e) {
		var rectNode = e.childNodes[0];
		var textNode = e.childNodes[1];
		rectNode.style.stroke = rectNode.style.originalStroke;
		rectNode.style.stroke = "black";
		rectNode.style.strokeWidth = "0.2";
	}

}

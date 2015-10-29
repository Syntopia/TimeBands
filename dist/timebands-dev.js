var TextBoxStyle = function() {
    this.rx = 0;
    this.ry = 0;
    this.strokeWidth = 0.2;
    this.textStroke = "#000";
    this.textStrokeWidth = 0;
    this.opacity = 1;
    this.bgfill = "white";
    this.textFill = "#000";
    this.fontSize = 18;
    this.section = false;
};

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

var Band = function(timeBand, height, name) {
	if (height !== undefined) {
		this.height = height;
	} else {
		this.height = timeBand.defaultBandHeight;
	}
	this.yOffset = 0;
	this.infos = {};
	this.timeBand = timeBand;
	timeBand.addBand(this);
	if (name !== undefined) {
		var s = new TextBoxStyle();
		s.opacity = 1.0;
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
			y -= this.yOffset-this.timeBand.headerHeight;
			h += this.yOffset-this.timeBand.headerHeight;
		}
		var groupElement = timebands.addBox(target,
			this.timeBand.cellWidth * fromDay, y,
			this.timeBand.cellWidth * (toDay - fromDay), h,
			text, style, hint);
			
		this.infos[groupElement] = " Text: " + text;
			
		if (target === this.timeBand.top) {
			if (this.uniformScale) {
				groupElement.uniformScale = this.uniformScale;
			}
			this.timeBand.scalableElements.push(groupElement);
		}
		var self = this;
		groupElement.addEventListener('click', function(e) {
			self.boxClicked(groupElement);
		});
				
		if (!style.section) {
			groupElement.addEventListener('mouseover', function(e) {
				self.boxMouseover(groupElement);
			});
			groupElement.addEventListener('mouseout', function(e) {
				self.boxMouseout(groupElement);
			});
		}
		return groupElement;
	},

	boxClicked: function(e) {
		console.log("Clicked: ", this.infos[e]);
	},

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

var TimeBand = function(svg, startYear, startMonth, numberOfDays) {

	this.view = new Viewport(svg);
	var ne = document.createElementNS("http://www.w3.org/2000/svg", 'defs'); 
	var l1=timebands.createLinearGradient("grad1", "0%", "30%", "0%", "100%");
	l1.appendChild(timebands.createStop("0%",  "stop-color:rgb(240,224,195);stop-opacity:0.5")); 
	l1.appendChild(timebands.createStop("100%","stop-color:rgb(240,224,195);stop-opacity:0.5"));
	var l2=timebands.createLinearGradient("grad3", "0%", "30%", "0%", "100%");
	l2.appendChild(timebands.createStop("0%","stop-color:rgb(255,255,255);stop-opacity:0.5"));
	l2.appendChild(timebands.createStop("100%","stop-color:rgb(225,225,225);stop-opacity:0.5"));
	var l3=timebands.createLinearGradient("grad2", "0%", "30%", "0%", "100%");
	l3.appendChild(timebands.createStop("0%","stop-color:rgb(192,208,163);stop-opacity:1"));
	l3.appendChild(timebands.createStop("100%","stop-color:rgb(192,208,163);stop-opacity:1"));
	ne.appendChild(l1);
	ne.appendChild(l2);
	ne.appendChild(l3);
	svg.appendChild(ne);
	
	var ne2 = document.createElementNS("http://www.w3.org/2000/svg", 'g'); 
	ne2.setAttribute("id", "svgtop");
	var ne3 = document.createElementNS("http://www.w3.org/2000/svg", 'g'); 
	ne3.setAttribute("id", "svgbottom");
	svg.appendChild(ne2);
	svg.appendChild(ne3);
	

	this.startYear = startYear;
	this.scalableElements = [];
	this.numberOfDays = numberOfDays;
	this.startMonth = startMonth;
	this.defaultBandHeight = 20;
	this.svg = svg;
	this.cellWidth = 20;
	this.top = svg.getElementById('svgtop');
	this.nextYOffset = 0;
	this.bands = [];
};

TimeBand.monthNames = ["Jan", "Feb", "Mar",
				 "Apr", "May", "Jun", "Jul",
				"Aug", "Sep", "Oct",
				"Nov", "Dec"];
TimeBand.monthColors2 = ["#FC9", "#FEC", "#FC9",
				"#CDA", "#EED", "#CDA",
				"#FC9", "#FEC", "#FC9",
				"#CDA", "#EED", "#CDA"];
TimeBand.monthColors = ["#EEE", "#FFF", "#EEE",
				"#FFF", "#EEE", "#FFF",
				"#EEE", "#FFF", "#EEE",
				"#FFF", "#EEE", "#FFF"];

TimeBand.prototype = {
	constructor: TimeBand,

	addBand: function(band) {
		this.bands.push(band);
		band.yOffset = this.nextYOffset;
		this.nextYOffset += band.height;
		console.log("Added band " + band + ". Current offset: " + this.nextYOffset);
	},
	
	addHeader: function() {
		var style = new TextBoxStyle();
		var tb = this;
		var months = [];
		var weeks = [];
		var weeksNumbers = [];
		var lastMonth = -1;
		var lastWeek = -1;
		
		// Create the days 
		var days = new Band(tb,13);
		days.uniformScale = 16;
		style.fontSize=10;
		for (var x = 0; x < this.numberOfDays; x++) {
			var d = new Date(tb.startYear,tb.startMonth,x+1) ;
			if (d.getMonth()!=lastMonth) {
				months.push(x);
				lastMonth = d.getMonth();
			}
			var week = d.getWeekNumber();
			if (week!=lastWeek) {
				weeks.push(x);
				weeksNumbers.push(week);
				lastWeek = week;
			}
			days.add(x,x+1, d.getDate(), style, d+"");
		}
		months.push(this.numberOfDays);

		style.fontSize=18;

		// Create the weeks
		var weeksBand = new Band(tb);
		weeksBand.uniformScale = 25;
		for (var i = 0; i < weeks.length-1; i++) {
			style.bgfill = (i % 2 == 1) ? "none" : "#eee";
			style.textFill = (i % 2 == 0) ? "#fff" : "#fff";
			console.log("Week " + i + " from " + weeks[i] + " to: " + weeks[i+1]);
			weeksBand.add(weeks[i], weeks[i+1], weeksNumbers[i], style);
		}
		
		// Create the months
		var monthsBand = new Band(tb);
		monthsBand.uniformScale = 37;
		for (var i = 0; i < months.length-1; i++) {
			var x = months[i];
			var x2 = months[i+1];
			var d = new Date(tb.startYear,tb.startMonth,x+1) ;
			style.bgfill = TimeBand.monthColors[d.getMonth()];
			monthsBand.add(x, x2, TimeBand.monthNames[d.getMonth()], style);
		}
		this.headerHeight = this.nextYOffset;
	},
	
	addOverlay: function() {
		var style = new TextBoxStyle();
		var tb = this;
		var weeks = [];
		var lastWeek = -1;
		style.fontSize=10;
		for (var x = 0; x < this.numberOfDays; x++) {
			var d = new Date(tb.startYear,tb.startMonth,x+1) ;
			var week = d.getWeekNumber();
			if (week!=lastWeek) {
				weeks.push(x);
				lastWeek = week;
			}
		}
		
		style.fontSize=18;
		style.strokeWidth = 0.8;
		style.textStroke = "#000";
		style.textStrokeWidth = 0;
		style.opacity = 0.03; 
			
		for (var i = 0; i < weeks.length-1; i++) {
			style.bgfill = (i % 2 == 1) ? "#555" : "#555";
			style.textFill = (i % 2 == 0) ? "#fff" : "#fff";
			var currentDay = timebands.addBox(this.top,
				this.cellWidth * (weeks[i]+5), this.headerHeight,
				this.cellWidth * (2), this.nextYOffset-this.headerHeight,
				"", style, "");
		}
		
	
	
	}
	
};

/**
 * @author Mikael Hvidtfeldt Christensen / twitter: @SyntopiaDK, web: hvidtfeldts.net
 */

var timebands = {
    REVISION: '0.0.1'
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
Date.prototype.getWeekNumber = function() {
    var d = new Date(+this);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
};


timebands.createLinearGradient = function(id,x1,y1,x2,y2) {
	var ne = document.createElementNS("http://www.w3.org/2000/svg", 'linearGradient'); 
	ne.setAttribute("id",id);
	ne.setAttribute("x1",x1);
	ne.setAttribute("y1",y1);
	ne.setAttribute("x2",x2);
	ne.setAttribute("y2",y2);
	return ne;
}

timebands.createStop = function(offset,style) {
	var ne = document.createElementNS("http://www.w3.org/2000/svg", 'stop'); 
	ne.setAttribute("offset",offset);
	ne.setAttribute("style",style);
	return ne;
}


timebands.addBox = function(svg, x, y, w, h, text, style, hint, ontop) {
    var g = document.createElementNS("http://www.w3.org/2000/svg", 'g');
    g.setAttribute("transform", "translate(" + x + "," + y + ")");

    var e = document.createElementNS("http://www.w3.org/2000/svg", 'rect');
    e.style.fill = style.bgfill;
    e.style.stroke = "black";
    e.style.originalStroke = e.style.stroke;
    e.setAttribute("x", 0);
    e.setAttribute("y", 0);
    e.setAttribute("width", w);
    e.setAttribute("height", h);
    e.setAttribute("rx", style.rx);
    e.setAttribute("ry", style.ry);
    e.style.strokeWidth = style.strokeWidth;
    e.style.originalStrokeWidth = e.style.strokeWidth;
    e.style.opacity = style.opacity;

    var t = document.createElementNS("http://www.w3.org/2000/svg", 'text');
    t.setAttribute("x", 5);
    t.setAttribute("transform", "scale(1,1)");
    t.style.fontfamily = "Helvetica";
    t.setAttribute("y", h - 3);
    t.setAttribute("font-size", style.fontSize);
    g.setAttribute("alignment-baseline", "baseline");
    t.textContent = text;
    g.appendChild(e);
    g.appendChild(t);

    if (hint !== undefined) {
        var ti = document.createElementNS("http://www.w3.org/2000/svg", 'title');
        ti.textContent = hint;
        g.appendChild(ti);
    }

    if (svg.hasChildNodes() && svg.children !== undefined && ontop === undefined) {
        svg.insertBefore(g, svg.children[0]);
    } else {
        svg.appendChild(g);
    }
    return g;
};


timebands.init = function(svg, defs, startYear, startMonth, numberOfDays) {
	var startDate = new Date(startYear,startMonth-1,1);
	svg.setAttribute("style", "font-family: Helvetica, Arial;-webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;");
	
	var tb = new TimeBand(svg,startYear,startMonth-1, numberOfDays);
	tb.addHeader();
	var spacing = 7;
	var height = 30;

	var ss = new TextBoxStyle();
	ss.fontSize = 20;
	ss.rx = 3;
	ss.ry = 3;
	ss.bgfill = "#fff";
	
	var parser = new TimeBandsParser();
	parser.parse(defs.innerHTML);
	for (var i = 0; i < parser.bandSections.length; i++) {
		var bs = parser.bandSections[i];
		new Band(tb,spacing);
		if (bs.name.startsWith("!")) {
			ss.section = true;
			b = new Band(tb,height, bs.name.substr(1));		
		} else {
			b = new Band(tb,height, bs.name);
			bs.band = b;
		}
		for (var j = 0; j < bs.entries.length; j++) {
			if (ss.section) ss.bgfill = (j % 2 == 0) ? "url(#grad1)" : "url(#grad2)";
			var e = bs.entries[j];
			ss.bgfill = e.color;
			var interval = e.getIntervalRelativeToDate(startDate);
			b.add(interval[0],interval[1]+1, e.name, ss);
		}
	}
	
	tb.addOverlay();
	
	var today = new BandEntry("", new Date(), new Date());
	ss.strokeWidth = 0.2;
	ss.textStroke = "#000";
	ss.textStrokeWidth = 0;
	ss.opacity = 0.1; 
	ss.bgfill = "red";
	var ii = today.getIntervalRelativeToDate(startDate);
		
	var currentDay = timebands.addBox(tb.top,
		tb.cellWidth * ii[0], tb.headerHeight,
		tb.cellWidth * 1, tb.nextYOffset-tb.headerHeight,
		"", ss, "", true);
			
	tb.view.scalableElements = tb.scalableElements;
}

timebands.create = function(svgID, defsID, startYear, startMonth, numberOfDays) {
	svg = document.getElementById(svgID);
	defs = document.getElementById(defsID);
	timebands.init(svg,defs, startYear, startMonth, numberOfDays);
	svg.addEventListener("load",function() {
		timebands.init(svg,defs, startYear, startMonth, numberOfDays);
	}, false);
}



var BandEntry = function(name, from, to) {
	this.name = name;
	this.from = from;
	this.to = to;
	
	this.getIntervalRelativeToDate = function(date) {
		var f = timebands.dateDiffInDays(date, from);
		var t = timebands.dateDiffInDays(date, to);
		return [f,t];
	}
}

var BandSection = function(name) {
	
	this.name = name;
	this.entries = []; // of type BandEntry
	this.toString = function() {
		return "BandSection[" + name + "]: " + this.entries.length + " + entries";
	};
	this.addEntry = function(e) {
		console.log("Added entry: " + e);
		this.entries.push(e);
	};
}


var TimeParser = function(implicitYear) {
	this.implicitYear = implicitYear;
}

TimeParser.prototype = {
	parseInterval: function(b) {
		var l = b.split("-");
		if (l.length != 2) {
			throw "The date interval [" + b + "] did not contain exactly one hyphen";
		}
		var from = this.parseTime(l[0]);
		var to = this.parseTime(l[1]);
		return [from,to];
	},
	
	parseTime: function(b) {
		b = b.trim();
		var l = b.split("/");
		var date;
		if (l.length == 2) {
			date = new Date(this.implicitYear, l[1]-1, l[0]);
		} else if (l.length == 3) {
			var y = l[2];
			if (y<100) y=2000+parseInt(y); // two-digit year
			date = new Date(y, l[1]-1, l[0]);
		} else {
			throw "The date [" + b + "] did not contain one or two /-es";
		}
		console.log("Parsed date: " + date);
		return date;
	}
}

var TimeBandsParser = function() {
	this.bandSections = []; // of type BandSection
	this.timeParser = new TimeParser(2015);
}

TimeBandsParser.prototype = {
	addBandSection: function(b) {
		if (b === undefined) {
			return;
		}
		this.bandSections.push(b);
		console.log("New section:" + b.toString());
	},
	
	parseEntry: function(b) {
		var re = /(.*)color\:(\S+)/; 
		var m;
 
		var color = "#fafafa";
		if ((m = re.exec(b)) !== null) {
			console.log("COLOR: " + m[1]);
			color = m[2];
			b = m[1];
			console.log("new name: " + b);
			
		}
		
		var l = b.split(":");
		if (l.length != 2) {
			throw "The entry [" + b + "] did not contain exactly one colon";
		}
		var interval = this.timeParser.parseInterval(l[0]);
		var name = l[1];
		
		
		
		var e = new BandEntry(name, interval[0], interval[1]);
		e.color = color;
		
		return e;
	},
	
	parse: function(txt) {
		var lines = txt.match(/[^\r\n]+/g);
		var bandSection = undefined;
		for (var i = 0; i < lines.length; i++) {
			if (i<lines.length-1) {
				if (lines[i+1].startsWith("---")) {
					bandSection = new BandSection(lines[i]);
					if (!bandSection.name.startsWith("-")) {
						this.addBandSection(bandSection);
					}
					i++;
					continue;
				}
			}
			console.log(i + " " + lines[i]);
			if (bandSection === undefined) {
				throw "When parsing [" + lines[i] + "] no section was defined";
			}
			var e = this.parseEntry(lines[i]);
			bandSection.addEntry(e);
		}
	}
}
	
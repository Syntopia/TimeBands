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
	ss.bgfill = "url(#grad3)";
	
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



var TimeBand = function(svg, startYear, startMonth, numberOfDays) {

	this.view = new Viewport(svg);
	var ne = document.createElementNS("http://www.w3.org/2000/svg", 'defs'); 
	var l1=timebands.createLinearGradient("grad1", "0%", "30%", "0%", "100%");
	l1.appendChild(timebands.createStop("0%",  "stop-color:rgb(240,224,195);stop-opacity:1")); 
	l1.appendChild(timebands.createStop("100%","stop-color:rgb(240,224,195);stop-opacity:1"));
	var l2=timebands.createLinearGradient("grad3", "0%", "30%", "0%", "100%");
	l2.appendChild(timebands.createStop("0%","stop-color:rgb(255,255,255);stop-opacity:1"));
	l2.appendChild(timebands.createStop("100%","stop-color:rgb(225,225,225);stop-opacity:1"));
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

		var weeksBand = new Band(tb);
		weeksBand.uniformScale = 25;
		for (var i = 0; i < weeks.length-1; i++) {
			style.bgfill = (i % 2 == 1) ? "none" : "#eee";
			style.textFill = (i % 2 == 0) ? "#fff" : "#fff";
			console.log("Week " + i + " from " + weeks[i] + " to: " + weeks[i+1]);
			weeksBand.add(weeks[i], weeks[i+1], weeksNumbers[i], style);
		}
		
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
				"", style, "", true);
		}
		
	
	
	}
	
};

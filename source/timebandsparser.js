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
		if (l.length != 2) {
			throw "The date [" + b + "] did not contain a /";
		}
		var date = new Date(this.implicitYear, l[1]-1, l[0]);
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
		var l = b.split(":");
		if (l.length != 2) {
			throw "The entry [" + b + "] did not contain exactly one colon";
		}
		var interval = this.timeParser.parseInterval(l[0]);
		var name = l[1];
		var e = new BandEntry(name, interval[0], interval[1]);
		return e;
	},
	
	parse: function(txt) {
		var lines = txt.match(/[^\r\n]+/g);
		var bandSection = undefined;
		for (var i = 0; i < lines.length; i++) {
			if (i<lines.length-1) {
				if (lines[i+1].startsWith("---")) {
					bandSection = new BandSection(lines[i]);
					this.addBandSection(bandSection);
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
	
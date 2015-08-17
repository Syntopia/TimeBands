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
		console.log("Added band " + band + ". Current offset: " + this.nextYOffset);
	}
};

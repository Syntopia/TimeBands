/**
 * @author Mikael Hvidtfeldt Christensen / twitter: @SyntopiaDK, web: hvidtfeldts.net
 */

var timebands = {
    REVISION: '0.0.1'
};

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
timebands.getWeekNumber = function() {
    var d = new Date(+this);
    d.setHours(0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    return Math.ceil((((d - new Date(d.getFullYear(), 0, 1)) / 8.64e7) + 1) / 7);
};


timebands.addBox = function(svg, x, y, w, h, text, style, hint) {
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

    if (svg.hasChildNodes()) {
        svg.insertBefore(g, svg.children[0]);
    } else {
        svg.appendChild(g);
    }
    return g;
};

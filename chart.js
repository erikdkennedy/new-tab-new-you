//requires JQuery

function drawLineChart(canvas, dataDict) {
	//organize canvas
	var canvasElement = canvas[0];
	var c=canvasElement.getContext("2d");
	c.font = "10px Helvetica";
	
	//determine chart height and width
	var canvasWidth = canvas.attr("width");
	var canvasHeight = canvas.attr("height");
	var leftMargin = 20;
	var bottomMargin = 15;	
	var chartWidth = canvasWidth-leftMargin;
	var chartHeight = canvasHeight - bottomMargin;
	
	//clear canvas before drawing
	c.clearRect(0, 0, canvasWidth, canvasHeight);
	
	//determine spacing between each point
	var numberOfDataPoints = Object.keys(dataDict).length;
	var dataSeparation = Math.floor((chartWidth)/numberOfDataPoints);
	
	//determine max data point
	var maxVal = 0;
	for (key in dataDict) {
		maxVal = dataDict[key] > maxVal ? dataDict[key] : maxVal;
	}
	
	//determine upper bound of graph -- next multiple of 10 above maxVal
	var upperBound = maxVal + 10-(maxVal%10);
	
	//determine pixels per y-unit
	var scaling = chartHeight/upperBound;
	
	
	//fill in guide lines
	c.fillStyle = "gray";
	for (i=0; i<upperBound; i+=10) {
		var y = chartHeight - scaling*i;
		c.dashedLine(leftMargin, y, canvasWidth, y, 3);
		
		//write vertical axis units
		c.fillText(i.toString(),0,y);
	}
	
	//fill in data points
	var xNew = leftMargin;
	var yNew;
	var xOld = NaN, yOld = NaN;
	for (key in dataDict) {
		yNew = chartHeight - dataDict[key]*scaling;
		
		//draw line from old to new point if both exist
		if (!isNaN(yNew) && !isNaN(yOld)) {
			c.beginPath();
			c.moveTo(xOld, yOld);
			c.lineTo(xNew, yNew);
			c.stroke();
			c.closePath();
		}
		
		//write horizontal axis units
		c.fillText(key.substring(0,key.length-5), xNew, canvasHeight);
		
		//draw point
		c.arc(xNew, yNew, 3, 0, 2*Math.PI, true);
		c.fill();
		c.closePath();
		//TODO: create hover-over data labelling
		
		//get ready for next data point
		xOld = xNew;
		yOld = yNew;
		xNew += dataSeparation;
	}	
}

CanvasRenderingContext2D.prototype.dashedLine = function(x1, y1, x2, y2, dashLen) {
	if (dashLen == undefined) dashLen = 2;

	this.beginPath();
	this.moveTo(x1, y1);

	var dX = x2 - x1;
	var dY = y2 - y1;
	var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
	var dashX = dX / dashes;
	var dashY = dY / dashes;

	var q = 0;
	while (q++ < dashes) {
		x1 += dashX;
		y1 += dashY;
		this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
	}
	this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);

	this.stroke();
	this.closePath();
};
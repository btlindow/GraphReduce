function GraphNode(name) {
	this.name = name;
	this.degree = 0;
	this.r = 5;
	this.pos = createVector(random(this.r*2,(winX-this.r*5)), 
							random(this.r*2,(winY-this.r*5)));
	this.color = "black";
	this.adjacent = [];
	this.edge = [];
	this.side = null;
	this.added = 0;


	this.show = function() {
		push();
		fill(this.color);
		stroke(0);
		ellipse(this.pos.x, this.pos.y, this.r*2, this.r*2);
		fill(0);
		textSize(12);
		text(this.name + ", " + this.degree + ", " + this.added, 
			(this.pos.x - r), (this.pos.y - 3*r));

		pop();
	}
}
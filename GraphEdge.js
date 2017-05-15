function GraphEdge(nodeA, nodeB) {
	this.left = nodeA;
	this.right = nodeB;
	this.thickness = 3;
	this.color = "black";

	this.show = function() {
		push();
		stroke(this.color);
		strokeWeight(this.thickness);
		line(this.left.pos.x, this.left.pos.y, this.right.pos.x, this.right.pos.y);
		pop();
	}

}
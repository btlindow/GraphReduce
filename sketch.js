var canvas;
var button;
var winX = window.innerWidth;
var winY = window.innerHeight;
var num_edges;
var g_node = [];
var g_edge = [];
var max_degree = 0;
var step = -1;
var m_step = 0;
var l_flag = false;
var r;
var b_flag = false;
var r_count = 0;
var g_index = [];
var sub_clique = [];

function setup() {
	canvas = createCanvas(winX, winY);
	canvas.position(0,20);

	//File Input
	createFileInput(fileSelected);
}

function fileSelected(file) {
	var array = (file.data).split("\n");
	var g_max = 0;
	num_edges = array.length;

	//Find Max Node Name
	for(var i = 0; i < num_edges; i++) {
		var node = array[i].split(" ");
		var l_max = max(parseInt(node[0]), parseInt(node[1]));
		g_max = max(l_max, g_max);
	}

	//Allocate Array
	g_node = [g_max + 1];

	//Initialize Node Array to Nulls
	for(var i = 0; i < g_max + 1; i++) {
		g_node[i] = null;
	}

	//Populate Node and Edge Array
	for(var i = 0; i < num_edges; i++) {
		var node = array[i].split(" ");
		node[0] = parseInt(node[0]);
		node[1] = parseInt(node[1]);
		if(g_node[node[0]] == null) {
			g_node[node[0]] = new GraphNode(node[0]);
		}
		if(g_node[node[1]] == null) {
			g_node[node[1]] = new GraphNode(node[1]);
		}
		var edge = new GraphEdge(g_node[node[0]], g_node[node[1]]);
		g_node[node[0]].adjacent.push(g_node[node[1]]);
		g_node[node[1]].adjacent.push(g_node[node[0]]);
		g_node[node[0]].edge.push(edge);
		g_node[node[1]].edge.push(edge);
		g_node[node[0]].degree++;
		g_node[node[1]].degree++;
		r = g_node[node[0]].r;
		g_edge.push(edge);
	}
	l_flag = true;
	step = 0;
}

function draw() {
	background(255);
	displayGraphNodes();
	displayGraphEdges();
	displayBarrier();
	process();
}

//The Step By Step Function To Reduce the Graph
function process() {
	switch(step) {
		case 0:
			getMaxDegree();
			console.log("Overall Max Degree: " + max_degree);
			step++;
			break;
		case 1:
			getPotentialDegree();
			console.log("Potentail Sub-Clique Degree: " + max_degree);
			step++;
			break;
		case 2:
			identifyNodes();
			step++;
			break;
		case 3:
			separateNodes();
			step++;
			break;
		case 4:
			identifyEdges();
			step++;
			break;
		case 5:
			updateNodes();
			identifyEdges();
			step++;
			break;
		case 6:
			checkSubCliquePotential();
			break;
		case 7:
			npCliqueSearch();
			step++;
			break;
		case 8:
			showReductionStats();
			step++;
			break;
		default:
			break;
	}
}

//Find Max Degree of Any Node
function getMaxDegree() {
	for(var i = 0; i < g_node.length; i++) {
		if(g_node[i] != null) {
			max_degree = max(max_degree, g_node[i].adjacent.length);
		}
	}
}

//Find Potential Sub-Clique Degree
function getPotentialDegree() {
	var count;
	while(true) {
		count = 0;
		for(var i = 0; i < g_node.length; i++) {
			if(g_node[i] != null) {
				if(g_node[i].adjacent.length >= max_degree) {
					count++;
				}
			}
		}
		if(count > max_degree) {
			return;
		} else {
			max_degree--;
		}
	}
}

//Color The Nodes Based on Potential
function identifyNodes() {
	for(var i = 0; i < g_node.length; i++) {
		if(g_node[i] != null) {
			if(g_node[i].adjacent.length >= max_degree) {
				g_node[i].color = color(0,255,0);			
			} else {
				g_node[i].color = color(255,0,0);
			}
		}
	}
}

//Separate Nodes Based on Potential
function separateNodes() {
	b_flag = true;
	for(var i = 0; i < g_node.length; i++) {
		if(g_node[i] != null) {
			//Put Good Nodes on Left
			if(g_node[i].adjacent.length >= max_degree) {
				g_node[i].side = 0;
				g_node[i].pos = createVector(random(r*5, winX/3),
											 random(r*5, winY - 2*r));
			}//Bad Nodes on Right 
			else {
				g_node[i].side = 1;
				g_node[i].pos = createVector(random(2*(winX/3), winX - 5*r),
											 random(r*5, winY - 5*r));
			}
		}
	}
}

//Color Edges Based on Crossover (L->R)
function identifyEdges() {
	for (var i = 0; i < num_edges; i++) {
		//Both Nodes On Left
		if(g_edge[i].left.side == 0 && 
		   g_edge[i].right.side == g_edge[i].left.side) {
			g_edge[i].color = "green";
		}
		//Both Nodes on Right
		if(g_edge[i].left.side == 1 && 
		   g_edge[i].right.side == g_edge[i].left.side) {
			g_edge[i].color = "red";
		}
		//Nodes on Opposite Sides
		if(g_edge[i].left.side != g_edge[i].right.side) {
			g_edge[i].color = "blue";
		}
	}
}

//Update Nodes With A Blue Edge
function updateNodes() {
	var newdegree;
	for(var i = 0; i < g_node.length; i++) {
		if(g_node[i] != null && g_node[i].side == 0) {
			newdegree = g_node[i].degree;
			for(var j = 0; j < g_node[i].edge.length; j++) {
				var edge = g_node[i].edge[j];
				if (edge.color == "blue") {
					newdegree--;
				}
			}
			if (newdegree < max_degree) {
				moveNodeToRight(g_node[i]);
				identifyEdges();
				i = 0;
			}
		}
	}
}

//Move A Node From Left to Right
function moveNodeToRight(node) {
	node.side = 1;
	node.color = color(255,0,0);
	node.pos = createVector(random(2*(winX/3), winX - 5*r),
								 random(r*2, winY - 5*r));
}

//Count Nodes on Left + Compare to Max Degree
function checkSubCliquePotential() {
	var count = 0;
	for(var i = 0; i < g_node.length; i++) {
		if(g_node[i] != null && g_node[i].side == 0) {
			count++;
		}
	}
	if (!(count > max_degree)) {
		startOver();
		r_count++;
	} else {
		step++;
	}
}

//Reiterate the Process With max_degree-1;
function startOver() {
	max_degree--;
	b_flag = false;

	for(var i = 0; i < g_node.length; i++) {
		if(g_node[i] != null) {
			g_node[i].color = "black";
			g_node[i].side = null;
			g_node[i].pos = createVector(random(this.r*2,(winX-this.r*5)), 
										 random(this.r*2,(winY-this.r*5)));
		}
	}
	for(var i = 0; i < num_edges; i++) {
		g_edge[i].color = "black";
	}
	step = 1;
}

//Show Stats About the Reduction
function showReductionStats() {
	var le_count = 0;
	var ri_count = 0;
	var per;
	for(var i = 0; i < g_node.length; i++) {
		if(g_node[i] != null) {
			if(g_node[i].side == 0) {
				le_count++;
			}
			else {
				ri_count++;
			}
		}
	}
	console.log("Total Nodes: " + (le_count + ri_count));
	console.log("Re-iterations: " + r_count);
	console.log("Reduced: " + ri_count);
	per = (parseFloat(ri_count) / parseFloat(le_count + ri_count)) * 100;
	console.log("Reduction By Percentage: " + per + "%");
}

//Find Sub-Clique of Remaining Nodes
function npCliqueSearch() {
	//Index the Left Nodes
	for(var i = 0; i < g_node.length; i++) {
		if(g_node[i] != null && g_node[i].side == 0) {
			g_index.push(i);
		}
	}

	//Find A Sequence with max_degree +1 Nodes
	for(var i = 0; i < 2^(g_index.length); i++) {
		var bin = (i >>> 0).toString(2);
		var count = (bin.split("1").length - 1);
		if(count == (max_degree + 1)) {
			for (var j = 0; j < bin.length; j++) {
				if(bin[j] == '1') {
					var node = g_node[g_index[j]];
					sub_clique.push(node);
				}
			}
			
			if(checkCompleteness()) {
				colorSubClique();
				return;
			}

			sub_clique = [];
		}
	}
	startOver();
}

//Check If The sub_clique is Complete
function checkCompleteness() {
	for(var i = 0; i < sub_clique.length; i++) {
		for(var j = i+1; j < sub_clique.length; j++) {
			if(!isAdjacent(sub_clique[i], sub_clique[j])) {
				return false;
			}
		}
	}
	return true;
}

//Determines if nodeA is in nodeB's Adjacency List
function isAdjacent(nodeA, nodeB) {
	for(var i = 0; i < nodeB.adjacent.length; i++) {
		if(nodeA == nodeB.adjacent[i]) {
			return true;
		}
	}
	return false;
}

//Color the SubClique
function colorSubClique() {
	for(var i = 0; i < sub_clique.length; i++) {
		sub_clique[i].color = color("magenta");
	}

	for(var i = 0; i < g_edge.length; i++) {
		if(edgeInClique(g_edge[i])) {
			g_edge[i].color = color("magenta");
		}
	}

}

//Determines if an edge is in the clique
function edgeInClique(edge) {
	nodeA = edge.left;
	nodeB = edge.right;
	if(nodeInClique(nodeA) && nodeInClique(nodeB)) {
		return true;
	}
	return false;
}

function nodeInClique(node) {
	for (var i = 0; i < sub_clique.length; i++) {
		if (node == sub_clique[i]){
			return true;
		}
	}
	return false;
}

//Step By Clicking Mouse
// function mouseClicked() {
// 	if(l_flag) {
// 		step = m_step;
// 		m_step++;
// 	}
// }

//Display Nodes
function displayGraphNodes() {
	for(var i = 0; i < g_node.length; i++) {
		if(g_node[i] != null) {
			g_node[i].show();
		}
	}
}

//Display Edges
function displayGraphEdges() {
	for(var i = 0; i < num_edges; i++) {
		g_edge[i].show();
	}
}

//Displays Divide During Sparate Phase
function displayBarrier() {
	if (b_flag) {
		push();
		stroke("black");
		strokeWeight(2);
		line(winX/2, 0, winX/2, winY);
		pop();
	}
}
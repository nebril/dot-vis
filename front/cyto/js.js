var initiate = function() {
	var initFunction = 'handle_class';

	//layout options
	var dagreLayout = {
		name: 'dagre',

		// dagre algo options, uses default value on undefined
		nodeSep: 700, // the separation between adjacent nodes in the same rank
		edgeSep: undefined, // the separation between adjacent edges in the same rank
		rankSep: undefined, // the separation between adjacent nodes in the same rank
		rankDir: 'TP', // 'TB' for top to bottom flow, 'LR' for left to right
		minLen: function( edge ){ return 2; }, // number of ranks to keep between the source and target of the edge

		// general layout options
		fit: false, // whether to fit to viewport
		padding: 100, // fit padding
		animate: false, // whether to transition the node positions
		animationDuration: 500, // duration of animation in ms if enabled
		boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
		ready: function(){}, // on layoutready
		stop: function(){} // on layoutstop
	};


	var layout = dagreLayout;

	var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
	document.getElementById('thegraph').style.height = h + 'px';

	var allcy = cytoscape({
		ready: function(){ console.log('allcy ready') },
		headless: true,
	});

	var cyOptions = {
		container: document.getElementById('thegraph'),
		ready: function(){ console.log('cy ready') },
		style: cytoscape.stylesheet()
			.selector('node')
			.css({
				'content': 'data(label)',
				'text-valign': 'center',
				'color': 'white',
				'text-outline-width': 2,
				'text-outline-color': '#888',
				'width': 'mapData(percentage, 0, 100, 10, 200)',
				'height': 'mapData(percentage, 0, 100, 10, 200)',
				'border-width': 3,
				'font-size': '25px',
			})
			.selector('edge')
			.css({
				'font-size': '20px',
				'color' : 'black',
				'content': 'data(label)',
				'target-arrow-shape': 'triangle',
				'width': 3,
				'line-color': '#ddd',
				'target-arrow-color': '#ddd'
			})
			.selector(':selected')
			.css({
				'background-color': 'black',
				'line-color': 'black',
			}),
		layout: layout,
		hideEdgesOnViewport: false,
		hideLabelsOnViewport: true,
	};

	var cy = cytoscape(cyOptions);

	var r = new XMLHttpRequest();
	r.open("GET", "custom.json", true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return;

		var response = JSON.parse(r.responseText);
		

		allcy.load(response, function(){
			console.log('allcy loaded');	
		});

		rebuildGraph(initFunction);	
	};

	var rebindClick = function() {
		cy.nodes().off('click', onClick);
		cy.nodes().on('click', onClick);
	};

	var redrawGraph = function(node) {
		cy.layout(layout);
		cy.load( cy.elements('*').jsons(), function() { cy.center(node)} );
		window.setTimeout(rebindClick, 500); //because it enters recursion when not timouted	
	};
	
	var onClick = function() {
		var node = this;

		this.select();

		var original = allcy.$('#' + node.data('id'));
		if(typeof node.data('loadedChildren') !== true) {
			node.data('loadedChildren', true);
			var added = original.neighborhood()

			cy.add(added);
			redrawGraph(node);
		}
	};


	var hideSubgraph = function() {
		cy.remove(this.successors());
		redrawGraph(this);
	};

	var hideSubgraphAndNode = function() {
		cy.remove(this.successors());
		cy.remove(this);
		redrawGraph(this);
	};

	var hideSiblings = function() {
		var siblings = this.incomers().outgoers().filter('node[id != "' + this.id() + '"]');
		hideSubgraphAndNode.apply(siblings);
		redrawGraph(this);
	}

	var cxtMenuDefaults = {
		menuRadius: 100, // the radius of the circular menu in pixels
		selector: 'node', // elements matching this Cytoscape.js selector will trigger cxtmenus
		commands: [ // an array of commands to list in the menu
			{
				content: 'Hide subgraph with node',
				select: hideSubgraphAndNode, 
			},
			{
				content: 'Hide subgraph',
				select: hideSubgraph, 
			},
			{
				content: 'Hide all siblings',
				select: hideSiblings,
			},
		], 
		fillColor: 'rgba(0, 0, 0, 0.75)', // the background colour of the menu
		activeFillColor: 'rgba(92, 194, 237, 0.75)', // the colour used to indicate the selected command
		activePadding: 20, // additional size in pixels for the active command
		indicatorSize: 24, // the size in pixels of the pointer to the active command
		separatorWidth: 3, // the empty spacing in pixels between successive commands
		spotlightPadding: 4, // extra spacing in pixels between the element and the spotlight
		minSpotlightRadius: 24, // the minimum radius in pixels of the spotlight
		maxSpotlightRadius: 38, // the maximum radius in pixels of the spotlight
		itemColor: 'white', // the colour of text in the command's content
		itemTextShadowColor: 'black', // the text shadow colour of the command's content
		zIndex: 9999 // the z-index of the ui div
	};

	rebuildGraph = function(funcName) {
		cy.remove(cy.elements());
		cy.add(allcy.nodes("[funcName *= '" + funcName + "']").closedNeighborhood());
		cy.layout(layout);
		cy.load( cy.elements('*').jsons() );
		rebindClick();
	};

	cy.cxtmenu(cxtMenuDefaults);

	r.send();
};

document.addEventListener("DOMContentLoaded", initiate);

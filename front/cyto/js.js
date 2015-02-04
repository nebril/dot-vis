document.addEventListener("DOMContentLoaded", function() {
	//layout options

	
	var root;
	var colaLayout = { 
			name: 'cola',

			animate: true, // whether to show the layout as it's running
			refresh: 1, // number of ticks per frame; higher is faster but more jerky
			maxSimulationTime: 4000, // max length in ms to run the layout
			ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
			fit: false, // on every layout reposition of nodes, fit the viewport
			padding: 30, // padding around the simulation
			boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }

			// layout event callbacks
			ready: function(){}, // on layoutready
			stop: function(){}, // on layoutstop

			// positioning options
			randomize: false, // use random node positions at beginning of layout
			avoidOverlaps: true, // if true, prevents overlap of node bounding boxes
			handleDisconnected: true, // if true, avoids disconnected components from overlapping
			nodeSpacing: function( node ){ return 100; }, // extra spacing around nodes
			flow: { axis: 'y', minSeparation: 100 },
			alignment: function(node) {
				return undefined;
			}, // relative alignment constraints on nodes, e.g. function( node ){ return { x: 0, y: 1 } }

			// different methods of specifying edge length
			// each can be a constant numerical value or a function like `function( edge ){ return 2; }`
			edgeLength: undefined, // sets edge length directly in simulation
			edgeSymDiffLength: undefined, // symmetric diff edge length in simulation
			edgeJaccardLength: undefined, // jaccard edge length in simulation

			// iterations of cola algorithm; uses default values on undefined
			unconstrIter: undefined, // unconstrained initial layout iterations
			userConstIter: undefined, // initial layout iterations with user-specified constraints
			allConstIter: undefined, // initial layout iterations with all constraints including non-overlap

			// infinite layout options
			infinite: false // overrides all other options for a forces-all-the-time mode
	};

	var dagreLayout = {
		name: 'dagre',

		// dagre algo options, uses default value on undefined
		nodeSep: undefined, // the separation between adjacent nodes in the same rank
		edgeSep: undefined, // the separation between adjacent edges in the same rank
		rankSep: undefined, // the separation between adjacent nodes in the same rank
		rankDir: undefined, // 'TB' for top to bottom flow, 'LR' for left to right
		minLen: function( edge ){ return 1; }, // number of ranks to keep between the source and target of the edge

		// general layout options
		fit: true, // whether to fit to viewport
		padding: 30, // fit padding
		animate: false, // whether to transition the node positions
		animationDuration: 500, // duration of animation in ms if enabled
		boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
		ready: function(){}, // on layoutready
		stop: function(){} // on layoutstop
	};



	var randomLayout = {
		name: 'random',

		fit: true, // whether to fit to viewport
		padding: 30, // fit padding
		boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
		animate: false, // whether to transition the node positions
		animationDuration: 500, // duration of animation in ms if enabled
		ready: undefined, // callback on layoutready
		stop: undefined // callback on layoutstop
	};	

	var arborLayout = {
		name: 'arbor',

		animate: true, // whether to show the layout as it's running
		maxSimulationTime: 60000, // max length in ms to run the layout
		fit: true, // on every layout reposition of nodes, fit the viewport
		padding: 30, // padding around the simulation
		boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
		ungrabifyWhileSimulating: false, // so you can't drag nodes during layout

		// callbacks on layout events
		ready: undefined, // callback on layoutready 
		stop: undefined, // callback on layoutstop

		// forces used by arbor (use arbor default on undefined)
		repulsion: undefined,
		stiffness: undefined,
		friction: undefined,
		gravity: true,
		fps: undefined,
		precision: undefined,

		// static numbers or functions that dynamically return what these
		// values should be for each element
		// e.g. nodeMass: function(n){ return n.data('weight') }
		nodeMass: undefined, 
		edgeLength: undefined,

		stepSize: 0.1, // smoothing of arbor bounding box

		// function that returns true if the system is stable to indicate
		// that the layout can be stopped
		stableEnergy: function( energy ){
			var e = energy; 
			return (e.max <= 0.5) || (e.mean <= 0.3);
		},

		// infinite layout options
		infinite: false // overrides all other options for a forces-all-the-time mode
	};

	var springyLayout = {
		name: 'springy',

		animate: true, // whether to show the layout as it's running
		maxSimulationTime: 4000, // max length in ms to run the layout
		ungrabifyWhileSimulating: false, // so you can't drag nodes during layout
		fit: true, // whether to fit the viewport to the graph
		padding: 30, // padding on fit
		boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
		random: false, // whether to use random initial positions
		infinite: false, // overrides all other options for a forces-all-the-time mode
		ready: undefined, // callback on layoutready
		stop: undefined, // callback on layoutstop

		// springy forces
		stiffness: 400,
		repulsion: 4000,
		damping: 0.5
	};

	
	var layout = colaLayout;


	var allcy = cytoscape({
		ready: function(){ console.log('allcy ready') },
		headless: true,
	});

	var cy = cytoscape({
		container: document.getElementById('thegraph'),
		ready: function(){ console.log('cy ready') },
		style: cytoscape.stylesheet()
			.selector('node')
			.css({
				'content': 'data(funcName)',
				'text-valign': 'center',
				'color': 'white',
				'text-outline-width': 2,
				'text-outline-color': '#888'
			}),
		layout: layout
	});


	var r = new XMLHttpRequest();
	r.open("GET", "custom.json", true);
	r.onreadystatechange = function () {
		if (r.readyState != 4 || r.status != 200) return;

		var response = JSON.parse(r.responseText);
		

		allcy.load(response, function(){
			console.log('allcy loaded');	
		});



		var rebindClick = function() {
			cy.nodes().off('click', onClick);
			cy.nodes().on('click', onClick);
		};

		var onClick = function() {
			var node = this;

			var original = allcy.$('#' + node.data('id'));
			if(typeof node.data('loadedChildren') !== true) {
				node.data('loadedChildren', true);

				cy.add(original.neighborhood());
				cy.layout(layout);
				cy.load( cy.elements('*').jsons() );


				window.setTimeout(rebindClick, 500);	
			}
		};


		root = allcy.nodes().roots()[0];
		
		cy.add(allcy.nodes().roots().closedNeighborhood());
		layout.alignment = function(node){
			var res = cy.elements().aStar({
				root: '#' + root.data('id'),
				goal: '#' + node.data('id'),
			});
			console.log(res);
			return {x:0, y:res.distance};
		};
		cy.layout(layout);
		cy.load( cy.elements('*').jsons() );
		rebindClick();
	};

	r.send();
});


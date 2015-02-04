# -*- coding: utf-8 -*-

import argparse
import os
import json

import pydot


parser = argparse.ArgumentParser()
parser.add_argument('source')

args = parser.parse_args()

graph = pydot.graph_from_dot_file(args.source)


nodes = []
edges = []
for node in graph.get_node_list():
    try:
        function, percentage, percentage2, times = tuple(
            node.get_label().split('\\n'))
        nodes.append({
            "data": {
                "id": str(int(node.get_name())),
                "funcName": function,
                "percentage": percentage,
                "percentage2": percentage2,
                "callCount": times,
            },
            "position": {
                "x": 0,
                "y": 0,
            },
        })
        
    except (ValueError, AttributeError) as e:
        pass

for edge in graph.get_edge_list():
    edges.append({
        "data": {
            "id": 'e' + str(int(edge.get_source())) + '_' +  str(int(edge.get_destination())),
            "source": edge.get_source(),
            "target": edge.get_destination(),
        }
    })

print json.dumps(
  {
    "nodes": nodes,
    "edges": edges,
  }
)

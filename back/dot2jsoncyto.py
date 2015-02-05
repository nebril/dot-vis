# -*- coding: utf-8 -*-

import argparse
import os
import json
import sys

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
                "percentage": float(percentage.strip('()%')),
                "percentage2": float(percentage2.strip('()%')),
                "callCount": times,
                "label": "{0}\n{1}\n{2}".format(function, percentage, times),
            },
            "position": {
                "x": 0,
                "y": 0,
            },
        })
        
    except (ValueError, AttributeError) as e:
        sys.stderr.write("Skipped {0}".format(node.get_name()));
        pass

for edge in graph.get_edge_list():
    percentage, times = tuple(
        edge.get_label().strip('"').split('\xc3')[0].split('\\n')
    )
    edges.append({
        "data": {
            "id": 'e' + str(int(edge.get_source())) + '_' +  str(int(edge.get_destination())),
            "source": edge.get_source(),
            "target": edge.get_destination(),
            "percentage": float(percentage.strip('()%')),
            "callCount" : int(times),
            "label": "{0}\n{1}x".format(percentage, times),

        }
    })

print json.dumps(
  {
    "nodes": nodes,
    "edges": edges,
  }
)

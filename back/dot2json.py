# -*- coding: utf-8 -*-

import argparse
import os
import json

import pydot


parser = argparse.ArgumentParser()
parser.add_argument('source')

args = parser.parse_args()

graph = pydot.graph_from_dot_file(args.source)


nodes = {}
for node in graph.get_node_list():
    try:
        nodes[str(node.get_name())] = {
            "EventID": int(node.get_name()), 
            "ParentEventID": list(), 
            "Class": [
                node.get_label()
            ],
            "Agent": [
                node.get_label()
            ],
            "Edge": list() 
        }
    except ValueError:
        pass

for edge in graph.get_edge_list():
    nodes[edge.get_source()]['ParentEventID'].append(edge.get_destination())

print json.dumps(
  [{
          "id": "custom.json",
          "reports":nodes.values(),
  }]
)

# -*- coding: utf-8 -*-

import argparse

from dot2jsonparser import Dot2JSONParser

argparser = argparse.ArgumentParser()
argparser.add_argument('source')
argparser.add_argument('target')

args = argparser.parse_args()

parser = Dot2JSONParser(args.source, args.target)

print parser.parse()

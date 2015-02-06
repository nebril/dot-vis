# -*- coding: utf-8 -*-

import argparse

from dot2jsonparser import Dot2JSONParser

argparser = argparse.ArgumentParser()
argparser.add_argument('source')

args = argparser.parse_args()

parser = Dot2JSONParser(args.source)

print parser.parse()

#!/usr/bin/env python
from __future__ import with_statement

import sys
from os import mkdir, remove, listdir
from os.path import isfile, isdir, join, normpath
from shutil import copy, rmtree
import subprocess
import re
from itertools import chain

"""Minifies JS and copies files to build/ directory""" 

YUI = "tools/yuicompressor-2.4.2.jar"
MINIFY_RE = re.compile(r'<!--\s*MINIFY:\s*-->((?:<script.+</script>|\s)+)<!--\s*TO:\s*(.+)-->')
SCRIPT_RE = re.compile(r'<script type="text/javascript" src="([^"]+)"></script>')

def touch_dir(path):
    if not isdir(path):
        print "Creating directory (%s)..." % path
        mkdir(path)
        
def clean(build_dir):
    if isdir(build_dir):
        print "Removing existing directory (%s)." % build_dir
        rmtree(build_dir)

def build(src_dir, build_dir):
    to_minify = {}
    
    touch_dir(build_dir)
    
    print "Writing index.html..."
    index_data = open(join(src_dir, "index.html")).read()
    def sub_minify(match):
        scripts, to_script = match.groups()
        to_src = SCRIPT_RE.match(to_script).group(1)
        for src in SCRIPT_RE.findall(scripts):
            # Minify only JS with relative paths
            if not src.startswith("http"):
                to_minify.setdefault(to_src, []).append(normpath(join(src_dir, src)))
        return to_script
    with open(join(build_dir, "index.html"), "w") as f:
        f.write(MINIFY_RE.sub(sub_minify, index_data))
    
    print "Minifying..."
    for mini_name, mini_scripts in to_minify.iteritems():
        mini_path = join(build_dir, mini_name)
        if isfile(mini_path):
            remove(mini_path)
        mini_file = open(mini_path, "a")
        for mini_script in mini_scripts:
            if isfile(mini_script):
                print "  + %s" % mini_script
                subprocess.call(["java", "-jar", YUI, mini_script],
                                stdout=mini_file)
        print "--> %s" % mini_path
        
    print "Copying data files..."
    minified_paths = set(chain(*to_minify.values()))
    for filename in listdir(src_dir):
        filepath = join(src_dir, filename)
        if not filepath == "src/index.html" and not filepath in minified_paths:
            print "  + %s" % filepath
            copy(filepath, build_dir)
    
    print "Build complete."
    
if __name__=="__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "clean":
        clean("build")
    else:
        build("src", "build")

#!/usr/bin/env python
import sys
import os, os.path
import shutil
import subprocess
from xml.dom import minidom

"""Minifies JS and copies to build/ directory""" 

join = os.path.join

def touch_dir(path):
    if not os.path.isdir(path):
        print "Creating directory {0}".format(path)
        

def clean(build_dir):
    if os.path.isdir(build_dir):
        print "Removing existing directory: {0}".format(build_dir)
        shutil.rmtree(build_dir)

def build(build_dir, minified_name):
    to_minify = []
    
    touch_dir(build_dir)
    
    print "Writing index.html"
    document = minidom.parse("src/index.html")
    mini_script = document.createElement("script")
    mini_script.setAttribute("src", minified_name)
    for script in document.getElementsByTagName("script"):
        src = script.getAttribute("src")
        
        # Minify only JS with relative paths
        if not src.startswith("http"):
            to_minify.append(join("src", src))
            script.parentNode.replaceChild(mini_script, script)
            
    document.writexml(open(join(build_dir, "index.html"), "w"))
    
    print "Minifying: {0}".format(", ".join(to_minify))
    minified_path = join(build_dir, minified_name)
    if os.path.isfile(minified_path):
        os.remove(minified_path)
    mini_file = open(minified_path, "a")
    for mini_src in to_minify:        
        subprocess.call(["java", "-jar", "tools/yuicompressor-2.4.2.jar", mini_src],
                        stdout=mini_file)
    
if __name__=="__main__":
    if len(sys.argv) == 2 and sys.argv[1] == "clean":
        clean("build")
    else:
        build("build", "xkcd_cli_all.js")
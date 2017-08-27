"""
@Fileoverview:
    This contains the main server code for the project
"""

import os

from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash

app = Flask(__name__)


@app.route('/')
def respond():
    return "<html><b>It works!</b></html>"

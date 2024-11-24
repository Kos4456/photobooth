#!/bin/bash

# open a terminal for the first application
gnome-terminal -- bash -c "cd ~/Documents/code/casino/photobooth && npm start; exec bash"

# second terminal 
gnome-terminal -- bash -c "cd ~/Documents/code/casino/photobooth && python3 scripts/image_server.py; exec bash"

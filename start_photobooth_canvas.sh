#!/bin/bash

# open a terminal for the first application
gnome-terminal -- bash -c "cd ~/Documents/casino/react-polaroid-photo-deck && npm start; exec bash"

# second terminal 
gnome-terminal -- bash -c "source flask/bin/activate && cd ~/Documents/casino/react-polaroid-photo-deck && python3 scripts/image_server.py; exec bash"

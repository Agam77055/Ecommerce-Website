#!/bin/bash

# Compile the trending.cpp program
g++ -std=c++17 trending.cpp -o trending -I../include

# Compile the user_recommend.cpp program
g++ -std=c++17 user_recommend.cpp -o user_recommend -I../include

# Make the executables
chmod +x trending
chmod +x user_recommend 
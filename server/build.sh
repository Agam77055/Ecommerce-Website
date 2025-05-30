#!/bin/bash

# Install nlohmann-json if not already installed
if [ ! -d "include" ]; then
    mkdir -p include
    curl -L https://github.com/nlohmann/json/releases/download/v3.11.3/json.hpp -o include/json.hpp
fi

# Compile C++ executables
cd cpp_algorithms
g++ -std=c++17 trending.cpp -o trending -I../include
g++ -std=c++17 user_recommend.cpp -o user_recommend -I../include
g++ -std=c++17 search.cpp -o search -I../include
g++ -std=c++17 fav_category.cpp -o fav_category -I../include
g++ -std=c++17 brought_together.cpp -o brought_together -I../include

# Make executables
chmod +x trending
chmod +x user_recommend
chmod +x search
chmod +x fav_category
chmod +x brought_together

cd ..

# Install Node.js dependencies
npm install 
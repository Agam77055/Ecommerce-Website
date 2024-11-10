#include <iostream>
#include <fstream>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <set>
#include <string>
#include "../include/nlohmann/json.hpp"  // Include JSON for Modern C++ library
#include <algorithm>  // For transform() and tolower()

using namespace std;
using json = nlohmann::json;

// Structure to store product information
struct Product {
    int key;
    string name;
    string category;
    int reviews;
};

// Trie Node Structure
struct TrieNode {
    unordered_map<char, TrieNode*> children;
    set<pair<int, int>> products;  // (popularity, product key) instead of (popularity, product name)
    bool isEndOfWord = false;
};

// Trie Class for Product Search
class Trie {
public:
    TrieNode* root;
    
    Trie() {
        root = new TrieNode();
    }
    
    // Helper function to convert string to lowercase
    static string toLowerCase(const string& str) {
        string lowerStr = str;
        transform(lowerStr.begin(), lowerStr.end(), lowerStr.begin(), ::tolower);
        return lowerStr;
    }

    // Insert product name with popularity into the Trie (case-insensitive)
    void insert(const string& product, int popularity, int productId) {
        string lowerProduct = toLowerCase(product);  // Convert to lowercase
        TrieNode* node = root;
        for (char c : lowerProduct) {
            if (!node->children[c]) {
                node->children[c] = new TrieNode();
            }
            node = node->children[c];
            node->products.insert({-popularity, productId});  // Insert product ID with popularity
        }
        node->isEndOfWord = true;
    }

    // Time Complexity: O(mlogk)
    // m: length of product name, k: the number of products stored at the Trie node corresponding to the prefix.
    
    // Search for products by prefix and return top 5-10 product IDs (case-insensitive)
    vector<int> searchByPrefix(const string& prefix) const {
        string lowerPrefix = toLowerCase(prefix);  // Convert to lowercase
        TrieNode* node = root;
        for (char c : lowerPrefix) {
            if (!node->children[c]) return {};  // Prefix not found
            node = node->children[c];
        }

        vector<int> results;
        for (const auto& product : node->products) {
            results.push_back(product.second);  // Push product ID instead of name
            if (results.size() >= 10) break;
        }
        return results;
    }

    // Time ComplexityL O(p + 10logk)
    // p: length of prefix, k is the number of products stored at the Trie node corresponding to the prefix
    // 10 becuase we are finding top 10 products
};

// Function to populate products from a JSON file
vector<Product> populateProductsFromJson(const string& filename) {
    vector<Product> products;
    ifstream inputFile(filename);
    if (!inputFile.is_open()) {
        cerr << "Error opening file: " << filename << endl;
        return products;
    }

    json dataset;
    inputFile >> dataset; // Parse JSON data from file

    for (const auto& entry : dataset) {
        Product product;
        product.key = entry.at("key").get<int>();
        product.name = entry.at("name").get<string>();
        product.category = entry.at("category").get<string>();
        product.reviews = entry.at("reviews").get<int>();
        products.push_back(product);
    }

    return products;
}

// Function to serialize product IDs to JSON format instead of names
json serializeResultsToJson(const string& searchTerm, const vector<int>& productIds) {
    return json{{"searchTerm", searchTerm}, {"recommendations", productIds}};
}

int main(int argc, char* argv[]) {
    // Check for arguments
    if (argc < 2) {
        cerr << "Usage: " << argv[0] << " <searchTerm>" << endl;
        return 1;
    }
    
    string searchTerm = argv[1];  // Take search term from command line
    
    string filename = "dataset/MOCK_DATA.json";  // JSON file path for products
    vector<Product> products = populateProductsFromJson(filename);

    // Create Trie and insert products (case-insensitive)
    Trie trie;
    for (const auto& product : products) {
        trie.insert(product.name, product.reviews, product.key);  // Insert product ID instead of name
    }

    // Perform the search (case-insensitive)
    vector<int> results = trie.searchByPrefix(searchTerm);
    
    // Convert the results to JSON format and output to standard output (stdout)
    json result = serializeResultsToJson(searchTerm, results);
    cout << result.dump(4) << endl;  // Indented JSON output

    return 0;
}

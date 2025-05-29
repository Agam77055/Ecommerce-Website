#include <iostream>
#include <fstream>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <set>
#include <string>
#include "../include/nlohmann/json.hpp"
#include <algorithm>
#include <curl/curl.h>
#include <sstream>

using namespace std;
using json = nlohmann::json;

// Structure to store product information
struct Product {
    int key;
    string name;
    string category;
    double rating;
    int stock;
    double price;
    string image;
    string description;
    string brand;
    double discountPercentage;

    // Default constructor
    Product() : key(0), rating(0.0), stock(0), price(0.0), discountPercentage(0.0) {}

    Product(int k, const string& n, const string& cat, double r, int s, double p,
            const string& img, const string& d, const string& b, double dp) 
        : key(k), name(n), category(cat), rating(r), stock(s), price(p),
          image(img), description(d), brand(b), discountPercentage(dp) {}
};

// Enhanced Trie Node Structure
struct TrieNode {
    unordered_map<char, TrieNode*> children;
    set<pair<int, int>> products;  // (popularity, product key)
    bool isEndOfWord = false;
};

// Enhanced Trie Class with multiple indexing strategies
class EnhancedTrie {
public:
    TrieNode* root;
    unordered_map<int, Product> productMap;  // Store actual product data
    
    EnhancedTrie() {
        root = new TrieNode();
    }
    
    // Helper function to convert string to lowercase
    static string toLowerCase(const string& str) {
        string lowerStr = str;
        transform(lowerStr.begin(), lowerStr.end(), lowerStr.begin(), ::tolower);
        return lowerStr;
    }

    // Helper function to split string into words
    static vector<string> splitWords(const string& str) {
        vector<string> words;
        stringstream ss(str);
        string word;
        while (ss >> word) {
            // Remove punctuation
            word.erase(remove_if(word.begin(), word.end(), 
                [](char c) { return !isalnum(c); }), word.end());
            if (!word.empty()) {
                words.push_back(toLowerCase(word));
            }
        }
        return words;
    }

    // Insert a single term into the trie
    void insertTerm(const string& term, int popularity, int productId) {
        string lowerTerm = toLowerCase(term);
        TrieNode* node = root;
        for (char c : lowerTerm) {
            if (!node->children[c]) {
                node->children[c] = new TrieNode();
            }
            node = node->children[c];
            node->products.insert({-popularity, productId});
        }
        node->isEndOfWord = true;
    }

    // Enhanced insert function that indexes multiple aspects of a product
    void insertProduct(const Product& product) {
        productMap[product.key] = product;
        int popularity = static_cast<int>(product.rating * 100);
        
        // 1. Index full product name
        insertTerm(product.name, popularity, product.key);
        
        // 2. Index individual words from product name
        vector<string> nameWords = splitWords(product.name);
        for (const string& word : nameWords) {
            insertTerm(word, popularity, product.key);
        }
        
        // 3. Index brand
        if (!product.brand.empty()) {
            insertTerm(product.brand, popularity, product.key);
        }
        
        // 4. Index category
        if (!product.category.empty()) {
            insertTerm(product.category, popularity, product.key);
        }
        
        // 5. Index words from description (optional - might make search too broad)
        vector<string> descWords = splitWords(product.description);
        for (const string& word : descWords) {
            if (word.length() > 3) {  // Only index longer words from description
                insertTerm(word, popularity / 2, product.key);  // Lower priority for description matches
            }
        }
    }

    // Search for products by prefix
    vector<int> searchByPrefix(const string& prefix) const {
        string lowerPrefix = toLowerCase(prefix);
        TrieNode* node = root;
        for (char c : lowerPrefix) {
            if (!node->children[c]) return {};
            node = node->children[c];
        }

        set<int> uniqueResults;  // Use set to avoid duplicates
        for (const auto& product : node->products) {
            uniqueResults.insert(product.second);
            if (uniqueResults.size() >= 15) break;  // Get more results to filter later
        }
        
        return vector<int>(uniqueResults.begin(), uniqueResults.end());
    }

    // Advanced search that combines multiple strategies
    vector<int> advancedSearch(const string& query) const {
        vector<string> queryWords = splitWords(query);
        map<int, double> productScores;  // product_id -> relevance score
        
        // Strategy 1: Direct prefix match on full query
        vector<int> directResults = searchByPrefix(query);
        for (int productId : directResults) {
            productScores[productId] += 10.0;  // High score for direct matches
        }
        
        // Strategy 2: Search for each word in the query
        for (const string& word : queryWords) {
            vector<int> wordResults = searchByPrefix(word);
            for (int productId : wordResults) {
                productScores[productId] += 5.0;  // Medium score for word matches
            }
        }
        
        // Strategy 3: Fuzzy matching (simple edit distance for short queries)
        if (query.length() <= 8) {
            for (const auto& [productId, product] : productMap) {
                if (isApproximateMatch(query, product.name) ||
                    isApproximateMatch(query, product.brand) ||
                    isApproximateMatch(query, product.category)) {
                    productScores[productId] += 2.0;  // Lower score for fuzzy matches
                }
            }
        }
        
        // Convert to sorted vector
        vector<pair<double, int>> scoredResults;
        for (const auto& [productId, score] : productScores) {
            // Boost score based on product rating
            double finalScore = score + (productMap.at(productId).rating * 0.5);
            scoredResults.push_back({finalScore, productId});
        }
        
        sort(scoredResults.rbegin(), scoredResults.rend());  // Sort by score descending
        
        vector<int> results;
        int maxResults = 10;
        
        // If searching for a category, return more results
        bool isCategorySearch = false;
        for (const auto& [productId, product] : productMap) {
            if (toLowerCase(product.category) == toLowerCase(query)) {
                isCategorySearch = true;
                maxResults = 50; // Return up to 50 products for category searches
                break;
            }
        }
        
        for (const auto& [score, productId] : scoredResults) {
            results.push_back(productId);
            if (results.size() >= maxResults) break;
        }
        
        return results;
    }

    // Dedicated method to get ALL products in a specific category
    vector<int> searchByCategory(const string& category) const {
        vector<pair<double, int>> categoryProducts;
        string lowerCategory = toLowerCase(category);
        
        for (const auto& [productId, product] : productMap) {
            if (toLowerCase(product.category) == lowerCategory) {
                double score = product.rating * 10; // Score based on rating
                categoryProducts.push_back({score, productId});
            }
        }
        
        sort(categoryProducts.rbegin(), categoryProducts.rend()); // Sort by score descending
        
        vector<int> results;
        for (const auto& [score, productId] : categoryProducts) {
            results.push_back(productId);
        }
        
        return results;
    }

private:
    // Simple fuzzy matching for short strings
    bool isApproximateMatch(const string& query, const string& target) const {
        string lowerQuery = toLowerCase(query);
        string lowerTarget = toLowerCase(target);
        
        // Check if query is a substring of target
        if (lowerTarget.find(lowerQuery) != string::npos) {
            return true;
        }
        
        // Simple edit distance check (only for short queries)
        if (lowerQuery.length() <= 4) {
            return editDistance(lowerQuery, lowerTarget) <= 1;
        }
        
        return false;
    }
    
    // Simple edit distance calculation
    int editDistance(const string& s1, const string& s2) const {
        if (s1.length() > s2.length()) return editDistance(s2, s1);
        
        vector<int> prev(s1.length() + 1);
        vector<int> curr(s1.length() + 1);
        
        for (int i = 0; i <= s1.length(); i++) prev[i] = i;
        
        for (int i = 1; i <= s2.length(); i++) {
            curr[0] = i;
            for (int j = 1; j <= s1.length(); j++) {
                if (s1[j-1] == s2[i-1]) {
                    curr[j] = prev[j-1];
                } else {
                    curr[j] = 1 + min({prev[j], curr[j-1], prev[j-1]});
                }
            }
            prev = curr;
        }
        
        return prev[s1.length()];
    }
};

// Function to read products from stdin
vector<Product> readProductsFromStdin() {
    vector<Product> products;
    string input;
    getline(cin, input);
    
    cerr << "Received input length: " << input.length() << endl;
    
    try {
        json data = json::parse(input);
        cerr << "Successfully parsed JSON" << endl;
        
        if (data.is_array()) {
            cerr << "Input is an array with " << data.size() << " elements" << endl;
            
            for (const auto& entry : data) {
                try {
                    Product product(
                        entry["id"].get<int>(),
                        entry["title"].get<string>(),
                        entry["category"].get<string>(),
                        entry["rating"].get<double>(),
                        entry["stock"].get<int>(),
                        entry["price"].get<double>(),
                        entry["thumbnail"].get<string>(),
                        entry["description"].get<string>(),
                        entry["brand"].get<string>(),
                        entry["discountPercentage"].get<double>()
                    );
                    products.push_back(product);
                } catch (const exception& e) {
                    cerr << "Error parsing product: " << e.what() << endl;
                }
            }
        }
    } catch (const exception& e) {
        cerr << "Error parsing input: " << e.what() << endl;
    }
    
    cerr << "Total products parsed: " << products.size() << endl;
    return products;
}

// Function to serialize product IDs to JSON format
json serializeResultsToJson(const string& searchTerm, const vector<int>& productIds) {
    return json{{"searchTerm", searchTerm}, {"recommendations", productIds}};
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        cerr << "Usage: " << argv[0] << " <searchTerm>" << endl;
        return 1;
    }
    
    string searchTerm = argv[1];
    vector<Product> products = readProductsFromStdin();

    if (products.empty()) {
        cerr << "No products read from input" << endl;
        return 1;
    }

    // Create Enhanced Trie and insert products
    EnhancedTrie trie;
    for (const auto& product : products) {
        trie.insertProduct(product);
    }

    // Perform advanced search
    vector<int> results = trie.advancedSearch(searchTerm);
    
    // Convert the results to JSON format and output
    json result = serializeResultsToJson(searchTerm, results);
    cout << result.dump(4) << endl;

    return 0;
}
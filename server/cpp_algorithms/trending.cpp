#include <iostream>
#include <fstream>
#include <queue>
#include <vector>
#include <unordered_map>
#include <string>
#include "../include/nlohmann/json.hpp"

using namespace std;
using json = nlohmann::json;

// Structure to store product information
struct Product {
    int key;
    string name;
    string model;
    string description;
    int mrp;
    int price;
    string image;
    string brand;
    string category;
    int reviews;
    int rating;
    int purchase_count = 0;  // New field to track purchase count

    Product(int k, const string& n, const string& m, const string& d, int mrp_, int p,
            const string& img, const string& b, const string& cat, int rev, int r) 
        : key(k), name(n), model(m), description(d), mrp(mrp_), price(p), image(img), brand(b), 
          category(cat), reviews(rev), rating(r) {}

    // Overload the less-than operator to use purchase count for max-heap ordering
    bool operator<(const Product& other) const {
        // Priority by purchase count first, then by rating
        if (purchase_count == other.purchase_count) {
            return rating < other.rating;
        }
        return purchase_count < other.purchase_count;
    }

    // Convert Product to JSON
    json toJson() const {
        return {
            {"key", key},
            {"name", name},
            {"model", model},
            {"description", description},
            {"mrp", mrp},
            {"price", price},
            {"image", image},
            {"brand", brand},
            {"category", category},
            {"reviews", reviews},
            {"rating", rating},
            {"purchase_count", purchase_count}
        };
    }
};

// Structure to store user information
struct User {
    int user_id;
    string name;
    int age;
    string country;
    string gender;
};

// Function to recommend top products
// Time Complexity: O(topN * log n)
vector<Product> recommendTopProducts(priority_queue<Product> maxHeap, int topN) {
    vector<Product> topProducts;
    for (int i = 0; i < topN && !maxHeap.empty(); ++i) {
        topProducts.push_back(maxHeap.top());
        maxHeap.pop();
    }
    return topProducts;
}

// Function to load products from a JSON file
vector<Product> loadProductsFromFile(const string& filename) {
    ifstream file(filename);
    json productsJson;
    file >> productsJson;

    vector<Product> products;
    for (const auto& item : productsJson) {
        Product product = {
            item["key"],
            item["name"],
            item["model"],
            item["description"],
            item["mrp"],
            item["price"],
            item["image"],
            item["brand"],
            item["category"],
            item["reviews"],
            item["rating"]
        };
        products.push_back(product);
    }
    return products;
}

// Function to load transaction data from a JSON file
unordered_map<int, int> loadTransactionData(const string& filename) {
    ifstream file(filename);
    if (!file.is_open()) {
        cerr << "Error opening transactions file: " << filename << endl;
        return {};
    }

    json transactionsJson;
    file >> transactionsJson;
    file.close();

    // Dictionary to hold purchase counts for each product
    unordered_map<int, int> purchaseCount;

    for (const auto& transaction : transactionsJson) {
        int userId;
        if (transaction["user"].is_number()) {
            userId = transaction["user"];
        } else if (transaction["user"].is_string()) {
            userId = stoi(transaction["user"].get<string>());
        } else {
            cerr << "Invalid user ID format in transactions." << endl;
            continue;
        }

        for (const auto& product : transaction["product"]) {
            int productId;
            if (product.is_number()) {
                productId = product;
            } else if (product.is_string()) {
                productId = stoi(product.get<string>());
            } else {
                cerr << "Invalid product ID format in transactions." << endl;
                continue;
            }
            purchaseCount[productId]++;
        }
    }

    return purchaseCount;
}

// Function to build a max-heap per category
unordered_map<string, priority_queue<Product>> buildHeapPerCategory(const vector<Product>& products) {
    unordered_map<string, priority_queue<Product>> categoryHeaps;

    for (const auto& product : products) {
        categoryHeaps[product.category].push(product);
    }

    return categoryHeaps;
}

// Main function to output recommendations in JSON format
int main(int argc, char* argv[]) {
    // Check if category is provided as a command-line argument
    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <category>" << endl;
        return 1;
    }

    string targetCategory = argv[1];

    // Load product data from JSON files
    vector<Product> products = loadProductsFromFile("dataset/MOCK_DATA.json");

    // Load transaction data
    auto transactionCount = loadTransactionData("dataset/dummy2.json");

    // Update products with purchase counts
    for (auto& product : products) {
        if (transactionCount.find(product.key) != transactionCount.end()) {
            product.purchase_count = transactionCount[product.key];
        }
    }

    // Global max-heap for all products
    // Time Complexity: O(m * log m)
    priority_queue<Product> globalHeap;
    for (const auto& product : products) {
        globalHeap.push(product);
    }

    // Get top 15 trending products
    // Time Complexity: O(15 * log m)
    int globalTopN = 15;
    vector<Product> topProducts = recommendTopProducts(globalHeap, globalTopN);

    // Build max-heaps per category
    auto categoryHeaps = buildHeapPerCategory(products);

    // Get top 10 products in the specified category if any products exist in that category
    int categoryTopN = 10;
    vector<Product> topCategoryProducts;
    if (categoryHeaps.find(targetCategory) != categoryHeaps.end()) {
        topCategoryProducts = recommendTopProducts(categoryHeaps[targetCategory], categoryTopN);
    }

    // Prepare output JSON with only product keys
    json outputJson;

    // Add global trending product keys
    outputJson["global_trending"] = json::array();
    for (const auto& product : topProducts) {
        outputJson["global_trending"].push_back(product.key);  // Only push the product key
    }

    // Add category trending product keys only if there are any for the specified category
    if (!topCategoryProducts.empty()) {
        outputJson["category_trending"] = json::array();
        for (const auto& product : topCategoryProducts) {
            outputJson["category_trending"].push_back(product.key);  // Only push the product key
        }
    }

    // Output JSON to stdout
    cout << outputJson.dump(4) << endl;  // Pretty-print with 4-space indentation

    return 0;
}

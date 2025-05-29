#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <queue>
#include <algorithm>
#include <sstream>
#include <nlohmann/json.hpp>

using namespace std;
using json = nlohmann::json;

struct Product {
    string id;
    string name;
    string description;
    double price;
    vector<string> tags;
    double rating;
    int purchaseCount;

    bool operator<(const Product& other) const {
        return purchaseCount < other.purchaseCount;
    }
};

struct User {
    string id;
    vector<string> purchasedProducts;
};

// Custom comparator for priority queue (max heap based on score)
struct ProductComparator {
    bool operator()(const pair<double, const Product*>& a, const pair<double, const Product*>& b) const {
        if (abs(a.first - b.first) < 0.001) { // Handle floating point comparison
            // If scores are equal, prioritize by purchase count, then by rating
            if (a.second->purchaseCount == b.second->purchaseCount) {
                return a.second->rating < b.second->rating;
            }
            return a.second->purchaseCount < b.second->purchaseCount;
        }
        return a.first < b.first; // Max heap: higher scores first
    }
};

class TrendingProducts {
private:
    vector<Product> products;
    unordered_map<string, int> purchaseCounts;
    unordered_map<string, vector<const Product*>> tagToProducts;

    void loadProductsFromJson(const json& productsJson) {
        products.clear();
        for (const auto& product : productsJson) {
            Product p;
            
            // Handle both _id and id fields for compatibility
            if (product.contains("_id")) {
                p.id = product["_id"].get<string>();
            } else if (product.contains("id")) {
                p.id = to_string(product["id"].get<int>());
            } else {
                continue; // Skip products without ID
            }
            
            p.name = product["name"].get<string>();
            p.description = product["description"].get<string>();
            p.price = product["price"].get<double>();
            p.rating = product["rating"].get<double>();
            p.purchaseCount = 0;

            // Handle tags array - make sure we get all tags
            if (product.contains("tags") && product["tags"].is_array() && !product["tags"].empty()) {
                for (const auto& tag : product["tags"]) {
                    if (tag.is_string()) {
                        string tagStr = tag.get<string>();
                        if (!tagStr.empty()) {
                            p.tags.push_back(tagStr);
                        }
                    }
                }
            } else {
                // If no tags provided, create tags from other fields as fallback
                // This shouldn't happen if server sends proper data
                cerr << "Warning: No tags found for product " << p.id << endl;
            }

            products.push_back(p);
            
            // Debug: Print product tags to stderr for debugging
            cerr << "Product " << p.id << " (" << p.name << ") has " << p.tags.size() << " tags: ";
            for (const auto& tag : p.tags) {
                cerr << "'" << tag << "' ";
            }
            cerr << endl;
        }
    }

    void loadTransactionData(const json& transactionsJson) {
        purchaseCounts.clear();
        
        for (const auto& transaction : transactionsJson) {
            if (transaction.contains("productIds") && transaction["productIds"].is_string()) {
                // Handle comma-separated string format
                string productIds = transaction["productIds"].get<string>();
                istringstream iss(productIds);
                string productId;
                
                while (getline(iss, productId, ',')) {
                    // Trim whitespace
                    productId.erase(0, productId.find_first_not_of(" \t"));
                    productId.erase(productId.find_last_not_of(" \t") + 1);
                    if (!productId.empty()) {
                        purchaseCounts[productId]++;
                    }
                }
            } else if (transaction.contains("product") && transaction["product"].is_string()) {
                // Handle the format from your server (comma-separated in "product" field)
                string productIds = transaction["product"].get<string>();
                istringstream iss(productIds);
                string productId;
                
                while (getline(iss, productId, ',')) {
                    // Trim whitespace
                    productId.erase(0, productId.find_first_not_of(" \t"));
                    productId.erase(productId.find_last_not_of(" \t") + 1);
                    if (!productId.empty()) {
                        purchaseCounts[productId]++;
                    }
                }
            }
        }

        // Update product purchase counts
        for (auto& product : products) {
            product.purchaseCount = purchaseCounts[product.id];
        }
    }

    void buildTagToProductsMap() {
        tagToProducts.clear();
        for (const auto& product : products) {
            for (const auto& tag : product.tags) {
                tagToProducts[tag].push_back(&product);
            }
        }
        
        // Debug: Print tag mapping for debugging
        cerr << "Built tag map with " << tagToProducts.size() << " tags:" << endl;
        for (const auto& [tag, products] : tagToProducts) {
            cerr << "Tag '" << tag << "' has " << products.size() << " products" << endl;
        }
    }

    vector<string> getTopProductsByScore(const vector<const Product*>& productList, int limit = -1) {
        priority_queue<pair<double, const Product*>, 
                      vector<pair<double, const Product*>>, 
                      ProductComparator> pq;
        
        for (const auto* product : productList) {
            double score = (product->purchaseCount * 0.7) + (product->rating * 0.3);
            pq.push({score, product});
        }

        vector<string> result;
        int count = 0;
        while (!pq.empty() && (limit == -1 || count < limit)) {
            auto [score, product] = pq.top();
            pq.pop();
            result.push_back(product->id);
            count++;
        }
        
        return result;
    }

public:
    TrendingProducts() {}

    void getTrendingProducts(const string& tag = "") {
        // Load data from stdin
        json input;
        try {
            cin >> input;
        } catch (const exception& e) {
            json errorResponse;
            errorResponse["error"] = "Invalid JSON input";
            errorResponse["type"] = tag.empty() ? "global" : "tag";
            if (!tag.empty()) {
                errorResponse["tag"] = tag;
            }
            cout << errorResponse.dump(2) << endl;
            return;
        }
        
        if (!input.contains("products") || !input.contains("transactions")) {
            json errorResponse;
            errorResponse["error"] = "Missing products or transactions data";
            errorResponse["type"] = tag.empty() ? "global" : "tag";
            if (!tag.empty()) {
                errorResponse["tag"] = tag;
            }
            cout << errorResponse.dump(2) << endl;
            return;
        }

        loadProductsFromJson(input["products"]);
        loadTransactionData(input["transactions"]);
        buildTagToProductsMap();

        // Prepare response
        json response;
        
        if (tag.empty()) {
            // Global trending - top 10 products
            vector<const Product*> allProducts;
            for (const auto& product : products) {
                allProducts.push_back(&product);
            }
            
            vector<string> globalProductIds = getTopProductsByScore(allProducts, 10);
            response["global_trending"] = globalProductIds;
            response["type"] = "global";
        } else {
            // Tag-wise trending - all products for the tag
            cerr << "Searching for tag: '" << tag << "'" << endl;
            if (tagToProducts.find(tag) != tagToProducts.end()) {
                vector<string> tagProductIds = getTopProductsByScore(tagToProducts[tag]);
                cerr << "Found " << tagProductIds.size() << " products for tag '" << tag << "'" << endl;
                response["tag_trending"] = tagProductIds;
                response["type"] = "tag";
                response["tag"] = tag;
            } else {
                cerr << "Tag '" << tag << "' not found in tagToProducts map" << endl;
                response["tag_trending"] = json::array();
                response["type"] = "tag";
                response["tag"] = tag;
                response["error"] = "Tag not found";
            }
        }

        // Output the response
        cout << response.dump(2) << endl;
    }
};

int main(int argc, char* argv[]) {
    // Disable stdout buffering for immediate output
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    cout.tie(NULL);
    
    TrendingProducts trending;
    
    if (argc > 1) {
        trending.getTrendingProducts(argv[1]);
    } else {
        trending.getTrendingProducts();
    }
    
    return 0;
}
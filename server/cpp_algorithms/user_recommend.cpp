#include <iostream>
#include <fstream>
#include <vector>
#include <unordered_map>
#include <unordered_set>
#include <string>
#include "../include/nlohmann/json.hpp"

using namespace std;
using json = nlohmann::json;

// Structure to store product information
struct Product {
    string id;
    string name;
    string description;
    double price;
    double rating;
    vector<string> tags;

    Product(const string& i, const string& n, const string& d, double p, double r, const vector<string>& t) 
        : id(i), name(n), description(d), price(p), rating(r), tags(t) {}
};

// Function to load data from stdin
pair<vector<Product>, unordered_map<string, vector<string>>> loadDataFromStdin() {
    json inputJson;
    std::cin >> inputJson;
    
    vector<Product> products;
    unordered_map<string, vector<string>> userPurchases;

    // Load products
    for (const auto& item : inputJson["products"]) {
        Product product(
            item["_id"].get<string>(),
            item["name"].get<string>(),
            item["description"].get<string>(),
            item["price"].get<double>(),
            item["rating"].get<double>(),
            item["tags"].get<vector<string>>()
        );
        products.push_back(product);
    }

    // Load user purchases
    for (const auto& transaction : inputJson["transactions"]) {
        string userId = transaction["userId"].get<string>();
        string productId = transaction["productId"].get<string>();
        userPurchases[userId].push_back(productId);
    }

    return {products, userPurchases};
}

// Function to get product recommendations for a user
vector<string> getRecommendations(const string& userId, 
                                const unordered_map<string, vector<string>>& userPurchases,
                                const vector<Product>& products) {
    // Get user's purchase history
    auto it = userPurchases.find(userId);
    const vector<string>& userHistory = (it != userPurchases.end()) ? it->second : vector<string>();
    unordered_set<string> purchasedProducts(userHistory.begin(), userHistory.end());

    // Try tag-based recommendations first
    if (!userHistory.empty()) {
        // Find products with similar tags as user's purchases
        unordered_map<string, int> tagCount;
        for (const string& productId : userHistory) {
            for (const auto& product : products) {
                if (product.id == productId) {
                    for (const string& tag : product.tags) {
                        tagCount[tag]++;
                    }
                    break;
                }
            }
        }

        // Get top tags
        vector<pair<string, int>> sortedTags(tagCount.begin(), tagCount.end());
        sort(sortedTags.begin(), sortedTags.end(),
             [](const auto& a, const auto& b) { return a.second > b.second; });

        // Recommend products with similar tags that user hasn't purchased
        vector<string> recommendations;
        for (const auto& [tag, _] : sortedTags) {
            for (const auto& product : products) {
                if (find(product.tags.begin(), product.tags.end(), tag) != product.tags.end() && 
                    purchasedProducts.find(product.id) == purchasedProducts.end()) {
                    recommendations.push_back(product.id);
                    if (recommendations.size() >= 10) {
                        return recommendations;
                    }
                }
            }
        }

        // If we got some recommendations, return them
        if (!recommendations.empty()) {
            return recommendations;
        }
    }

    // Fallback: Recommend top-rated products that user hasn't purchased
    vector<pair<string, double>> productRatings;
    for (const auto& product : products) {
        if (purchasedProducts.find(product.id) == purchasedProducts.end()) {
            productRatings.push_back({product.id, product.rating});
        }
    }

    // Sort by rating
    sort(productRatings.begin(), productRatings.end(),
         [](const auto& a, const auto& b) { return a.second > b.second; });

    // Take top 10
    vector<string> recommendations;
    for (const auto& [id, _] : productRatings) {
        recommendations.push_back(id);
        if (recommendations.size() >= 10) {
            break;
        }
    }

    return recommendations;
}

int main(int argc, char* argv[]) {
    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <userId>" << endl;
        return 1;
    }

    string userId = argv[1];

    // Load data from stdin
    auto [products, userPurchases] = loadDataFromStdin();

    // Get recommendations
    vector<string> recommendations = getRecommendations(userId, userPurchases, products);

    // Output recommendations in JSON format
    json outputJson;
    outputJson["userId"] = userId;
    outputJson["recommendations"] = recommendations;
    cout << outputJson.dump(4) << endl;

    return 0;
}

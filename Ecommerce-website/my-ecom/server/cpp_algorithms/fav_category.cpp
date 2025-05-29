#include <iostream>
#include <fstream>
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
    string description;
    double price;
    string image;
    string brand;
    string category;
    double rating;
    int stock;
    double discountPercentage;

    Product(int k, const string& n, const string& d, double p, const string& img,
            const string& b, const string& cat, double r, int s, double dp) 
        : key(k), name(n), description(d), price(p), image(img), brand(b), 
          category(cat), rating(r), stock(s), discountPercentage(dp) {}
};

// Function to load products from stdin
vector<Product> loadProductsFromStdin() {
    json productsJson;
    std::cin >> productsJson;
    vector<Product> products;
    for (const auto& item : productsJson) {
        Product product(
            item["id"].get<int>(),
            item["title"].get<string>(),
            item["description"].get<string>(),
            item["price"].get<double>(),
            item["thumbnail"].get<string>(),
            item["brand"].get<string>(),
            item["category"].get<string>(),
            item["rating"].get<double>(),
            item["stock"].get<int>(),
            item["discountPercentage"].get<double>()
        );
        products.push_back(product);
    }
    return products;
}

// Function to load user purchase history
unordered_map<int, vector<int>> loadUserPurchaseHistory(const string& filename) {
    ifstream file(filename);
    if (!file.is_open()) {
        cerr << "Error opening user purchases file: " << filename << endl;
        return {};
    }

    json purchasesJson;
    file >> purchasesJson;
    file.close();

    unordered_map<int, vector<int>> userPurchases;

    for (const auto& purchase : purchasesJson) {
        int userId = purchase["user_id"].get<int>();
        for (const auto& product : purchase["purchased_products"]) {
            int productId = product["product_id"].get<int>();
            userPurchases[userId].push_back(productId);
        }
    }

    return userPurchases;
}

// Function to find favorite categories for a user
vector<pair<string, int>> findFavoriteCategories(int userId, 
    const unordered_map<int, vector<int>>& userPurchases,
    const vector<Product>& products) {
    
    // Get user's purchase history
    auto it = userPurchases.find(userId);
    if (it == userPurchases.end()) {
        return {};
    }
    const vector<int>& userHistory = it->second;
    if (userHistory.empty()) {
        return {};
    }

    // Count purchases per category
    unordered_map<string, int> categoryCount;
    for (int productId : userHistory) {
        for (const auto& product : products) {
            if (product.key == productId) {
                categoryCount[product.category]++;
                break;
            }
        }
    }

    // Convert to vector and sort by count
    vector<pair<string, int>> sortedCategories(categoryCount.begin(), categoryCount.end());
    sort(sortedCategories.begin(), sortedCategories.end(),
         [](const auto& a, const auto& b) { return a.second > b.second; });

    return sortedCategories;
}

int main(int argc, char* argv[]) {
    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <userId>" << endl;
        return 1;
    }

    int userId = stoi(argv[1]);

    // Load products from stdin
    vector<Product> products = loadProductsFromStdin();

    // Load user purchase history
    auto userPurchases = loadUserPurchaseHistory("dataset/user_purchases.json");

    // Find favorite categories
    vector<pair<string, int>> favoriteCategories = findFavoriteCategories(userId, userPurchases, products);

    // Output results in JSON format
    json outputJson;
    outputJson["userId"] = userId;
    outputJson["favorite_categories"] = json::array();
    
    for (const auto& [category, count] : favoriteCategories) {
        outputJson["favorite_categories"].push_back({
            {"category", category},
            {"purchase_count", count}
        });
    }

    cout << outputJson.dump(4) << endl;

    return 0;
}

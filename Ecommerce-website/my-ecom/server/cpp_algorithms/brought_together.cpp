#include <iostream>
#include <fstream>
#include <vector>
#include <unordered_map>
#include <string>
#include <algorithm>
#include "../include/nlohmann/json.hpp"
#include <sstream>

using namespace std;
using json = nlohmann::json;

// Structure to store product information
struct Product {
    int id;
    string title;
    string description;
    double price;
    string thumbnail;
    string brand;
    string category;
    double rating;
    int stock;
    double discountPercentage;
    vector<string> images;
    vector<string> tags;

    Product(int i, const string& t, const string& d, double p, const string& img,
            const string& b, const string& cat, double r, int s, double dp,
            const vector<string>& imgs, const vector<string>& tgs) 
        : id(i), title(t), description(d), price(p), thumbnail(img), brand(b), 
          category(cat), rating(r), stock(s), discountPercentage(dp),
          images(imgs), tags(tgs) {}
};

// Function to load products from json
vector<Product> loadProductsFromJson(const json& inputJson) {
    vector<Product> products;
    const json& productsJson = inputJson["products"];
    for (const auto& item : productsJson) {
        vector<string> images;
        if (item.contains("images") && item["images"].is_array()) {
            for (const auto& img : item["images"]) {
                images.push_back(img.get<string>());
            }
        }
        vector<string> tags;
        if (item.contains("tags") && item["tags"].is_array()) {
            for (const auto& tag : item["tags"]) {
                tags.push_back(tag.get<string>());
            }
        }
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
            item["discountPercentage"].get<double>(),
            images,
            tags
        );
        products.push_back(product);
    }
    return products;
}

// Function to find frequently bought together products
vector<int> findFrequentlyBoughtTogether(int productId, const json& inputJson) {
    unordered_map<int, int> coOccurrenceCount;
    const json& purchasesJson = inputJson["purchases"];
    for (const auto& purchase : purchasesJson) {
        string userId = purchase["user"].get<string>();
        string productString = purchase["product"].get<string>();
        vector<int> purchasedProducts;
        size_t pos = 0;
        string token;
        string productStr = productString;
        while ((pos = productStr.find(',')) != string::npos) {
            token = productStr.substr(0, pos);
            purchasedProducts.push_back(stoi(token));
            productStr.erase(0, pos + 1);
        }
        if (!productStr.empty()) {
            purchasedProducts.push_back(stoi(productStr));
        }
        bool hasTargetProduct = false;
        for (int pid : purchasedProducts) {
            if (pid == productId) {
                hasTargetProduct = true;
                break;
            }
        }
        if (hasTargetProduct) {
            for (int pid : purchasedProducts) {
                if (pid != productId) {
                    coOccurrenceCount[pid]++;
                }
            }
        }
    }
    vector<pair<int, int>> sortedProducts(coOccurrenceCount.begin(), coOccurrenceCount.end());
    sort(sortedProducts.begin(), sortedProducts.end(),
         [](const auto& a, const auto& b) { return a.second > b.second; });
    vector<int> recommendations;
    for (const auto& [pid, _] : sortedProducts) {
        recommendations.push_back(pid);
        if (recommendations.size() >= 10) {
            break;
        }
    }
    return recommendations;
}

int main(int argc, char* argv[]) {
    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <productId>" << endl;
        return 1;
    }
    int productId = stoi(argv[1]);

    // Read all of stdin into a string
    std::ostringstream oss;
    oss << std::cin.rdbuf();
    std::string inputStr = oss.str();

    // Parse the string as JSON
    json inputJson = json::parse(inputStr);

    vector<Product> products = loadProductsFromJson(inputJson);
    vector<int> recommendations = findFrequentlyBoughtTogether(productId, inputJson);

    json outputJson;
    outputJson["productId"] = productId;
    outputJson["recommendations"] = recommendations;
    cout << outputJson.dump(4) << endl;
    return 0;
}
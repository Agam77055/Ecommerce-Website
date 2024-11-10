#include <iostream>
#include <fstream>
#include <string>
#include <unordered_map>
#include <vector>
#include <sstream>
#include <queue>   // Include header for priority_queue
#include "../include/nlohmann/json.hpp"  // For parsing JSON

using json = nlohmann::json;
using namespace std;

// Struct to hold product information
struct Product {
    int key;
    string name;
    string model;
    string description;
    double mrp;
    double price;
    string image;
    string brand;
    string category;
    int reviews;
    double rating;
};

// Struct to hold transaction information
struct Transaction {
    int user_id;
    vector<int> product_ids;
};

// Function to safely convert string to integer, with error handling
int safe_stoi(const string& str) {
    try {
        return stoi(str);
    } catch (const invalid_argument& e) {
        cerr << "Invalid argument in stoi conversion: " << str << endl;
        throw;
    } catch (const out_of_range& e) {
        cerr << "Out of range error in stoi conversion: " << str << endl;
        throw;
    }
}

// Function to find the favorite category for a user
string find_favorite_category(int user_id, const vector<Transaction>& transactions, 
                              const unordered_map<int, Product>& product_catalog) {
    unordered_map<string, int> category_count;  // Store counts of transactions by category

    // Step 1: Count transactions by category for the user
    for (const auto& transaction : transactions) {
        if (transaction.user_id == user_id) {
            for (int product_id : transaction.product_ids) {
                auto product = product_catalog.find(product_id);
                if (product != product_catalog.end()) {
                    category_count[product->second.category]++;
                }
            }
        }
    }

    // Step 2: Find the category with the maximum count
    string favorite_category;
    int max_count = 0;

    for (const auto& entry : category_count) {
        if (entry.second > max_count) {
            max_count = entry.second;
            favorite_category = entry.first;
        }
    }

    return favorite_category.empty() ? " " : favorite_category;
}

// Time Complexity: O(t.p)
// t: number of transactions, p: number of products per transaction


int main(int argc, char* argv[]) {
    // Step 1: Check if user_id is passed as a command-line argument
    if (argc != 2) {
        cerr << "Usage: " << argv[0] << " <user_id>" << endl;
        return 1;
    }

    int user_id = stoi(argv[1]);  // Convert command-line argument to user_id

    // Step 2: Load the product catalog from the JSON file
    ifstream product_file("dataset/MOCK_DATA.json");
    if (!product_file.is_open()) {
        cerr << "Failed to open the product catalog file!" << endl;
        return 1;
    }

    json product_data;
    product_file >> product_data;

    unordered_map<int, Product> product_catalog;

    for (const auto& item : product_data) {
        Product product;
        product.key = item["key"];
        product.name = item["name"];
        product.model = item["model"];
        product.description = item["description"];
        product.mrp = item["mrp"];
        product.price = item["price"];
        product.image = item["image"];
        product.brand = item["brand"];
        product.category = item["category"];
        product.reviews = item["reviews"];
        product.rating = item["rating"];

        product_catalog[product.key] = product;
    }

    // Step 3: Load the transactions from the JSON file
    ifstream transaction_file("dataset/dummy2.json");
    if (!transaction_file.is_open()) {
        cerr << "Failed to open the transactions file!" << endl;
        return 1;
    }

    json transaction_data;
    transaction_file >> transaction_data;

    vector<Transaction> transactions;

    for (const auto& item : transaction_data) {
        Transaction transaction;
        transaction.user_id = safe_stoi(item["user"].get<string>());
        
        // Parse product IDs as comma-separated values
        string product_str = item["product"];
        stringstream ss(product_str);
        string product_id_str;
        
        while (getline(ss, product_id_str, ',')) {
            transaction.product_ids.push_back(safe_stoi(product_id_str));
        }

        transactions.push_back(transaction);
    }

    // Step 4: Find the favorite category for the entered user ID
    string favorite_category = find_favorite_category(user_id, transactions, product_catalog);
    
    // Step 5: Prepare the recommendations in JSON format
    json recommendations;
    recommendations["user_id"] = user_id;
    recommendations["favorite_category"] = favorite_category;

    // Output recommendations as JSON to standard output (stdout)
    cout << recommendations.dump(4) << endl;

    return 0;
}

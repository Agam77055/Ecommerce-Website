#include <iostream>
#include <fstream>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <string>
#include "../include/nlohmann/json.hpp"  // Include JSON for Modern C++ library

using json = nlohmann::json;
using namespace std;

// Define data structures for users and products
unordered_map<string, unordered_set<string>> userPurchases; // Maps users to sets of products they've bought

// Function to add a purchase record for a user
void addPurchase(const string& user, const string& product) {
    userPurchases[user].insert(product);
}

// Function to populate purchases from a JSON file
void populatePurchasesFromJson(const string& filename) {
    ifstream inputFile(filename);
    if (!inputFile.is_open()) {
        cerr << "Error opening file: " << filename << endl;
        return;
    }

    json dataset;
    inputFile >> dataset; // Parse JSON data from file

    for (const auto& entry : dataset) {
        string user = entry.at("user").get<string>();
        string product = entry.at("product").get<string>();
        addPurchase(user, product);
    }
}

// Function to generate recommendations for a target user based on other users' purchases
vector<string> recommendProducts(const string& targetUser) {
    unordered_set<string> targetUserProducts = userPurchases[targetUser];
    vector<string> recommendations;

    // Loop through each user in the userPurchases map
    for (const auto& entry : userPurchases) {
        const string& otherUser = entry.first;                // Extract other user's name
        const unordered_set<string>& otherUserProducts = entry.second;  // Extract other user's purchased products

        // Skip the target user itself
        if (otherUser == targetUser) continue;

        // Ensure the other user has purchased more products than the target user
        if (otherUserProducts.size() <= targetUserProducts.size()) continue;

        // Find the intersection of purchases between target user and other user
        int sharedCount = 0;
        for (const string& product : targetUserProducts) {
            if (otherUserProducts.find(product) != otherUserProducts.end()) {
                ++sharedCount;
            }
        }

        // Check if the overlap threshold is met (at least half of target's purchases are in other user's list)
        if (sharedCount >= targetUserProducts.size() / 2) {
            // Recommend products from other user that the target user has not bought
            for (const string& product : otherUserProducts) {
                if (targetUserProducts.find(product) == targetUserProducts.end()) {
                    recommendations.push_back(product);
                }
            }
        }
    }

    return recommendations;
}

int main(int argc, char* argv[]) {
    // Check for user ID argument
    if (argc < 2) {
        cerr << "Usage: " << argv[0] << " <targetUser>" << endl;
        return 1;
    }
    
    string targetUser = argv[1];  // Take user ID from command line
    string filename = "dataset/transactions.json";  // JSON file path
    populatePurchasesFromJson(filename);

    vector<string> recommendations = recommendProducts(targetUser);

    // Convert the recommendations to JSON format and output to standard output (stdout)
    json result = {{"user", targetUser}, {"recommendations", recommendations}};
    cout << result.dump() << endl;

    return 0;
}

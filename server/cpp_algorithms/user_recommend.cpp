#include <iostream>
#include <fstream>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#include <string>
#include <queue>
#include "../include/nlohmann/json.hpp"  // Include JSON for Modern C++ library

using json = nlohmann::json;
using namespace std;

// Define data structures for users and products
unordered_map<string, unordered_set<string>> userPurchases; // Maps users to sets of products they've bought
unordered_map<string, json> userData; // Maps user ID to user data (attributes)

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

// Function to populate user data from a JSON file
void populateUserDataFromJson(const string& filename) {
    ifstream inputFile(filename);
    if (!inputFile.is_open()) {
        cerr << "Error opening file: " << filename << endl;
        return;
    }

    json dataset;
    inputFile >> dataset; // Parse JSON data from file

    for (const auto& entry : dataset) {
        string userId = to_string(entry.at("user_id").get<int>());
        userData[userId] = entry; // Store user data based on user ID
    }
}

// Function to generate recommendations for a target user based on other users' purchases
vector<string> recommendProducts(const string& targetUser) {
    unordered_set<string> targetUserProducts = userPurchases[targetUser];
    unordered_map<string, int> productRecommendationCount;

    // Loop through each user in the userPurchases map
    for (const auto& entry : userPurchases) {
        const string& otherUser = entry.first;                // Extract other user's name
        const unordered_set<string>& otherUserProducts = entry.second;  // Extract other user's purchased products

        // Skip the target user itself
        if (otherUser == targetUser) continue;

        // Here you could implement filtering based on user attributes
        // For example, only consider users from the same country or similar age
        // string targetUserCountry = userData[targetUser]["country"];
        // string otherUserCountry = userData[otherUser]["country"];
        // if (targetUserCountry != otherUserCountry) continue;

        // Find the intersection of purchases between target user and other user
        int sharedCount = 0;
        for (const string& product : targetUserProducts) {
            if (otherUserProducts.find(product) != otherUserProducts.end()) {
                ++sharedCount;
            }
        }

        // Check if the overlap threshold is met (at least one shared product)
        if (sharedCount > 0) {
            // Recommend products from other user that the target user has not bought
            for (const string& product : otherUserProducts) {
                if (targetUserProducts.find(product) == targetUserProducts.end()) {
                    productRecommendationCount[product]++;
                }
            }
        }
    }

    // Use a min-heap to get the top 15 recommendations
    priority_queue<pair<int, string>, vector<pair<int, string>>, greater<pair<int, string>>> minHeap;

    for (const auto& entry : productRecommendationCount) {
        const string& product = entry.first;
        int count = entry.second;

        minHeap.push({count, product});
        if (minHeap.size() > 15) {
            minHeap.pop(); // Keep only the top 15 products
        }
    }

    vector<string> recommendations;
    while (!minHeap.empty()) {
        recommendations.push_back(minHeap.top().second);
        minHeap.pop();
    }

    reverse(recommendations.begin(), recommendations.end()); // To get the highest first

    return recommendations;
}

// Time Complexity: O(u.p + u.q.log15)
// u: number of users in userPurchases, p: number of products a user has purchased, q: number of unique products in the system
// 15 because we are returning top 15 products

int main(int argc, char* argv[]) {
    // Check for user ID argument
    if (argc < 2) {
        cerr << "Usage: " << argv[0] << " <targetUser>" << endl;
        return 1;
    }
    
    string targetUser = argv[1];
    string transactionsFile = "dataset/dummy2.json";
    string userDataFile = "dataset/users_data.json";
    
    populateUserDataFromJson(userDataFile);
    populatePurchasesFromJson(transactionsFile); 

    vector<string> recommendations = recommendProducts(targetUser);

    // Convert the recommendations to JSON format and output to standard output (stdout)
    json result = {{"user", targetUser}, {"recommendations", recommendations}};
    cout << result.dump() << endl;

    return 0;
}

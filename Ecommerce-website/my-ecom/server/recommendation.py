import json
import pandas as pd
import sys
from pathlib import Path

# Load transaction data from dummy2.json
file_path = Path(__file__).resolve().parent / 'dataset' / 'dummy2.json'
with open(file_path, 'r') as file:
    transactions = json.load(file)

# Convert transactions data into a pandas DataFrame
data = pd.DataFrame(transactions)

# Strip whitespace and convert 'user' column to integer
data['user'] = data['user'].astype(int)

# Explode product list to create user-product interaction data
data = data.explode('product').reset_index(drop=True)

# Create a user-product matrix that counts the number of purchases for each product by each user
user_product_matrix = pd.crosstab(data['user'], data['product'], values=data['product'], aggfunc='count').fillna(0)

# Define a recommendation function that prioritizes frequent purchases
def recommend_products(user_id, num_recommendations=10):
    # Check if user exists in the data
    if user_id not in user_product_matrix.index:
        return []
    
    # Calculate similarity scores for all users based on purchase counts
    user_similarity = user_product_matrix.dot(user_product_matrix.loc[user_id])

    # Sort users by similarity, excluding the user itself
    similar_users = user_similarity.drop(index=user_id).sort_values(ascending=False)

    # Collect products with higher purchase counts, prioritizing the user's and similar users' preferences
    recommended_products = {}
    
    # Add user's own purchase counts with a higher weight for stronger preference
    user_purchases = user_product_matrix.loc[user_id]
    for product, count in user_purchases[user_purchases > 0].items():
        recommended_products[product] = count * 2  # Double the weight of user's own purchases

    # Now add products from similar users
    for similar_user in similar_users.index:
        user_products = user_product_matrix.loc[similar_user]
        
        for product, count in user_products[user_products > 0].items():
            if product in recommended_products:
                # Accumulate product counts
                recommended_products[product] += count
            else:
                recommended_products[product] = count

        # Stop if we have enough recommendations
        if len(recommended_products) >= num_recommendations * 2:  # Overcollect in case of duplicates
            break
    
    # Sort products by the accumulated score (weighted counts), in descending order
    sorted_recommended_products = sorted(recommended_products, key=recommended_products.get, reverse=True)

    # Flatten any comma-separated product entries and ensure unique recommendations
    flat_recommended_products = []
    for product in sorted_recommended_products:
        if isinstance(product, str) and ',' in product:
            flat_recommended_products.extend([int(p.strip()) for p in product.split(',')])
        else:
            flat_recommended_products.append(int(product))

    # Remove duplicates and limit to the top num_recommendations products
    unique_recommendations = list(dict.fromkeys(flat_recommended_products))[:num_recommendations]

    return unique_recommendations

# Get the user ID from command-line arguments
if __name__ == "__main__":
    try:
        user_id = int(sys.argv[1])
    except IndexError:
        print("Please provide a user ID as a command-line argument.")
        sys.exit(1)
    except ValueError:
        print("The user ID must be an integer.")
        sys.exit(1)

    recommendations = recommend_products(user_id)
    print(json.dumps(recommendations))

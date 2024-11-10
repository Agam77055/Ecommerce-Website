import React, { useState, useEffect } from "react";
import CartSlider from "../components/cartSlider"; // Adjust import path if necessary
import Navbar from "../components/navBar";
import ProductSlider from '../components/productSlider';

const CartPage = () => {
  const [cart, setCart] = useState([]);
  const [purchaseCompleted, setPurchaseCompleted] = useState(false); // New state for purchase status
  const [recommendations, setRecommendations] = useState([]); // New state for recommendations

  useEffect(() => {
    // Retrieve cart (product IDs) from session storage when the component mounts
    const cartItems = JSON.parse(sessionStorage.getItem("cart")) || [];
    setCart(cartItems); // Update the state with the cart items

    if (cartItems.length > 0) {
      // Prepare cart items for the request in the required format
      const cartInput = cartItems.join(", ");

      fetch("http://localhost:5001/brought_together", {
        method: "POST",  // Using POST to send data in the body
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartInput }),  // Send cartInput in the required format
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.recommendations && data.recommendations.length > 0) {
            const recommendationList = data.recommendations.split(",").map(Number);
            setRecommendations(recommendationList);
          } else {
            setRecommendations([]); // Set empty array if no recommendations are found
          }
        })
        .catch((error) => {
          console.error("Error fetching recommendations:", error);
          setRecommendations([]); // Handle error and set empty array
        });
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleRemoveFromCart = (productId) => {
    const updatedCart = cart.filter((id) => id !== productId);
    setCart(updatedCart);
    sessionStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const handleClearCart = () => {
    setCart([]);
    sessionStorage.removeItem("cart");
  };

  const handleBuy = () => {
    const user = JSON.parse(sessionStorage.getItem("user")); // Parse user as an object
    const cart = JSON.parse(sessionStorage.getItem("cart")); // Parse cart as an array

    if (!user || !user.user_id || !cart || !Array.isArray(cart) || cart.length === 0) {
      console.log("User or cart data is missing or invalid.");
      alert("User or cart data is missing or invalid.");
      return;
    }

    const formattedData = {
      user: String(user.user_id),  // Convert user_id to a string
      products: cart,  // Send cart as an array, as expected by the API
    };

    console.log("Proceeding to checkout with data:", formattedData);

    fetch("http://localhost:5001/api/purchase", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          console.error("Error:", data.error);
          alert("Failed to complete purchase: " + data.error);
        } else {
          console.log("Success:", data.message);
          alert("Purchase successful!");
          sessionStorage.removeItem("cart");
          setCart([]);
          setPurchaseCompleted(true);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while processing your purchase.");
      });
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.content}>
        <h2 style={styles.heading}>Your Cart</h2>

        {/* Check if the purchase is completed and show thank you message */}
        {purchaseCompleted ? (
          <p style={styles.thankYouMessage}>Thank you for your purchase!</p>
        ) : (
          <>
            {cart.length === 0 ? (
              <p style={styles.emptyCart}>No items in the cart</p>
            ) : (
              <CartSlider productIds={cart} onRemoveFromCart={handleRemoveFromCart} />
            )}

            {cart.length > 0 && (
              <button style={styles.clearCartButton} onClick={handleClearCart}>
                Clear Cart
              </button>
            )}

            {cart.length > 0 && (
              <button style={styles.buyButton} onClick={handleBuy}>
                Buy
              </button>
            )}

            {/* Recommendations */}
            {recommendations.length > 0 && (
              <div style={styles.recommendationSection}>
                <h3 style={styles.recommendationHeading}>Frequently Brought With These</h3>
                <ProductSlider productIds={recommendations} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    fontFamily: "Arial, sans-serif",
    backgroundColor: "#f4f6f8",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  content: {
    padding: "20px",
    textAlign: "center",
    marginTop: "30px",
  },
  heading: {
    fontSize: "2rem",
    color: "#333",
    marginBottom: "20px",
  },
  emptyCart: {
    fontSize: "1.5rem",
    color: "#ff4d4f",
    fontWeight: "bold",
    marginTop: "20px",
  },
  thankYouMessage: {
    fontSize: "1.8rem",
    color: "#4CAF50",
    fontWeight: "bold",
    marginTop: "30px",
  },
  clearCartButton: {
    backgroundColor: "#ff4d4f",
    color: "white",
    border: "none",
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "20px",
    borderRadius: "5px",
  },
  buyButton: {
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    padding: "10px 20px",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "10px",
    borderRadius: "5px",
  },
  recommendationSection: {
    marginTop: "40px",
  },
  recommendationHeading: {
    fontSize: "1.8rem",
    color: "#333",
    marginBottom: "20px",
  },
};

export default CartPage;
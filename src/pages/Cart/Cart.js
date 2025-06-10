import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css";
import { API_BASE_URL } from "../../config/api";
import { StoreContext } from "../../context/StoreContext";

function Cart() {
  const { 
    cartItems: contextCartItems, 
    removeItemCompletely,
    user
  } = useContext(StoreContext);
  
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (accessToken) {
      fetchCart();
    } else {
      setError("Please login to view your cart");
    }
  }, [accessToken, contextCartItems]);

  const fetchCart = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/app/cart/get-cart`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response.data.success) {
        setCartItems(response.data.cart_items || []);
        setSubtotal(response.data.cart_subtotal || 0);
        setDeliveryFee(response.data.cart_delivery_fee || 0);
        setTotal(response.data.cart_total || 0);
        setError("");
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      setError("Could not load cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setIsLoading(true);
      await removeItemCompletely(itemId);
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      setError("Failed to remove item. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cart">
      {isLoading && <div className="loading-overlay">Loading...</div>}
      
      {error ? (
        <p className="error-message">{error}</p>
      ) : !user ? (
        <p className="empty-cart">Please login to view your cart</p>
      ) : cartItems.length === 0 ? (
        <p className="empty-cart">Your cart is empty.</p>
      ) : (
        <>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item.menu_item_id}>
                  <td>
                    <img
                      src={`${API_BASE_URL}${item.image}`}
                      alt={item.name}
                      className="cart-item-image"
                    />
                  </td>
                  <td>{item.name}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>${(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button
                      className="remove-button"
                      onClick={() => handleRemoveItem(item.menu_item_id)}
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="cart-totals">
            <h2>Cart Totals</h2>
            <div className="totals-row">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>Delivery Fee:</span>
              <span>${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="totals-row grand-total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button 
              className="checkout-button" 
              onClick={() => navigate("/order")}
              disabled={isLoading || cartItems.length === 0}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
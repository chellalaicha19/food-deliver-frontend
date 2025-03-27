import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Cart.css"; // Import the CSS file for styling
import { API_BASE_URL } from "../../config/api";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!accessToken) {
      alert("You need to log in to view your cart.");
      navigate("/login");
      return;
    }
    fetchCart();
  }, [accessToken]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/app/cart/get-cart`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      setCartItems(data.cart_items || []);
      setSubtotal(data.cart_subtotal);
      setDeliveryFee(data.cart_delivery_fee);
      setTotal(data.cart_total);
    } catch (error) {
      console.error("Error fetching cart:", error);
      alert(error.response?.data?.error || "Failed to load cart. Please try again.");
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      console.log(itemId);
      const response = await axios.delete(
        `${API_BASE_URL}/app/cart/remove/${itemId}/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
  
      if (response.data.success) {
        alert("Item removed from cart.");
        fetchCart(); // Refresh the cart
      } else {
        alert(response.data.error);
      }
    } catch (error) {
      console.error("Error removing item:", error);
      alert(error.response?.data?.error || "Failed to remove item. Please try again.");
    }
  };
  

  return (
    <div className="cart">
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
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
              {cartItems.map((item, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td>
                      <img
                        src={`${API_BASE_URL}${item.image}`}
                        alt={item.name}
                        className="cart-item-image"
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>${item.price}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.price * item.quantity).toFixed(2)}</td>
                    <td>
                      <button
                        className="remove-button"
                        onClick={() => removeFromCart(item.menu_item_id)}
                      >
                        x
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="6">
                      <hr className="cart-divider" />
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div className="cart-bottom">
            <div className="cart-total">
              <h2>Cart Totals</h2>
              <div>
                <div className="cart-total-details">
                  <p>Subtotal</p>
                  <p>${subtotal.toFixed(2)}</p>
                </div>
                <hr />
                <div className="cart-total-details">
                  <p>Delivery Fee</p>
                  <p>${deliveryFee.toFixed(2)}</p>
                </div>
                <hr />
                <div className="cart-total-details">
                  <b>Total</b>
                  <b>${total.toFixed(2)}</b>
                </div>
                <hr />
              </div>
              <button className="checkout-button" onClick={() => navigate("/order")}>
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
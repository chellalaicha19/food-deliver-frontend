import React, { useState, useEffect, useContext } from "react";
import "./PlaceOrder.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

function PlaceOrder() {
  const { cartItems } = useContext(StoreContext);
  const [cart, setCart] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const accessToken = localStorage.getItem("accessToken");

  // Fetch Cart Information
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/app/delivery/information`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (response.data.success) {
          setCart(response.data.cart);
        } else {
          setError("Could not retrieve cart information.");
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
        setError("Failed to load cart details.");
      }
    };

    if (accessToken) {
      fetchCart();
    } else {
      setError("You must be logged in to place an order.");
    }
  }, [accessToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeliveryInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!accessToken) {
        setError("You must be logged in to place an order.");
        return;
      }

      const orderData = {
        first_name: deliveryInfo.firstName,
        last_name: deliveryInfo.lastName,
        email: deliveryInfo.email,
        street: deliveryInfo.street,
        city: deliveryInfo.city,
        state: deliveryInfo.state,
        zip_code: deliveryInfo.zipCode,
        country: deliveryInfo.country,
        phone: deliveryInfo.phone,
      };

      const response = await axios.post(
        `${API_BASE_URL}/app/delivery/information`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        alert("Order placed successfully!");
        navigate("/order-confirmation", { state: { deliveryId: response.data.delivery_id } });
      } else {
        setError("Failed to place order. Please try again.");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="place-order" onSubmit={handleSubmit}>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input
            type="text"
            placeholder="First name"
            name="firstName"
            value={deliveryInfo.firstName}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="Last name"
            name="lastName"
            value={deliveryInfo.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="email"
          placeholder="Email address"
          name="email"
          value={deliveryInfo.email}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          placeholder="Street"
          name="street"
          value={deliveryInfo.street}
          onChange={handleChange}
          required
        />
        <div className="multi-fields">
          <input
            type="text"
            placeholder="City"
            name="city"
            value={deliveryInfo.city}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="State"
            name="state"
            value={deliveryInfo.state}
            onChange={handleChange}
            required
          />
        </div>
        <div className="multi-fields">
          <input
            type="text"
            placeholder="Zip code"
            name="zipCode"
            value={deliveryInfo.zipCode}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            placeholder="Country"
            name="country"
            value={deliveryInfo.country}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="text"
          placeholder="Phone"
          name="phone"
          value={deliveryInfo.phone}
          onChange={handleChange}
          required
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          {cart ? (
            <>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>${cart.subtotal.toFixed(2)}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>${cart.delivery_fee.toFixed(2)}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>${cart.total.toFixed(2)}</b>
              </div>
              <hr />
            </>
          ) : (
            <p>Loading cart details...</p>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Placing Order..." : "PROCEED TO PAYMENT"}
          </button>
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </form>
  );
}

export default PlaceOrder;

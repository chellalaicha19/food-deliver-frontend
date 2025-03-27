import { createContext, useEffect, useState } from "react";
import axios from "axios"; // Import axios
import { food_list } from "../assets/assets";
import { API_BASE_URL } from "../config/api";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({}); // Initialize as an empty object
  const [subtotal, setSubtotal] = useState(0); // Define subtotal state
  const [deliveryFee, setDeliveryFee] = useState(0); // Define deliveryFee state
  const [total, setTotal] = useState(0); // Define total state

  // Fetch cart data from the backend when the component mounts or the user logs in
  const fetchCart = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        console.error("No access token found. User is not logged in.");
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/app/cart/get-cart`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const data = response.data;
      console.log("Cart loaded from backend:", data);

      // Transform cart_items array into an object
      const cartItemsObject = data.cart_items.reduce((acc, item) => {
        acc[item.menu_item_id] = item.quantity; // Use menu_item_id as the key
        return acc;
      }, {});

      console.log("Cart Items Object:", cartItemsObject); // Debugging log
      setCartItems(cartItemsObject); // Set cartItems as an object
      setSubtotal(data.cart_subtotal);
      setDeliveryFee(data.cart_delivery_fee);
      setTotal(data.cart_total);
    } catch (error) {
      console.error("Error fetching cart:", error);
      alert(error.response?.data?.error || "Failed to load cart. Please try again.");
    }
  };

  // Fetch cart data on page load if the user is logged in
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      fetchCart(); // Fetch cart data if the user is already logged in
    }
  }, []);

  // Function to update the cart
  const updateCart = async (itemId, quantityChange) => {
    let currentQuantity; // Declare currentQuantity outside the try block

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.error("No access token found. User is not logged in.");
        return;
      }

      // Get the current quantity from cartItems (default to 0 if not found)
      currentQuantity = cartItems[itemId] || 0;
      const newQuantity = currentQuantity + quantityChange;

      // Update the UI immediately
      setCartItems((prev) => ({
        ...prev,
        [itemId]: newQuantity,
      }));

      // Send the update to the backend
      const response = await axios.post(
        `${API_BASE_URL}/app/cart/update`,
        { menu_item_id: itemId, quantity: newQuantity },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.data.success) {
        console.error("Failed to update cart:", response.data.error);
        // Revert UI using currentQuantity
        setCartItems((prev) => ({
          ...prev,
          [itemId]: currentQuantity,
        }));
      }
    } catch (error) {
      console.error("Error updating cart:", error);
      // Revert UI if API call fails
      setCartItems((prev) => ({
        ...prev,
        [itemId]: currentQuantity, // Now currentQuantity is defined here
      }));
    }
  };

  // Function to calculate the total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = food_list.find(
          (product) => Number(product._id) === Number(itemId)
        );
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[itemId];
        }
      }
    }
    return totalAmount;
  };

  // Functions to add or remove items from the cart
  const addToCart = (itemId) => updateCart(itemId, 1); // Add (+)
  const removeFromCart = (itemId) => updateCart(itemId, -1); // Remove (-)

  // Context value to be provided to consumers
  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    subtotal,
    deliveryFee,
    total,
    fetchCart, // Add fetchCart to the context
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
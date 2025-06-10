import { createContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../config/api";

export const StoreContext = createContext(null);

const StoreContextProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState({});
  const [isCartLoaded, setIsCartLoaded] = useState(false);
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem("accessToken");
    return token ? { accessToken: token } : null;
  });

  const [popup, setPopup] = useState({ show: false, message: "" });
  const [menuItems, setMenuItems] = useState([]);

  const triggerPopup = useCallback((message) => {
    setPopup({ show: true, message });
    setTimeout(() => setPopup({ show: false, message: "" }), 3000);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("cartItems");
    setUser(null);
    setCartItems({});
    window.location.href = "/";
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await axios.get(`${API_BASE_URL}/app/cart/get-cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const apiCart = response.data.cart_items.reduce((acc, item) => {
          acc[item.menu_item_id] = item.quantity;
          return acc;
        }, {});
        
        setCartItems(apiCart);
        localStorage.setItem("cartItems", JSON.stringify(apiCart));
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        logout();
      }
    }
  }, [logout]);

  const updateCart = useCallback(async (itemId, quantityChange) => {
    const token = localStorage.getItem("accessToken");
    
    if (!token && quantityChange > 0) {
      triggerPopup("Please login to add items");
      return;
    }

    // Calculate new quantity first
    const currentQuantity = cartItems[itemId] || 0;
    const newQuantity = Math.max(0, currentQuantity + quantityChange);

    // Optimistic UI update - update local state immediately
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newQuantity === 0) {
        delete newCart[itemId];
      } else {
        newCart[itemId] = newQuantity;
      }
      localStorage.setItem("cartItems", JSON.stringify(newCart));
      return newCart;
    });

    if (token) {
      try {
        // First fetch the current cart to ensure we have latest data
        const currentCart = await axios.get(`${API_BASE_URL}/app/cart/get-cart`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Find if the item already exists in the cart
        const existingItem = currentCart.data.cart_items?.find(
          item => item.menu_item_id === itemId
        );

        // Calculate the proper new quantity based on server state
        const serverQuantity = existingItem?.quantity || 0;
        const finalQuantity = Math.max(0, serverQuantity + quantityChange);

        // Update the cart with the correct quantity
        await axios.post(`${API_BASE_URL}/app/cart/update`, {
          menu_item_id: itemId,
          quantity: finalQuantity
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Refresh the cart to ensure sync with server
        await fetchCart();
      } catch (error) {
        console.error("Error updating cart on server:", error);
        // Revert to saved cart if API fails
        const savedCart = localStorage.getItem("cartItems");
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
        triggerPopup("Failed to update cart on server");
      }
    }
  }, [cartItems, triggerPopup, fetchCart]);

  const addToCart = useCallback((itemId) => updateCart(itemId, 1), [updateCart]);
  const removeFromCart = useCallback((itemId) => updateCart(itemId, -1), [updateCart]);

  const removeItemCompletely = useCallback(async (itemId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        await axios.delete(`${API_BASE_URL}/app/cart/remove/${itemId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Update local state and storage
        setCartItems(prev => {
          const newCart = { ...prev };
          delete newCart[itemId];
          localStorage.setItem("cartItems", JSON.stringify(newCart));
          return newCart;
        });
      }
    } catch (error) {
      console.error("Error removing item completely:", error);
      triggerPopup("Failed to remove item");
    }
  }, [triggerPopup]);

  const loginUser = useCallback(async (token, userData) => {
    localStorage.setItem("accessToken", token);
    setUser({ accessToken: token, ...userData });
    
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      
      try {
        await fetchCart();
      } catch (error) {
        console.error("Failed to sync cart with server:", error);
      }
    } else {
      try {
        await fetchCart();
      } catch (error) {
        console.error("Failed to fetch cart:", error);
      }
    }
  }, [fetchCart]);

  const getTotalCartAmount = useCallback(() => {
    return Object.entries(cartItems).reduce((total, [id, quantity]) => {
      const item = menuItems.find(item => item.id === parseInt(id));
      return total + (item ? item.price * quantity : 0);
    }, 0);
  }, [cartItems, menuItems]);

  useEffect(() => {
    const initializeCart = async () => {
      const token = localStorage.getItem("accessToken");
      const savedCart = localStorage.getItem("cartItems");
      
      if (token) {
        try {
          await fetchCart();
        } catch (error) {
          console.error("Failed to fetch cart from API:", error);
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch (parseError) {
              console.error("Failed to parse saved cart:", parseError);
              setCartItems({});
            }
          }
        }
      } else if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (parseError) {
          console.error("Failed to parse saved cart:", parseError);
          setCartItems({});
        }
      }
      
      setIsCartLoaded(true);
    };

    initializeCart();
  }, [fetchCart]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/app/menu-items`);
        setMenuItems(response.data);
      } catch (error) {
        console.error("Error fetching menu items:", error);
      }
    };
    fetchMenuItems();
  }, []);

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    user,
    loginUser,
    logout,
    triggerPopup,
    popupMessage: popup.message,
    showPopup: popup.show,
    closePopup: () => setPopup({ show: false, message: "" }),
    isCartLoaded,
    menuItems,
    removeItemCompletely
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {children}
      {popup.show && (
        <div className="popup-overlay">
          <div className="popup">
            <p>{popup.message}</p>
          </div>
        </div>
      )}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
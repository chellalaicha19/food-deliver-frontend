import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import "./FoodDisplay.css";
import FoodItem from "../FoodItem/FoodItem";
import { API_BASE_URL } from "../../config/api";

function FoodDisplay({category}) {
  const { categoryId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true); // ✅ Reset loading state
      try {
        const url = category
          ? `${API_BASE_URL}/app/menu-item/get-by-category/${category}`
          : `${API_BASE_URL}/`; // ✅ Correct API call

        console.log("Fetching from URL:", url); // Debugging API URL

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data); // ✅ Debug API Response

        setMenuItems(Array.isArray(data) ? data : []);
        setError(null); // ✅ Clear error if fetch is successful
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [category]);

  if (loading) {
    return <div>Loading menu items...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  console.log("Menu Items:", menuItems); // Debugging

  return (
    <div className="food-display" id="food-display">
      <h2>Top dishes near you</h2>
      <div className="food-display-list">
        {menuItems.length > 0 ? (
          menuItems.map((item, index) => (
            <FoodItem
              key={index}
              id={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={`${API_BASE_URL}${item.image}`}
            />
          ))
        ) : (
          <div>No menu items found.</div>
        )}
      </div>
    </div>
  );
}

export default FoodDisplay;
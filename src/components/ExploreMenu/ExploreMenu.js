import React, { useEffect, useState } from "react";
import "./ExploreMenu.css";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config/api";

function ExploreMenu({ category, setCategory }) {

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    getCategories();
  }, []);

  const getCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/app/category/all`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data = await response.json();
      console.log("API Response:", data); // Log the API response
      setCategories(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories", error);
      setError(error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading categories...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div className="explore-menu" id="explore-menu">
      <h1>Explore our menu</h1>
      <p className="explore-menu-text">
        Choose from a diverse menu featuring a delectable array of dishes. Our
        mission is to satisfy your cravings and elevate your dining experience,
        one delicious meal at a time.
      </p>
      <div className="explore-menu-list">
        {categories.map((item) => (
          <div
            key={item.id}
            className={`explore-menu-list-item ${category === item.id ? "active" : ""}`}
            onClick={() => setCategory(item.id)} // ✅ Update category only
          >
            <img src={`${API_BASE_URL}${item.image}`} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
      <hr />
    </div>
  );
}

export default ExploreMenu;

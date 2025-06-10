import React, { useContext } from "react";
import "./FoodItem.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const FoodItem = ({ id, name, price, description, image }) => {
  const { 
    cartItems = {}, 
    addToCart, 
    removeFromCart, 
    user,
    triggerPopup 
  } = useContext(StoreContext);
  
  const quantity = cartItems[id] || 0;

  return (
    <div className="food-item">
      <div className="food-item-img-container">
        <img className="food-item-image" src={image} alt={name} />
        <div className="food-item-counter-container">
          {!user ? (
            <button 
              className="food-item-add-btn"
              onClick={() => triggerPopup("Please login to add items")}
            >
              <img src={assets.add_icon_white} alt="Add to cart" />
            </button>
          ) : quantity > 0 ? (
            <div className="food-item-counter">
              <button onClick={() => removeFromCart(id)}>
                <img src={assets.remove_icon_red} alt="Remove" />
              </button>
              <p>{quantity}</p>
              <button onClick={() => addToCart(id)}>
                <img src={assets.add_icon_green} alt="Add" />
              </button>
            </div>
          ) : (
            <button 
              className="food-item-add-btn"
              onClick={() => addToCart(id)}
            >
              <img src={assets.add_icon_green} alt="Add to cart" />
            </button>
          )}
        </div>
      </div>
      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating" />
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">${price}</p>
      </div>
    </div>
  );
};

export default FoodItem;
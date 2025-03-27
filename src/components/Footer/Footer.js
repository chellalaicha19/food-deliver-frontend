import React from "react";
import "./Footer.css";
import { assets } from "../../assets/assets";

function Footer() {
  return (
    <div className="footer" id="footer">
      <div className="footer-content">
        <div className="footer-content-left">
          <img src={assets.logo} />
          <p>
            Dummy text refers to the bits of content that are used to fill a
            website mock-up. This text helps web designers better envision how
            the website will look as a finished product. It is important to
            understand that dummy text has no meaning whatsoever. Its sole
            purpose is to fill out blank spaces with “word-like” content,
            without making any copyright infringements.
          </p>
          <div className="footer-social-icons">
            <img src={assets.facebook_icon} alt=""/>
            <img src={assets.twitter_icon} alt="" />
            <img src={assets.linkedin_icon} alt=""/>
          </div>
        </div>
        <div className="footer-content-center">
          <h2>COMPANY</h2>
          <ul>
            <li>Home</li>
            <li>About Us</li>
            <li>Delivery</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
        <div className="footer-content-right">
          <h2>GET IN TOUCH</h2>
          <ul>
            <li>+2138663665</li>
            <li>contactTomato@gamil.com</li>
          </ul>
        </div>
      </div>
      <hr />
      <p className="footer-copyright">
        Copyright 2024 @ Tomato.com - All Right Reserved.
      </p>
    </div>
  );
}

export default Footer;

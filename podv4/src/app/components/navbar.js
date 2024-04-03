'use client'

import React, { useContext, useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";



/**
 * Navbar component that displays the logo, navigation links, and user profile dropdown.
 * @returns {JSX.Element} The Navbar component.
 */
const NavBar = () => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const dropdownRef = useRef(null);
  const [shopName, setShopName] = useState("");
  /**
   * Handles clicks outside of the user profile dropdown to close it.
   * @param {MouseEvent} event - The click event.
   */
  const handleDocumentClick = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setDropdownVisible(false);
    }
  };






  return (
    <nav className="bg-blue-500 pb-3 pt-3 relative z-50">
      <div className="container mx-auto flex items-center justify-between py-2">
        <div className="flex items-center">

          {/* Logo */}
          <Link href={'/'}>
            <Image
              src={'/images/logo.png'}
              width={70}
              alt="logo"
              height={70}
            />
          </Link>


        </div>


      </div>
    </nav>
  );
};

export default NavBar;

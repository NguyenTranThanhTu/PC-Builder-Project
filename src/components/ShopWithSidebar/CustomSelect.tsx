"use client";
import React, { useState, useEffect, useRef } from "react";

interface CustomSelectProps {
  options: Array<{ label: string; value: string }>;
  value?: string;
  onChange?: (value: string) => void;
}

const CustomSelect = ({ options, value, onChange }: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(
    options.find(opt => opt.value === value) || options[0]
  );
  const selectRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const newOption = options.find(opt => opt.value === value);
    if (newOption) {
      setSelectedOption(newOption);
    }
  }, [value, options]);

  // Function to close the dropdown when a click occurs outside the component
  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as Node | null;
    if (selectRef.current && target && !selectRef.current.contains(target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    // Add a click event listener to the document
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option: { label: string; value: string }) => {
    setSelectedOption(option);
    toggleDropdown();
    if (onChange) {
      onChange(option.value);
    }
  };

  return (
    <div
      className="custom-select custom-select-2 flex-shrink-0 relative"
      ref={selectRef}
    >
      <div
        className={`select-selected whitespace-nowrap ${
          isOpen ? "select-arrow-active" : ""
        }`}
        onClick={toggleDropdown}
      >
        {selectedOption.label}
      </div>
      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.slice(1).map((option, index) => (
          <div
            key={index}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              selectedOption === option ? "same-as-selected" : ""
            }`}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;

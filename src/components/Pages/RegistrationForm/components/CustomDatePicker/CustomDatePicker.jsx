import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "./CustomDatePicker.css";

const CustomDatePicker = ({
  selected,
  onChange,
  includeDates = [],
  minDate,
  maxDate,
  placeholder = "Chọn ngày...",
  disabled = false,
  className = "",
  id,
  required = false,
  onBlur,
  isDateAvailable,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [inputValue, setInputValue] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const calendarRef = useRef(null);

  // Months and weekdays in Vietnamese
  const months = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  const weekdays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  // Update input value when selected date changes
  useEffect(() => {
    if (selected) {
      setInputValue(formatDate(selected));
      setCurrentMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    } else {
      setInputValue("");
    }
  }, [selected]);

  // Handle calendar open/close effects
  useEffect(() => {
    if (isOpen) {
      // Add class to container for styling
      if (containerRef.current) {
        containerRef.current.classList.add("calendar-open");
      }

      // Prevent body scroll
      document.body.style.overflow = "hidden";

      // Add CSS class to body to indicate calendar is open
      document.body.classList.add("custom-datepicker-open");

      // Focus management with delay
      setTimeout(() => {
        if (calendarRef.current) {
          calendarRef.current.focus();
        }
      }, 100);

      // ESC key handler
      const handleEscKey = (e) => {
        if (e.key === "Escape") {
          handleCloseCalendar();
        }
      };

      document.addEventListener("keydown", handleEscKey);

      return () => {
        document.removeEventListener("keydown", handleEscKey);
      };
    } else {
      // Remove class from container
      if (containerRef.current) {
        containerRef.current.classList.remove("calendar-open");
      }

      // Restore body scroll
      document.body.style.overflow = "";

      // Remove CSS class from body
      document.body.classList.remove("custom-datepicker-open");
    }
  }, [isOpen]);

  // Close calendar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is on the popup backdrop or outside the component
      if (
        event.target.classList.contains("custom-datepicker-popup") ||
        (containerRef.current && !containerRef.current.contains(event.target))
      ) {
        handleCloseCalendar();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("custom-datepicker-open");
    };
  }, []);

  // Format date to dd/MM/yyyy
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Check if date is selectable
  const isDateSelectable = (date) => {
    // Check minimum date
    if (minDate && date < minDate) {
      return false;
    }

    // Check maximum date
    if (maxDate && date > maxDate) {
      return false;
    }

    // PRIORITY: Check custom availability function first (more reliable)
    if (isDateAvailable) {
      const isAvailable = isDateAvailable(date);
      return isAvailable;
    }

    // Fallback: Check if date is in included dates array
    if (includeDates.length > 0) {
      const isInIncluded = includeDates.some(
        (includeDate) => date.toDateString() === includeDate.toDateString()
      );
      return isInIncluded;
    }

    return true;
  };

  // Get calendar days for current month
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from Monday of the week containing first day
    const startDate = new Date(firstDay);
    const firstDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const mondayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // Convert to Monday-based
    startDate.setDate(startDate.getDate() - mondayOffset);

    // End at Sunday of the week containing last day
    const endDate = new Date(lastDay);
    const lastDayOfWeek = lastDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const sundayOffset = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek; // Days to add to reach Sunday
    endDate.setDate(endDate.getDate() + sundayOffset);

    const days = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  };

  // Handle date selection
  const handleDateClick = (date) => {
    const selectable = isDateSelectable(date);

    if (selectable) {
      onChange(date);
      handleCloseCalendar();
      if (onBlur) onBlur();
    }
  };

  // Handle calendar close
  const handleCloseCalendar = () => {
    setIsOpen(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle input click
  const handleInputClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  // Handle keyboard navigation in input
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    }
  };

  // Handle keyboard navigation in calendar
  const handleCalendarKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCloseCalendar();
      return;
    }

    if (e.key === "Tab") {
      // Allow tab navigation within calendar
      return;
    }

    e.preventDefault();

    const availableDays = getCalendarDays().filter((date) =>
      isDateSelectable(date)
    );
    if (availableDays.length === 0) return;

    let currentIndex = selected
      ? availableDays.findIndex(
          (date) => date.toDateString() === selected.toDateString()
        )
      : -1;

    // If no date selected, start with first available
    if (currentIndex === -1) {
      currentIndex = 0;
    }

    switch (e.key) {
      case "ArrowLeft":
        currentIndex = Math.max(0, currentIndex - 1);
        break;
      case "ArrowRight":
        currentIndex = Math.min(availableDays.length - 1, currentIndex + 1);
        break;
      case "ArrowUp":
        currentIndex = Math.max(0, currentIndex - 7);
        break;
      case "ArrowDown":
        currentIndex = Math.min(availableDays.length - 1, currentIndex + 7);
        break;
      case "Enter":
      case " ":
        if (currentIndex >= 0 && currentIndex < availableDays.length) {
          handleDateClick(availableDays[currentIndex]);
        }
        return;
      default:
        return;
    }

    if (currentIndex >= 0 && currentIndex < availableDays.length) {
      onChange(availableDays[currentIndex]);

      // Update current month if necessary
      const newDate = availableDays[currentIndex];
      if (
        newDate.getMonth() !== currentMonth.getMonth() ||
        newDate.getFullYear() !== currentMonth.getFullYear()
      ) {
        setCurrentMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
      }
    }
  };

  // Handle month navigation
  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Handle year navigation
  const navigateYear = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setFullYear(newMonth.getFullYear() + direction);
    setCurrentMonth(newMonth);
  };

  // Get CSS class for date
  const getDateClass = (date) => {
    const classes = ["custom-datepicker__day"];
    const today = new Date();
    const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

    // Outside current month
    if (!isCurrentMonth) {
      classes.push("custom-datepicker__day--outside-month");
    }

    // Today
    if (date.toDateString() === today.toDateString()) {
      classes.push("custom-datepicker__day--today");
    }

    // Selected date
    if (selected && date.toDateString() === selected.toDateString()) {
      classes.push("custom-datepicker__day--selected");
    }

    // Available/unavailable dates
    const selectable = isDateSelectable(date);
    if (selectable) {
      classes.push("custom-datepicker__day--available");
    } else {
      classes.push("custom-datepicker__day--disabled");
    }

    return classes.join(" ");
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not on any calendar content
    if (
      e.target.classList &&
      e.target.classList.contains("custom-datepicker-popup")
    ) {
      handleCloseCalendar();
    }
  };

  const availableCount = includeDates.length;
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  // Calendar Portal Component
  const CalendarPopup = () => (
    <div
      className="custom-datepicker-popup"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Date picker"
    >
      <div
        className="custom-datepicker-calendar"
        ref={calendarRef}
        tabIndex={-1}
        onKeyDown={handleCalendarKeyDown}
        role="application"
        aria-label={`Calendar for ${months[currentMonthIndex]} ${currentYear}`}
      >
        {/* Header Info */}
        <div className="custom-datepicker-header-info">
          <span className="custom-datepicker-info-text">
            📅 Chọn ngày phù hợp với lịch trình của bạn
          </span>
          <span className="custom-datepicker-available-count">
            {availableCount} ngày có sẵn
          </span>
        </div>

        {/* Navigation Header */}
        <div className="custom-datepicker-header">
          <button
            type="button"
            className="custom-datepicker-nav-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigateYear(-1);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            title="Năm trước"
            aria-label="Previous year"
          >
            «
          </button>
          <button
            type="button"
            className="custom-datepicker-nav-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigateMonth(-1);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            title="Tháng trước"
            aria-label="Previous month"
          >
            ‹
          </button>

          <div className="custom-datepicker-current-month">
            <span className="custom-datepicker-month">
              {months[currentMonthIndex]}
            </span>
            <span className="custom-datepicker-year">{currentYear}</span>
          </div>

          <button
            type="button"
            className="custom-datepicker-nav-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigateMonth(1);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            title="Tháng sau"
            aria-label="Next month"
          >
            ›
          </button>
          <button
            type="button"
            className="custom-datepicker-nav-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigateYear(1);
            }}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            title="Năm sau"
            aria-label="Next year"
          >
            »
          </button>
        </div>

        {/* Weekdays Header */}
        <div className="custom-datepicker-weekdays" role="row">
          {weekdays.map((day) => (
            <div
              key={day}
              className="custom-datepicker-weekday"
              role="columnheader"
              aria-label={`Column ${day}`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div
          className="custom-datepicker-days"
          role="grid"
          aria-label="Calendar grid"
        >
          {getCalendarDays().map((date, index) => {
            const isSelectable = isDateSelectable(date);
            const isCurrentMonth = date.getMonth() === currentMonthIndex;
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <button
                key={index}
                type="button"
                className={getDateClass(date)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDateClick(date);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                disabled={!isSelectable}
                title={`${formatDate(date)}${
                  isSelectable ? " - Có thể đặt lịch" : " - Không có lịch"
                }`}
                aria-label={`${formatDate(date)}${
                  selected && date.toDateString() === selected.toDateString()
                    ? ", đã chọn"
                    : ""
                }${isSelectable ? ", có thể đặt lịch" : ", không có lịch"}`}
                role="gridcell"
                aria-selected={
                  selected && date.toDateString() === selected.toDateString()
                }
                tabIndex={
                  selected && date.toDateString() === selected.toDateString()
                    ? 0
                    : -1
                }
                style={{
                  pointerEvents: isSelectable ? "auto" : "none",
                  cursor: isSelectable ? "pointer" : "not-allowed",
                  opacity: !isCurrentMonth ? 0.3 : isSelectable ? 1 : 0.5,
                }}
              >
                <span className="custom-datepicker-day-number">
                  {date.getDate()}
                </span>
                {isSelectable && isCurrentMonth && (
                  <span
                    className="custom-datepicker-day-indicator"
                    aria-hidden="true"
                  >
                    ✓
                  </span>
                )}
                {isToday && (
                  <span className="custom-datepicker-today-indicator">•</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="custom-datepicker-footer">
          <button
            type="button"
            className="custom-datepicker-close-btn"
            onClick={handleCloseCalendar}
            aria-label="Close calendar"
          >
            ❌ Đóng
          </button>
          <span className="custom-datepicker-hint" aria-hidden="true">
            💡 Chỉ hiển thị ngày có lịch trống
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="custom-datepicker-container" ref={containerRef}>
      {/* Input Field */}
      <div className="custom-datepicker-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          id={id}
          value={inputValue}
          placeholder={placeholder}
          readOnly
          onClick={handleInputClick}
          onKeyDown={handleInputKeyDown}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          className={`custom-datepicker-input ${className}`}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Choose date"
        />
        <div className="custom-datepicker-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M8 2V5M16 2V5M3.5 9.5H20.5M4 18V7C4 5.89543 4.89543 5 6 5H18C19.1046 5 20 5.89543 20 7V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Calendar Popup - Rendered via Portal */}
      {isOpen && createPortal(<CalendarPopup />, document.body)}
    </div>
  );
};

export default CustomDatePicker;

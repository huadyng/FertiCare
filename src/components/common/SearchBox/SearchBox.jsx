import React, { useState } from "react";
import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";

const { Search } = Input;

const SearchBox = ({
  onSearch,
  placeholder = "Tìm kiếm dịch vụ, bác sĩ, thông tin...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Xử lý thay đổi input
  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  // Xử lý submit form
  const handleSubmit = (value) => {
    if (value && value.trim()) {
      onSearch(value);
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "500px", margin: "0 auto" }}>
      <Search
        placeholder={placeholder}
        enterButton={
          <span>
            <SearchOutlined />
            Tìm kiếm
          </span>
        }
        size="large"
        onSearch={handleSubmit}
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: "100%" }}
      />
    </div>
  );
};

export default SearchBox;

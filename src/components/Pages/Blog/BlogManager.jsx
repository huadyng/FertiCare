import React, { useEffect, useState } from "react";
import {
  getAllBlogsForManager,
  approveBlog,
  archiveBlog,
  deleteBlog,
} from "../../../api/apiBlog";

import sampleBlogs from "../../../data/sampleBlogs.json";
import "./BlogManager.css";

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);

  const fetchAll = async () => {
    try {
      const apiBlogs = await getAllBlogsForManager();
      const staticBlogs = sampleBlogs.map((b) => ({
        ...b,
        source: "static",
        _id: `sample-${Math.random().toString(36).substring(2, 8)}`,
        createdAt: new Date().toISOString(),
      }));
      setBlogs([...apiBlogs, ...staticBlogs]);
    } catch (err) {
      console.error("Lỗi khi tải blog:", err);
      setBlogs([]);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAction = async (id, action, isStatic) => {
    if (isStatic) {
      alert("Không thể thao tác với blog mẫu.");
      return;
    }

    try {
      if (action === "approve") await approveBlog(id);
      if (action === "archive") await archiveBlog(id);
      if (action === "delete") await deleteBlog(id);
      fetchAll();
    } catch (err) {
      alert("Thao tác thất bại");
    }
  };

  return (
    <div className="blog-manager">
      <h4>Quản lý bài viết</h4>
      {blogs.map((blog) => (
        <div key={blog._id} className="blog-card manager-card">
          {blog.imageUrl && (
            <img src={blog.imageUrl} alt="" className="blog-image" />
          )}
          <h5>{blog.title || "Bài viết"}</h5>
          <div className="blog-meta">
            <span>{blog.author?.name || blog.authorName || "Ẩn danh"}</span> |{" "}
            <span>
              {blog.createdAt
                ? new Date(blog.createdAt).toLocaleString()
                : "Không rõ ngày"}
            </span>
          </div>
          <p>{blog.content}</p>

          <div className="manager-actions">
            {blog.source === "static" && (
              <span className="static-label">🌟 Blog mẫu</span>
            )}

            {!blog.published && blog.source !== "static" && (
              <button
                className="btn btn-success btn-sm"
                onClick={() => handleAction(blog._id, "approve", false)}
              >
                Duyệt
              </button>
            )}

            <button
              className="btn btn-warning btn-sm"
              onClick={() => handleAction(blog._id, "archive", blog.source === "static")}
            >
              Ẩn bài
            </button>

            <button
              className="btn btn-danger btn-sm"
              onClick={() => handleAction(blog._id, "delete", blog.source === "static")}
            >
              Xóa
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

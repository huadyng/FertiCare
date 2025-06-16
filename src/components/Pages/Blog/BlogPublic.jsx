import React, { useEffect, useState } from "react";
import {
  createBlog,
  getPublishedBlogs,
} from "../../../api/apiBlog";
import sampleBlogs from "../../../data/sampleBlogs.json";
import "./Blog.css";
import defaultAvatar from "../../../assets/img/default-avatar.png";
import { useNavigate } from "react-router-dom";

export default function BlogPublic({ currentUser, onLoginRedirect }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [reload, setReload] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const realBlogs = (await getPublishedBlogs()).map((b) => ({
          ...b,
          source: "api",
        }));
        const staticBlogs = sampleBlogs.map((b) => ({
          ...b,
          source: "static",
          id: `sample-${Math.random().toString(36).substring(2, 8)}`, // tạo id giả
        }));
        setBlogs([...realBlogs, ...staticBlogs]);
      } catch (err) {
        console.error("Lỗi khi tải blog từ API:", err);
        const staticBlogs = sampleBlogs.map((b) => ({
          ...b,
          source: "static",
          id: b.id, // ✅ dùng đúng id từ file json
        }));
        setBlogs(staticBlogs); // fallback tĩnh
      }
    };

    fetchBlogs();
  }, [reload]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      onLoginRedirect();
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) formData.append("image", image);

    try {
      await createBlog(formData);
      setTitle("");
      setContent("");
      setImage(null);
      setReload(!reload);
    } catch (error) {
      console.error("Lỗi khi đăng blog", error);
    }
  };

  return (
    <div className="blog-container-flex">
      {/* Bên trái: form đăng bài */}
      <div className="blog-left">
        <div className="user-info">
          <img
            src={currentUser?.avatar || currentUser?.photoURL || defaultAvatar}
            alt="avatar"
            className="avatar"
          />
          <span className="username">
            {currentUser?.name || currentUser?.displayName || "Khách"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="blog-form">
          <input
            type="text"
            className="title-input"
            placeholder="Tiêu đề bài viết"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="content-input"
            placeholder="Chia sẻ cảm nghĩ của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
          />

          {image && (
            <div className="preview-image-container">
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="preview-image"
              />
            </div>
          )}

          {currentUser ? (
            <button type="submit" className="post-button">
              Đăng bài
            </button>
          ) : (
            <button
              type="button"
              className="login-button"
              onClick={() => navigate("/login")}
            >
              Đăng nhập để đăng bài
            </button>
          )}
        </form>
      </div>

      {/* Bên phải: Danh sách blog */}
      <div className="blog-right">
        {blogs.map((blog, index) => (
          <div
            key={blog.id || `blog-${index}`}
            className="blog-card"
            onClick={() => navigate(`/blog/${blog.id}`)} // 👉 Chuyển sang trang chi tiết
          >
            <img
              src={blog.image || defaultAvatar}
              alt="blog"
              className="card-image"
            />
            <div className="card-body">
              <h4 className="card-title">{blog.title || "Không có tiêu đề"}</h4>
              <p className="card-snippet">
                {blog.content?.length > 100
                  ? blog.content.substring(0, 100) + "..."
                  : blog.content}
              </p>
              <div className="card-meta">
                <span>{blog.authorName || "Ẩn danh"}</span>
                <span>
                  {blog.createdAt
                    ? new Date(blog.createdAt).toLocaleString()
                    : "Không rõ ngày"}
                </span>
              </div>
              {blog.source === "static" && (
                <span className="static-label">🌟 Blog mẫu</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

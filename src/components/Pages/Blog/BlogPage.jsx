import React, { useState } from "react";
import "./BlogPage.css";

const currentUser = {
  name: "Nguyễn Văn A",
  avatar:
    "https://i.pravatar.cc/50?u=nguyenvana",
};

export default function BlogPage() {
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const [posts, setPosts] = useState([]);

  // State cho ảnh xem full màn hình
  const [modalImage, setModalImage] = useState(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!content.trim() && images.length === 0) {
      alert("Vui lòng nhập nội dung hoặc chọn ảnh");
      return;
    }

    const newPost = {
      content,
      images: images.map((file) => URL.createObjectURL(file)),
      createdAt: new Date().toLocaleString(),
      user: currentUser,
    };

    setPosts([newPost, ...posts]);
    setContent("");
    setImages([]);
  };

  // Mở modal ảnh
  const openModal = (imgUrl) => {
    setModalImage(imgUrl);
  };

  // Đóng modal
  const closeModal = () => {
    setModalImage(null);
  };

  return (
    <div className="blog-container">
      <form className="blog-form" onSubmit={handleSubmit}>
        <h2 className="form-title">Đăng bài</h2>

        <div className="form-user-info">
          <img src={currentUser.avatar} alt="avatar" className="form-avatar" />
          <span className="form-username">{currentUser.name}</span>
        </div>

        <textarea
          className="blog-textarea"
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          maxLength={500}
        />

        <div className="image-upload-wrapper">
          <label htmlFor="imageUpload" className="image-upload-label">
            📷 Thêm ảnh
          </label>
          <input
            id="imageUpload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="image-upload-input"
          />
        </div>

        {images.length > 0 && (
          <div className="image-preview-container">
            {images.map((img, i) => (
              <div key={i} className="image-preview-item">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${i}`}
                  className="image-preview"
                />
                <button
                  type="button"
                  className="remove-image-btn"
                  onClick={() => handleRemoveImage(i)}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="blog-submit-btn">
          Đăng bài
        </button>
      </form>

      <div className="posts-feed">
        {posts.length === 0 && (
          <p className="no-posts-text">Chưa có bài đăng nào.</p>
        )}
        {posts.map((post, idx) => (
          <div key={idx} className="post-item">
            <div className="post-header">
              <img
                src={post.user.avatar}
                alt="avatar"
                className="post-avatar"
              />
              <div>
                <h4>{post.user.name}</h4>
                <p className="post-time">{post.createdAt}</p>
              </div>
            </div>
            <p className="post-content">{post.content}</p>
            {post.images.length > 0 && (
              <div className="post-images">
                {post.images.map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`post-img-${i}`}
                    className="post-image"
                    onClick={() => openModal(imgUrl)}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal full màn hình khi bấm vào ảnh */}
      {modalImage && (
        <div className="modal-image-overlay" onClick={closeModal}>
          <div
            className="modal-image-content"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={modalImage} alt="full-view" />
            <button className="modal-close-btn" onClick={closeModal}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

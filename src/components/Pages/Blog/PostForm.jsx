import React, { useState } from "react";

export default function PostForm({ onAddPost }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !content) return;

    const newPost = {
      title,
      content,
      image: image ? URL.createObjectURL(image) : null,
      createdAt: new Date().toLocaleString(),
    };

    onAddPost(newPost);

    // Clear form
    setTitle("");
    setContent("");
    setImage(null);
  };

  return (
    <form className="post-form p-4 rounded shadow-sm" onSubmit={handleSubmit}>
      <h3 className="mb-3">📝 Viết bài chia sẻ</h3>
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Tiêu đề bài viết"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div className="mb-3">
        <textarea
          className="form-control"
          placeholder="Nội dung chia sẻ..."
          rows="4"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        ></textarea>
      </div>
      <div className="mb-3">
        <input
          type="file"
          accept="image/*"
          className="form-control"
          onChange={(e) => setImage(e.target.files[0])}
        />
      </div>
      <button type="submit" className="btn btn-primary w-100">
        Đăng bài ✨
      </button>
    </form>
  );
}

import React, { useState } from "react";
import PostForm from "./PostForm";
import PostCard from "./PostCard";
import "./Blog.css";

export default function BlogPage() {
  const [posts, setPosts] = useState([]);

  const handleAddPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="blog-page container py-5">
      <h1 className="text-center mb-4">🌸 Blog chia sẻ kinh nghiệm 🌸</h1>
      <PostForm onAddPost={handleAddPost} />
      <div className="post-list mt-5">
        {posts.length === 0 ? (
          <p className="text-center text-muted">Chưa có bài viết nào.</p>
        ) : (
          posts.map((post, index) => (
            <PostCard key={index} post={post} />
          ))
        )}
      </div>
    </div>
  );
}

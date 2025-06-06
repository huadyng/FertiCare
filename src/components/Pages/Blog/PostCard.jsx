import React from "react";

export default function PostCard({ post }) {
  return (
    <div className="post-card card mb-4 shadow-sm animate__animated animate__fadeInUp">
      {post.image && (
        <img
          src={post.image}
          alt="Post"
          className="card-img-top post-image"
          style={{ objectFit: "cover", maxHeight: "300px" }}
        />
      )}
      <div className="card-body">
        <h5 className="card-title text-primary">{post.title}</h5>
        <p className="card-text">{post.content}</p>
        <div className="text-muted small text-end">{post.createdAt}</div>
      </div>
    </div>
  );
}

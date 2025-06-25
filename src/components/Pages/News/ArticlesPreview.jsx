import React from "react";
import { Link } from "react-router-dom";
import articles from "./ArticlesData"; 
import "./Articles.css";

export default function ArticlePreview() {
  const previewArticles = articles.slice(0, 3); // Hiển thị 3 bài đầu tiên

  return (
    <div className="articles-preview">
      <h2 className="articles-title">Bài Viết Mới Nhất</h2>
      <div className="articles-grid">
        {previewArticles.map((article) => (
          <div className="article-card" key={article.id}>
            <img src={article.image} alt={article.title} className="article-image" />
            <div className="article-content">
              <h3 className="article-title">{article.title}</h3>
              <p className="article-summary">{article.summary}</p>
              <Link to={`/articles/${article.id}`}>
                <button className="read-more-btn">Đọc thêm →</button>
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <Link to="/articles">
          <button className="read-more-btn">Xem tất cả bài viết</button>
        </Link>
      </div>
    </div>
  );
}

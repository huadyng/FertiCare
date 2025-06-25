import React from "react";
import { Link } from "react-router-dom";
import "./Articles.css";
import articles from "./ArticlesData";
export const getArticleById = (id) => {
  return articles.find((a) => a.id === parseInt(id));
};
export default function Articles() {
  return (
    <div className="articles-container">
      <h1 className="articles-title">Những thành tựu của chúng tôi</h1>
      <div className="articles-grid">
        {articles.map((article) => (
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
    </div>
  );
}

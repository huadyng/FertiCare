import React from "react";
import { useParams, Link } from "react-router-dom";
import { getArticleById } from "./Articles";
import "./ArticlesDetail.css";

export default function ArticleDetail() {
  const { id } = useParams();
  const article = getArticleById(id);

  if (!article) {
    return <div className="article-not-found">Bài viết không tồn tại.</div>;
  }

  return (
    <div className="article-detail-container">
      <img src={article.image} alt={article.title} className="article-detail-image" />
      <h1 className="article-detail-title">{article.title}</h1>
      <p className="article-detail-content">{article.content}</p>
      <Link to="/articles" className="back-to-list">← Quay lại danh sách</Link>
    </div>
  );
}

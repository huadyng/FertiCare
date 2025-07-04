import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBlogById } from "../../../api/apiBlog";
import sampleBlogs from "../../../data/sampleBlogs.json";
import "./BlogDetail.css";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      window.scrollTo(0, 0);
      if (id.startsWith("sample-")) {
        const staticBlog = sampleBlogs.find((b) => b.id === id);
        setBlog(staticBlog || null);
        setLoading(false);
        return;
      }
      try {
        const res = await getBlogById(id);
        setBlog(res);
      } catch (err) {
        setBlog(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id]);

  if (loading) return <div>Đang tải bài viết...</div>;
  if (!blog) return <div>Không tìm thấy bài viết.</div>;

  return (
    <div className="blog-detail-layout">
      <div className="blog-main">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Quay lại
        </button>
        <h1>{blog.title}</h1>
        {blog.image && (
          <img src={blog.image} alt="blog" className="detail-image" />
        )}
        <div className="blog-meta-detail">
          <span>Tác giả: {blog.authorName || "Ẩn danh"}</span>
          <span>
            Ngày đăng:{" "}
            {blog.createdAt
              ? new Date(blog.createdAt).toLocaleString()
              : "Không rõ"}
          </span>
        </div>
        <p className="detail-content">{blog.content}</p>
      </div>

      <div className="blog-side">
          <h3>Bài viết khác</h3>

          {[...sampleBlogs].concat(blog.source !== "static" ? [blog] : []).slice(0, 10) // lấy thêm nếu cần
            .filter((b) => b.id !== id) // không hiện lại bài đang xem
            .map((b) => (
              <Link
                to={`/blog/${b.id}`}
                key={b.id}
                className="blog-card-small"
              >
                <img src={b.image} alt={b.title} className="card-image-small" />
                <div className="card-body-small">
                  <h4 className="card-title-small">{b.title}</h4>
                  <p className="card-meta-small">
                    {b.authorName || "Ẩn danh"} |{" "}
                    {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : ""}
                  </p>
                </div>
              </Link>
            ))}
        </div>

    </div>
  );
}

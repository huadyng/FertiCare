import React, { useEffect, useState, useContext } from "react";
import {
  createBlog,
  getPublishedBlogs,
} from "../../../api/apiBlog";
import sampleBlogs from "../../../data/sampleBlogs.json";
import "./Blog.css";
import defaultAvatar from "../../../assets/img/default-avatar.png";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../../context/UserContext";

export default function BlogPublic({ onLoginRedirect }) {
  // Sử dụng layout Blog.css: .blog-container-flex, .blog-left, .blog-right, ...
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [showSample, setShowSample] = useState(true); // Cho phép bật/tắt blog mẫu
  const [reload, setReload] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 5;

  const navigate = useNavigate();
  const { user, isLoggedIn } = useContext(UserContext);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const realBlogs = await getPublishedBlogs();
        let allBlogs = realBlogs;
        if (showSample) {
          // Gắn nhãn cho blog mẫu để phân biệt
          const staticBlogs = sampleBlogs.map((b, idx) => ({ ...b, source: "static", id: b.id || `sample-${idx}` }));
          allBlogs = [...staticBlogs, ...realBlogs];
        }
        setBlogs(allBlogs);
      } catch (err) {
        console.error("Lỗi khi tải blog từ API:", err);
        if (showSample) {
          setBlogs(sampleBlogs.map((b, idx) => ({ ...b, source: "static", id: b.id || `sample-${idx}` })));
        } else {
          setBlogs([]);
        }
      }
    };
    fetchBlogs();
  }, [reload, showSample]);

  // Hàm upload ảnh blog lên server, trả về fileUrl
  const uploadBlogImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/blog-images/upload", {
        method: "POST",
        body: formData,
        headers: {
          // Không set Content-Type, để browser tự set boundary
        },
        credentials: "include"
      });
      if (!res.ok) throw new Error("Upload ảnh thất bại");
      const data = await res.json();
      return data.fileUrl;
    } catch (err) {
      console.error("Lỗi upload ảnh:", err);
      throw err;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn || !user) {
      onLoginRedirect ? onLoginRedirect() : navigate("/login");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setSuccessMessage("Vui lòng nhập tiêu đề và nội dung!");
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        setSuccessMessage("");
      }, 2500);
      return;
    }

    setIsSubmitting(true);

    // Chuẩn hóa: luôn gửi FormData cho backend
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("tags", "");
    if (image) {
      try {
        const fileUrl = await uploadBlogImage(image);
        formData.append("coverImage", fileUrl);
        formData.append("images", fileUrl); // Nếu backend nhận mảng images[] thì cần sửa lại
      } catch (err) {
        setSuccessMessage("Upload ảnh thất bại. Vui lòng thử lại!");
        setShowPopup(true);
        setIsSubmitting(false);
        setTimeout(() => {
          setShowPopup(false);
          setSuccessMessage("");
        }, 2500);
        return;
      }
    }

    try {
      await createBlog(formData);
      setTitle("");
      setContent("");
      setImage(null);
      setReload((r) => !r);
      setSuccessMessage("Đăng bài thành công! Bài viết của bạn đang chờ duyệt.");
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        setSuccessMessage("");
      }, 3500);
    } catch (error) {
      setSuccessMessage("Đăng blog thất bại. Vui lòng thử lại hoặc kiểm tra kết nối!");
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        setSuccessMessage("");
      }, 3500);
      console.error("Lỗi khi đăng blog", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserDisplayInfo = () => {
    if (!user) return { avatar: defaultAvatar, username: "Khách" };
    return {
      avatar: user.avatar || user.picture || user.photoURL || defaultAvatar,
      username: user.username || user.name || user.fullName || user.displayName || user.email || "Người dùng"
    };
  };

  const { avatar, username } = getUserDisplayInfo();

  // Lọc blog theo tiêu đề
  const filteredBlogs = blogs.filter(blog =>
    blog.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const displayedBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  return (
    <div className="blog-container-flex">
      {/* Cột trái: Form đăng bài */}
      <div className="blog-left">
        <div className="user-info" style={{marginBottom: 24, background: 'linear-gradient(90deg,#fbc2eb 0%,#a6c1ee 100%)', borderRadius: 16, padding: 18, boxShadow: '0 4px 16px #e8439315'}}>
          <img src={avatar} alt="avatar" className="avatar" style={{border: '3px solid #fff', boxShadow: '0 2px 8px #e8439340'}} />
          <div>
            <div className="username" style={{fontWeight: 700, fontSize: 20, color: '#e84393'}}>{username}</div>
            <div style={{fontSize: 14, color: '#555', fontStyle: 'italic'}}>{isLoggedIn ? "Sẵn sàng chia sẻ" : "Chưa đăng nhập"}</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{background: 'rgba(255,255,255,0.98)', borderRadius: 18, boxShadow: '0 8px 32px #e8439315', padding: 24, marginBottom: 18}}>
          <div style={{fontWeight: 700, fontSize: 18, color: '#e84393', marginBottom: 10, letterSpacing: 0.5}}>Tạo bài viết mới</div>
          <input
            type="text"
            className="title-input"
            placeholder="Tiêu đề bài viết của bạn..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{marginBottom: 12, fontWeight: 500, fontSize: 16}}
          />
          <textarea
            className="content-input"
            placeholder="Chia sẻ câu chuyện, kinh nghiệm hoặc câu hỏi của bạn..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            style={{marginBottom: 12, fontSize: 15, minHeight: 120, background: '#f8f9fa'}}
          />
          <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10}}>
            <label htmlFor="image-upload" style={{cursor: 'pointer', color: '#e84393', fontWeight: 600, fontSize: 15}}>
              <i className="bi bi-image" style={{fontSize: 20, marginRight: 4}}></i>Thêm ảnh
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              style={{display: 'none'}}
            />
            {image && (
              <span style={{color: '#555', fontSize: 14}}>{image.name}</span>
            )}
            {image && (
              <button type="button" className="btn btn-sm btn-outline-danger ms-2" onClick={() => setImage(null)} style={{fontSize: 13, padding: '2px 10px'}}>Xóa</button>
            )}
          </div>
          {image && (
            <div className="preview-image-container" style={{marginBottom: 10}}>
              <img src={URL.createObjectURL(image)} alt="preview" className="preview-image" style={{maxHeight: 160, border: '2px solid #e84393', boxShadow: '0 2px 8px #e8439340'}} />
            </div>
          )}
          <div style={{display: 'flex', gap: 8, marginTop: 12}}>
            {isLoggedIn && user ? (
              <button type="submit" className="post-button" disabled={isSubmitting} style={{minWidth: 120, fontWeight: 600, fontSize: 16, background: 'linear-gradient(90deg,#e84393,#fbc2eb)'}}>
                {isSubmitting ? <span><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Đang đăng...</span> : "Đăng bài"}
              </button>
            ) : (
              <button type="button" className="login-button" onClick={() => navigate("/login")}>Đăng nhập</button>
            )}
          </div>
        </form>
        {showPopup && (
          <div style={{marginTop: 18, color: successMessage.includes('thành công') ? '#28a745' : '#e84343', fontWeight: 600, fontSize: 16, textAlign: 'center', background: '#fff', borderRadius: 10, padding: 10, boxShadow: '0 2px 8px #e8439340'}}>{successMessage}</div>
        )}
      </div>

      {/* Cột phải: Danh sách blog */}
      <div className="blog-right">
        <div style={{width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 8}}>
          <div>
            <h2 style={{margin: 0, fontWeight: 700, color: '#e84393'}}>Bài viết cộng đồng</h2>
            <div style={{fontSize: 15, color: '#888'}}>{filteredBlogs.length} bài viết</div>
          </div>
          <div>
            <button className={"btn btn-sm " + (showSample ? "btn-success" : "btn-outline-secondary")}
              onClick={() => setShowSample(s => !s)}
              style={{minWidth: 120, fontWeight: 500}}
              title="Bật/tắt hiển thị blog mẫu">
              {showSample ? "Ẩn blog mẫu" : "Hiện blog mẫu"}
            </button>
          </div>
        </div>
        <div className="search-bar mb-3" style={{width: '100%', maxWidth: 400}}>
          <input
            type="text"
            className="form-control"
            placeholder="Tìm kiếm theo tiêu đề..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            style={{maxWidth: 350}}
          />
        </div>
        <div style={{width: '100%'}}>
          <div className="blog-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 32,
            margin: 0,
            padding: 0,
            width: '100%',
            // Responsive: 5 columns desktop, 3 tablet, 1 mobile
            // (handled in Blog.css, but fallback here for safety)
          }}>
            {displayedBlogs.slice(0, blogsPerPage).map((blog, index) => {
              const coverImg = blog.coverImage || blog.image || (blog.images && blog.images[0]) || defaultAvatar;
              const authorName = blog.authorName || blog.author || blog.username || blog.createdBy || "Ẩn danh";
              const createdAt = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('vi-VN', {
                year: 'numeric', month: 'short', day: 'numeric'
              }) : "Không rõ ngày";
              return (
                <article 
                  key={blog.id || `blog-${index}`}
                  className={"blog-card shadow-sm " + (blog.source === "static" ? "static-label" : "")}
                  onClick={() => navigate(`/blog/${blog.id}`)}
                  style={{
                    borderRadius: 20,
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg,#fff 80%,#fbc2eb 100%)',
                    boxShadow: '0 6px 24px #e8439312',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'transform 0.18s',
                    minHeight: 340,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  <div className="card-image" style={{position: 'relative', width: '100%', height: 190, overflow: 'hidden'}}>
                    <img
                      src={coverImg}
                      alt={blog.title}
                      className="blog-image"
                      style={{width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', filter: 'brightness(0.97)'}}
                      onError={e => { e.target.onerror = null; e.target.src = defaultAvatar; }}
                    />
                    {blog.source === "static" && (
                      <span className="static-label" style={{position: 'absolute', top: 12, right: 12, zIndex: 2, background: '#ffe4ec', color: '#b5179e', fontWeight: 700, fontSize: 13, padding: '4px 12px', borderRadius: 8}}>Mẫu</span>
                    )}
                    <div style={{position: 'absolute', bottom: 0, left: 0, width: '100%', height: 38, background: 'linear-gradient(0deg,#fff8,transparent)', zIndex: 1}}></div>
                  </div>
                  <div className="card-body" style={{padding: '1.2rem 1.5rem 1.1rem 1.5rem', display: 'flex', flexDirection: 'column', minHeight: 180, flex: 1}}>
                    <div className="card-meta" style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 14, color: '#b5179e', fontWeight: 600}}>
                      <span style={{display: 'flex', alignItems: 'center', gap: 4}}>
                        <i className="bi bi-person-circle" style={{fontSize: 17, marginRight: 2}}></i>{authorName}
                      </span>
                      <span style={{marginLeft: 'auto', color: '#888', fontWeight: 400, fontSize: 13}}>{createdAt}</span>
                    </div>
                    <div className="card-title" style={{fontSize: 19, fontWeight: 700, color: '#e84393', marginBottom: 6, lineHeight: 1.3, minHeight: 44}}>{blog.title || "Không có tiêu đề"}</div>
                    <div className="card-snippet" style={{fontSize: 15, color: '#444', lineHeight: 1.6, marginBottom: 8, minHeight: 48, maxHeight: 60, overflow: 'hidden'}}>
                      {blog.content?.length > 120
                        ? blog.content.substring(0, 120) + "..."
                        : blog.content}
                    </div>
                    <div style={{display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginTop: 'auto'}}>
                      <span style={{color: '#e84393', fontWeight: 600, fontSize: 14, letterSpacing: 0.2}}>Đọc bài viết <i className="bi bi-arrow-right-short" style={{fontSize: 20, verticalAlign: 'middle'}}></i></span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
        {/* Phân trang */}
        {totalPages > 1 && (
          <div className="pagination d-flex justify-content-center align-items-center mt-4 gap-2" style={{width: '100%'}}>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>Trước</button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={"btn btn-sm " + (currentPage === i + 1 ? "btn-primary" : "btn-outline-primary")}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button className="btn btn-outline-secondary btn-sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>Sau</button>
          </div>
        )}
        {filteredBlogs.length === 0 && (
          <div className="empty-state" style={{width: '100%'}}>
            <div className="empty-content">
              <div className="empty-icon">📝</div>
              <h3>Không tìm thấy bài viết nào</h3>
              <p>Hãy thử từ khóa khác hoặc chia sẻ câu chuyện của bạn!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

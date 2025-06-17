import React from "react";
import { Link } from "react-router-dom";
import "./Articles.css";

const articles = [
  {
    id: 1,
    title: "Thụ tinh trong ống nghiệm: Hành trình hy vọng",
    summary: "Bài viết chia sẻ kinh nghiệm thực tế của các cặp vợ chồng đã thành công nhờ IVF.",
    image: "https://thanhnien.mediacdn.vn/Uploaded/ngocthanh/2022_10_11/tu-chu-benh-vien-2486.jpg",
    content: "Đây là nội dung chi tiết của bài viết số 1...",
  },
  {
    id: 2,
    title: "Các yếu tố ảnh hưởng đến khả năng thụ thai",
    summary: "Tìm hiểu về chế độ ăn uống, sinh hoạt, tâm lý và các nguyên nhân khác ảnh hưởng đến việc mang thai.",
    image: "https://thanhnien.mediacdn.vn/Uploaded/ngocthanh/2022_10_11/tu-chu-benh-vien-2486.jpg",
    content: "Đây là nội dung chi tiết của bài viết số 2...",
  },
  {
    id: 3,
    title: "Lựa chọn trung tâm hỗ trợ sinh sản uy tín",
    summary: "Những tiêu chí quan trọng khi chọn nơi điều trị vô sinh hiếm muộn hiệu quả.",
    image: "https://thanhnien.mediacdn.vn/Uploaded/ngocthanh/2022_10_11/kham-chua-benh-3846.jpg",
    content: "Đây là nội dung chi tiết của bài viết số 3...",
  },
  {
    id: 4,
    title: "Thủ tục và chi phí khi làm IVF tại Việt Nam",
    summary: "Chi tiết các bước thực hiện IVF, giấy tờ cần chuẩn bị và dự trù chi phí điều trị.",
    image: "https://thanhnien.mediacdn.vn/Uploaded/ngocthanh/2022_10_11/kham-chua-benh-3846.jpg",
    content: "Đây là nội dung chi tiết của bài viết số 4...",
  },
  {
    id: 5,
    title: "Thủ tục và chi phí khi làm IVF tại Việt Nam",
    summary: "Chi tiết các bước thực hiện IVF, giấy tờ cần chuẩn bị và dự trù chi phí điều trị.",
    image: "https://thanhnien.mediacdn.vn/Uploaded/ngocthanh/2022_10_11/kham-chua-benh-3846.jpg",
    content: "Đây là nội dung chi tiết của bài viết số 4...",
  },
  {
    id: 6,
    title: "Thủ tục và chi phí khi làm IVF tại Việt Nam",
    summary: "Chi tiết các bước thực hiện IVF, giấy tờ cần chuẩn bị và dự trù chi phí điều trị.",
    image: "https://thanhnien.mediacdn.vn/Uploaded/ngocthanh/2022_10_11/kham-chua-benh-3846.jpg",
    content: "Đây là nội dung chi tiết của bài viết số 4...",
  },
  {
    id: 7,
    title: "Thủ tục và chi phí khi làm IVF tại Việt Nam",
    summary: "Chi tiết các bước thực hiện IVF, giấy tờ cần chuẩn bị và dự trù chi phí điều trị.",
    image: "https://thanhnien.mediacdn.vn/Uploaded/ngocthanh/2022_10_11/kham-chua-benh-3846.jpg",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pellentesque non nisi sed volutpat. Nam ultricies purus at magna laoreet iaculis. Fusce massa mauris, malesuada eget ultrices sit amet, eleifend eget ante. Vivamus sed ipsum eget risus finibus tincidunt vel ut mi. Donec aliquam fermentum diam eget dapibus. Vestibulum congue congue eleifend. Ut purus ligula, luctus vel tempus vitae, viverra at nibh. Cras feugiat fringilla lorem, sed hendrerit dolor feugiat at. Nullam placerat augue sit amet sem euismod convallis. Duis facilisis non erat quis vestibulum. Integer sit amet porttitor quam. Cras tristique ex id fermentum dignissim.",
  },
  {
    id: 8,
    title: "Thủ tục và chi phí khi làm IVF tại Việt Nam",
    summary: "Chi tiết các bước thực hiện IVF, giấy tờ cần chuẩn bị và dự trù chi phí điều trị.",
    image: "https://thanhnien.mediacdn.vn/Uploaded/ngocthanh/2022_10_11/kham-chua-benh-3846.jpg",
    content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin pellentesque non nisi sed volutpat. Nam ultricies purus at magna laoreet iaculis. Fusce massa mauris, malesuada eget ultrices sit amet, eleifend eget ante. Vivamus sed ipsum eget risus finibus tincidunt vel ut mi. Donec aliquam fermentum diam eget dapibus. Vestibulum congue congue eleifend. Ut purus ligula, luctus vel tempus vitae, viverra at nibh. Cras feugiat fringilla lorem, sed hendrerit dolor feugiat at. Nullam placerat augue sit amet sem euismod convallis. Duis facilisis non erat quis vestibulum. Integer sit amet porttitor quam. Cras tristique ex id fermentum dignissim.",
  },
];

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

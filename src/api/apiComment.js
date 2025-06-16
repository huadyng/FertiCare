import axiosClient from "./axiosClient";

// 1. Tạo comment mới
export const createComment = async (commentData) => {
  try {
    const response = await axiosClient.post("/api/comments", commentData);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo bình luận", error);
    throw error;
  }
};

// 2. Lấy tất cả comment của blog
export const getCommentsByBlogId = async (blogId) => {
  try {
    const response = await axiosClient.get(`/api/comments/blog/${blogId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy bình luận theo blog", error);
    throw error;
  }
};

// 3. Ẩn comment
export const hideComment = async (commentId) => {
  try {
    const response = await axiosClient.delete(`/api/comments/${commentId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi ẩn bình luận", error);
    throw error;
  }
};

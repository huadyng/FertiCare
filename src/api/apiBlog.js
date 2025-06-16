import axiosClient from "./axiosClient";

// Tạo blog mới ((hỗ trợ FormData với ảnh thật)
export const createBlog = async (formData) => {
  try {
    const response = await axiosClient.post("/api/blogs", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo blog", error);
    throw error;
  }
};


// Lấy blog theo ID
export const getBlogById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy blog theo ID", error);
    throw error;
  }
};

// Lấy danh sách blog đã xuất bản
export const getPublishedBlogs = async () => {
  try {
    const response = await axiosClient.get("/api/blogs/published");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy danh sách blog đã xuất bản", error);
    throw error;
  }
};

// Lấy danh sách blog của user hiện tại
export const getMyBlogs = async () => {
  try {
    const response = await axiosClient.get("/api/blogs/my");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy blog của tôi", error);
    throw error;
  }
};

// Lấy tất cả blog (Manager Only)
export const getAllBlogsForManager = async () => {
  try {
    const response = await axiosClient.get("/api/blogs/all");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy tất cả blog", error);
    throw error;
  }
};

// Duyệt bài viết (Manager)
export const approveBlog = async (id) => {
  try {
    const response = await axiosClient.put(`/api/blogs/${id}/approve`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi duyệt blog", error);
    throw error;
  }
};

// Ẩn bài viết (Archive)
export const archiveBlog = async (id) => {
  try {
    const response = await axiosClient.put(`/api/blogs/${id}/archive`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi ẩn blog", error);
    throw error;
  }
};

// Xóa bài viết
export const deleteBlog = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/blogs/${id}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa blog", error);
    throw error;
  }
};

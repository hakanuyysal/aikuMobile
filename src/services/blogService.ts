import axios from 'axios';

const API_URL = 'https://api.aikuaiplatform.com/api';
const BASE_URL = 'https://api.aikuaiplatform.com';
const DEFAULT_IMAGE = `${BASE_URL}/uploads/images/defaultBlogImage.png`;

export interface Blog {
  _id: string;
  title: string;
  fullContent: string;
  coverImage?: string;
  createdAt: string;
  updatedAt: string;
  isApproved?: boolean;
}

const processBlogImage = (blog: Blog): Blog => {
  let coverImage = DEFAULT_IMAGE;
  if (blog.coverImage) {
    if (blog.coverImage.startsWith('http')) {
      coverImage = blog.coverImage;
    } else if (blog.coverImage.startsWith('/uploads')) {
      coverImage = `${BASE_URL}${blog.coverImage}`;
    }
  }
  return { ...blog, coverImage };
};

export const blogService = {
  // Blogları getir
  getBlogs: async (page = 1, limit = 10): Promise<{ success: boolean; blogs: Blog[] }> => {
    try {
      const response = await axios.get(`${API_URL}/blog/all?page=${page}&limit=${limit}`);
      return {
        success: true,
        blogs: (response.data.blogs || []).map(processBlogImage),
      };
    } catch (error) {
      console.error('Bloglar getirilirken hata oluştu:', error);
      return { success: false, blogs: [] };
    }
  },

  // Tek blog getir
  getBlogById: async (id: string): Promise<Blog | null> => {
    try {
      const response = await axios.get(`${API_URL}/blog/${id}`);
      return processBlogImage(response.data.blog);
    } catch (error) {
      console.error('Blog getirilirken hata oluştu:', error);
      return null;
    }
  },

  // Blog oluştur
  createBlog: async (data: Partial<Blog>): Promise<Blog> => {
    try {
      const response = await axios.post(`${API_URL}/blog`, data);
      return processBlogImage(response.data.blog);
    } catch (error) {
      console.error('Blog oluşturulurken hata oluştu:', error);
      throw error;
    }
  },

  // Blog kapak fotoğrafı yükle
  uploadBlogCover: async (blogId: string, image: any): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('coverImage', {
        uri: image.uri,
        name: image.fileName || 'cover.jpg',
        type: image.type || 'image/jpeg',
      });
      await axios.post(`${API_URL}/blog/${blogId}/cover`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    } catch (error) {
      console.error('Kapak fotoğrafı yüklenirken hata oluştu:', error);
      throw error;
    }
  },
};
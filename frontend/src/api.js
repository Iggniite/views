import axios from "axios";
// const API = "http://localhost:5000";
const API = "https://your-backend-name.onrender.com";;

const getAuthHeaders = () => ({
  headers: { "x-admin-secret": localStorage.getItem("admin_secret") }
});

export const getVideos = () => axios.get(API + "/videos");
export const getViews = (id) => axios.get(API + "/views/" + id);

export const addVideo = (url) => axios.post(`${API}/track`, { url }, getAuthHeaders());
export const deleteVideo = (id) => axios.delete(`${API}/video/${id}`, getAuthHeaders());
export const pauseVideo = (id) => axios.put(`${API}/video/${id}/pause`, {}, getAuthHeaders());
export const resumeVideo = (id) => axios.put(`${API}/video/${id}/resume`, {}, getAuthHeaders());
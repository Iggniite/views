import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API = "https://www.googleapis.com/youtube/v3/videos";

export async function getViews(videoId) {

  const url = `${API}?part=snippet,statistics&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`;

  try {
    const res = await axios.get(url);

    if (!res.data.items || res.data.items.length === 0) {
      console.log("Video not found:", videoId);
      return null;
    }

    const snippet = res.data.items[0].snippet;
    const statistics = res.data.items[0].statistics;

    return {
      views: parseInt(statistics.viewCount),
      title: snippet.title,
      thumbnail: snippet.thumbnails.medium ? snippet.thumbnails.medium.url : snippet.thumbnails.default.url
    };
  } catch (error) {
    console.error(`Error fetching YouTube API for ${videoId}:`, error.message);
    return null;
  }

}
import axios from 'axios';
const URL = 'https://pixabay.com/api/';
const KEY = '30496940-a6648cb8580d319c300be0950';
const PAGE_SIZE = 40;

export async function getImages(searchQuery, page) {
  const params = {
    key: KEY,
    q: searchQuery,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
    per_page: PAGE_SIZE,
  };

  const response = await axios.get(URL, { params });

  return { data: response.data.hits, totalHits: response.data.totalHits };
}

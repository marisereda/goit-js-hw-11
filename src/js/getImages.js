import axios from 'axios';

export function getImages(searchData, page) {
  const params = {
    key: '30496940-a6648cb8580d319c300be0950',
    q: searchData,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
    page: page,
  };

  return axios.get('https://pixabay.com/api/', { params }).then(response => {
    // if (!response.ok) {
    //   throw new Error('nothing found');
    // }
    console.log('totalHits in response', response.data.totalHits);
    return { data: response.data.hits, totalHits: response.data.totalHits };
  });
}

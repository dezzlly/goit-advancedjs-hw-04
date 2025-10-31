import axios from 'axios';

const API_KEY = '52905819-433962418f10cc5e4a65a61ca'; 
const PER_PAGE = 15;

const api = axios.create({
  baseURL: 'https://pixabay.com/api/',
  timeout: 10000,
  params: {
    key: API_KEY,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: true,
  },
});

/**
 * Отримати зображення з пагінацією.
 * @param {string} query - пошукова фраза
 * @param {number} page  - номер сторінки (1..N)
 * @param {number} perPage - скільки елементів за раз (за вимогою — 15)
 * @returns {Promise<{hits: any[], totalHits: number}>}
 */
export async function fetchImages(query, page = 1, perPage = PER_PAGE) {
  const { data } = await api.get('', {
    params: {
      q: query,
      page,
      per_page: perPage,
    },
  });
  return data; 
}

/**
 * Перевірка, чи є ще сторінки для поточного запиту.
 */
export function hasMore({ page, perPage = PER_PAGE, totalHits }) {
  const alreadyLoaded = page * perPage;
  return alreadyLoaded < totalHits;
}

export { PER_PAGE };

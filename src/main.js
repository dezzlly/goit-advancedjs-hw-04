import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import '../src/css/styles.css';

import { fetchImages, hasMore, PER_PAGE } from './js/pixabay-api.js';
import {
  buildGalleryMarkup,
  clearGallery,
  appendToGallery,
  show,
  hide,
  setBusy,
  setMessage,
} from './js/render-functions.js';


const refs = {
  form: document.querySelector('#search-form'),
  input: document.querySelector('#query'),
  gallery: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('#load-more'),
  loader: document.querySelector('#loader'),
  message: document.querySelector('#message'),
};

let state = {
  query: '',
  page: 1,
  totalHits: 0,
  isLoading: false,
};

const lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionsData: 'alt',
  captionDelay: 250,
});


hide(refs.loadMoreBtn);
hide(refs.loader);

refs.form.addEventListener('submit', onSearch);
refs.loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  const q = refs.input.value.trim();

 
  state.query = q;
  state.page = 1;
  state.totalHits = 0;
  setMessage(refs.message, '');
  hide(refs.loadMoreBtn);
  clearGallery(refs.gallery);

  if (!q) {
    setMessage(refs.message, 'Please enter a search term.');
    return;
  }

  await loadImages(); 
}

async function onLoadMore() {
  await loadImages(true); 
}

/**
 * Загальний загрузник сторінок
 * @param {boolean} isNextPage
 */
async function loadImages(isNextPage = false) {
  if (state.isLoading) return;

  try {
    state.isLoading = true;
    setBusy(refs.loadMoreBtn, true);
    show(refs.loader); 

    const data = await fetchImages(state.query, state.page, PER_PAGE);
    const { hits, totalHits } = data;
    state.totalHits = totalHits;

    if (hits.length === 0 && state.page === 1) {
      setMessage(refs.message, 'Sorry, there are no images matching your search query.');
      hide(refs.loadMoreBtn);
      return;
    }

   
    const markup = buildGalleryMarkup(hits);
    appendToGallery(refs.gallery, markup);
    lightbox.refresh();

  
    const more = hasMore({
      page: state.page,
      perPage: PER_PAGE,
      totalHits: state.totalHits,
    });

    if (more) {
      show(refs.loadMoreBtn);
    } else {
      hide(refs.loadMoreBtn);
      setMessage(
        refs.message,
        "We're sorry, but you've reached the end of search results."
      );
    }

    
    if (isNextPage) {
      const firstCard = document.querySelector('.gallery .photo-card');
      if (firstCard) {
        const { height } = firstCard.getBoundingClientRect();
        window.scrollBy({ top: height * 2, behavior: 'smooth' });
      }
    }

    
    state.page += 1;
  } catch (err) {
    console.error(err);
    setMessage(refs.message, 'Unexpected error. Please try again later.');
  } finally {
    state.isLoading = false;
    hide(refs.loader);
    setBusy(refs.loadMoreBtn, false);
  }
}

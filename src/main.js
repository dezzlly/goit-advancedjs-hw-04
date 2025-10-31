import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import '../src/css/styles.css';
import 'izitoast/dist/css/iziToast.min.css';
import iziToast from 'izitoast';
import { fetchImages, hasMore, PER_PAGE } from '../src/js/pixabay-api.js';
import {
  buildGalleryMarkup,
  clearGallery,
  appendToGallery,
  show,
  hide,
  setBusy,
  setMessage,
} from '../src/js/render-functions.js';

function notifySuccess(message) {
  iziToast.success({ message, position: 'topRight', timeout: 2500 });
}
function notifyInfo(message) {
  iziToast.info({ message, position: 'topRight', timeout: 3000 });
}
function notifyError(message) {
  iziToast.error({ message, position: 'topRight', timeout: 3500 });
}

let refs = {};
let state = {
  query: '',
  page: 1,
  totalHits: 0,
  isLoading: false,
};
let lightbox;

document.addEventListener('DOMContentLoaded', () => {
  refs = {
    form: document.querySelector('form.form') || document.querySelector('#search-form'),
    input: document.querySelector('#query'),
    gallery: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('#load-more'),
    loader: document.querySelector('.loader'),
    message: document.querySelector('#message'),
  };

  lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionDelay: 250,
  });

  if (refs.loadMoreBtn) hide(refs.loadMoreBtn);
  if (refs.loader) hide(refs.loader);

  if (!refs.form) {
    console.error('Form element not found. Add class="form" or id="search-form".');
    return;
  }

  refs.form.addEventListener('submit', onSearch);
  refs.loadMoreBtn?.addEventListener('click', onLoadMore);
});

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
    notifyError('Please enter a search term.');
    return;
  }
  await loadImages();
}

async function onLoadMore() {
  await loadImages(true);
}

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
      notifyInfo('No images found for your search query.');
      hide(refs.loadMoreBtn);
      return;
    }

    if (state.page === 1) {
      notifySuccess(`Found ${totalHits} images.`);
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
      notifyInfo("You've reached the end of search results.");
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
    notifyError('Unexpected error. Please try again later.');
  } finally {
    state.isLoading = false;
    hide(refs.loader);
    setBusy(refs.loadMoreBtn, false);
  }
}

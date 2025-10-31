export function buildGalleryMarkup(hits) {
  return hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
<li class="photo-card">
  <a class="gallery__link" href="${largeImageURL}">
    <img class="gallery__image" src="${webformatURL}" alt="${escapeHtml(
          tags
        )}" loading="lazy" />
  </a>
  <ul class="info">
    <li><span>Likes</span><b>${likes}</b></li>
    <li><span>Views</span><b>${views}</b></li>
    <li><span>Comments</span><b>${comments}</b></li>
    <li><span>Downloads</span><b>${downloads}</b></li>
  </ul>
</li>`
    )
    .join('');
}

export function clearGallery(listEl) {
  listEl.innerHTML = '';
}

export function appendToGallery(listEl, markup) {
  if (!markup) return;
  listEl.insertAdjacentHTML('beforeend', markup);
}

export function show(el) {
  el.classList.remove('is-hidden');
}
export function hide(el) {
  el.classList.add('is-hidden');
}

export function setBusy(el, busy = true) {
  el.disabled = busy;
  el.setAttribute('aria-busy', String(busy));
}

export function setMessage(msgEl, text = '') {
  msgEl.textContent = text;
}

function escapeHtml(str = '') {
  return str.replace(/[&<>"']/g, s => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[s]));
}

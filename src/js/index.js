import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

import { getImages } from './getImages';
import { getRefs } from './getRefs';
import { formatNumber } from './formatNumber';

import markup from '../templates/card_markup.hbs';
import sprite from '../images/sprite.svg';

const state = {
  page: 1,
  renderedImagesAmount: 0,
  foundImagesAmount: 0,
  searchQuery: '',
};
const observer = new IntersectionObserver(observe, {
  rootMargin: '30px',
  threshold: 1.0,
});
const gallery = new SimpleLightbox('.gallery a');
const refs = getRefs();
bindEvents();

// ======================================================

function bindEvents() {
  refs.form.addEventListener('submit', onSubmit);
  refs.form.elements.searchQuery.addEventListener('focus', () => {
    refs.checkbox.disabled = false;
    refs.form.elements.submit.disabled = false;
  });
  refs.loadMoreBtn.addEventListener('click', loadMore);
  refs.checkbox.addEventListener('change', () => {
    if (state.renderedImagesAmount !== 0) {
      processAfterRequest();
    }
  });
}

//-------------------------------------------------------

async function onSubmit(event) {
  event.preventDefault();
  const target = event.target;
  state.searchQuery = target.elements.searchQuery.value.trim();
  if (!state.searchQuery) {
    initState();
    return;
  }

  initState();
  processBeforeRequest();

  const requestResult = await makeRequest(state.searchQuery, state.page);
  if (!requestResult) {
    processAfterRequest();
    return;
  }
  state.foundImagesAmount = requestResult.totalHits;
  showRequestResult(requestResult.data);
  processAfterRequest();
}

//-------------------------------------------------------

function initState() {
  refs.gallery.innerHTML = '';
  state.page = 1;
  state.renderedImagesAmount = 0;
  state.foundImagesAmount = 0;
}

//-------------------------------------------------------

function processBeforeRequest() {
  refs.checkbox.disabled = true;
  observer.unobserve(refs.guard);
  refs.loadMoreBtn.classList.add('is-hidden');
  refs.form.elements.submit.disabled = true;
  refs.loader.classList.remove('is-hidden');
}

//-------------------------------------------------------

async function makeRequest(searchQuery) {
  try {
    const { data, totalHits } = await getImages(searchQuery, state.page);
    if (data.length === 0) {
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    if (state.page === 1) {
      Notify.info(`Hooray! We found ${totalHits} images.`);
    }
    return { data, totalHits };
  } catch (error) {
    Notify.failure(error.message);
    return null;
  }
}

//-------------------------------------------------------

function showRequestResult(data) {
  const dataPrepared = data.map(img => ({
    ...img,
    likes: formatNumber(img.likes),
    views: formatNumber(img.views),
    comments: formatNumber(img.comments),
    downloads: formatNumber(img.downloads),
  }));
  refs.gallery.insertAdjacentHTML(
    'beforeend',
    markup({ data: dataPrepared, sprite })
  );

  state.renderedImagesAmount += data.length;
  gallery.refresh();
}

//-------------------------------------------------------

function processAfterRequest() {
  refs.loader.classList.add('is-hidden');
  refs.form.elements.submit.disabled = false;
  refs.checkbox.disabled = false;

  if (!state.foundImagesAmount) {
    refs.loadMoreBtn.classList.add('is-hidden');
    observer.unobserve(refs.guard);
  } else if (state.renderedImagesAmount >= state.foundImagesAmount) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    refs.loadMoreBtn.classList.add('is-hidden');
    observer.unobserve(refs.guard);
  } else if (refs.checkbox.checked) {
    observer.observe(refs.guard);
    refs.loadMoreBtn.classList.add('is-hidden');
  } else {
    observer.unobserve(refs.guard);
    refs.loadMoreBtn.classList.remove('is-hidden');
  }
}

//-------------------------------------------------------

async function loadMore() {
  state.page += 1;
  processBeforeRequest();
  const requestResult = await makeRequest(state.searchQuery, state.page);
  if (!requestResult) {
    return;
  }
  showRequestResult(requestResult.data);
  setSmoothScroll();
  processAfterRequest(requestResult.totalHits);
}

//-------------------------------------------------------

function observe(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadMore();
    }
  });
}

//-------------------------------------------------------

function setSmoothScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

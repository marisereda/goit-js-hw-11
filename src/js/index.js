import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';

import { getImages } from './getImages';
import { getRefs } from './getRefs';
import { formatNumber } from './formatNumber';

import markup from '../templates/card_markup.hbs';
import sprite from '../images/sprite.svg';

const observerOptions = {
  root: null,
  rootMargin: '30px',
  threshold: 1.0,
};
const observer = new IntersectionObserver(observe, observerOptions);

const gallery = new SimpleLightbox('.gallery a');
const refs = getRefs();

let page = 1;
let renderedImagesAmount = 0;
let searchData = '';

// ======================================================

refs.form.addEventListener('submit', onSubmit);
refs.form.elements.searchQuery.addEventListener('focus', () => {
  refs.checkbox.disabled = false;
  refs.form.elements.submit.disabled = false;
});
refs.loadMoreBtn.addEventListener('click', loadMore);

//-------------------------------------------------------
async function onSubmit(event) {
  event.preventDefault();
  const target = event.target;
  searchData = target.elements.searchQuery.value.trim();
  if (!searchData) {
    return;
  }

  newQueryPreset();
  await showImages(searchData, page);
  refs.form.elements.submit.disabled = false;
}
//-------------------------------------------------------
function newQueryPreset() {
  refs.checkbox.disabled = true;
  refs.gallery.innerHTML = '';
  renderedImagesAmount = 0;
  page = 1;

  observer.unobserve(refs.guard);
  refs.loadMoreBtn.classList.add('is-hidden');
  refs.form.elements.submit.disabled = true;
}
//-------------------------------------------------------

async function showImages(searchData, page) {
  refs.loader.classList.remove('is-hidden');
  try {
    const { data, totalHits } = await getImages(searchData, page);
    if (!processData(data, totalHits, page)) {
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
    renderImages(data, totalHits);
    renderedImagesAmount += data.length;
    prepareLoadMoreSettings(renderedImagesAmount, totalHits);
    gallery.refresh();
  } catch (error) {
    Notify.failure(error.message);
  }
  refs.loader.classList.add('is-hidden');
}

//-------------------------------------------------------
function processData(data, totalHits, page) {
  if (data.length === 0) {
    return false;
  }
  if (page === 1) {
    Notify.info(`Hooray! We found ${totalHits} images.`);
  }
  return true;
}
//-------------------------------------------------------

function renderImages(data) {
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
}

//-------------------------------------------------------

function prepareLoadMoreSettings(renderedImagesAmount, totalHits) {
  if (renderedImagesAmount === totalHits) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    if (refs.checkbox.checked) {
      observer.unobserve(refs.guard);
    } else {
      refs.loadMoreBtn.classList.add('is-hidden');
    }
    return;
  }

  if (refs.checkbox.checked) {
    observer.observe(refs.guard);
  } else {
    refs.loadMoreBtn.classList.remove('is-hidden');
  }
}
//-------------------------------------------------------

async function loadMore() {
  page += 1;
  refs.loadMoreBtn.classList.add('is-hidden');
  await showImages(searchData, page);
  setSmoothScroll();
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

//-------------------------------------------------------

// import debounce from 'lodash.debounce';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix';
import { getImages } from './getImages';
import markup from '../templates/gallery_markup.hbs';

let page = 0;
let renderedImagesAmount = 0;
let searchData = '';
const gallery = new SimpleLightbox('.gallery a');

const formEl = document.querySelector('.search-form');
const galleryEl = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

formEl.addEventListener('submit', onSubmit);
loadMoreBtn.addEventListener('click', onClickLoadMore);

loadMoreBtn.classList.add('is-hidden');
//-------------------------------------------------------
function onSubmit(event) {
  event.preventDefault();
  loadMoreBtn.classList.add('is-hidden');
  clearSearchResults();

  const target = event.target;
  searchData = target.elements.searchQuery.value.trim();

  if (!searchData) {
    console.log('input smth!');
    return;
  }

  page = 1;

  showImages(searchData, page);
}
//-------------------------------------------------------

function showImages(searchData, page) {
  getImages(searchData, page)
    .then(({ data, totalHits }) => {
      if (data.length === 0) {
        console.log('nothting found');
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }

      if (page === 1) {
        Notify.info(`Hooray! We found ${totalHits} images.`);
      }
      data.map(img => {
        const imageProp = {
          webformatURL: img.webformatURL,
          largeImageURL: img.largeImageURL,
          tags: img.tags,
          likes: img.likes,
          views: img.views,
          comments: img.comments,
          downloads: img.downloads,
        };

        renderImages(imageProp);
        renderedImagesAmount += 1;
        if (renderedImagesAmount === totalHits) {
          console.log(
            `renderedImagesAmount=${renderedImagesAmount}, totalHits=${totalHits}`
          );
          loadMoreBtn.classList.add('is-hidden');
          Notify.info(
            "We're sorry, but you've reached the end of search results."
          );
          return;
        }
        gallery.refresh();
        if (page > 1) {
          setSmoothScroll();
        }
        loadMoreBtn.classList.remove('is-hidden');
      });
    })
    .catch(error => console.log(error.message));
}
//-------------------------------------------------------

function renderImages(imageProp) {
  galleryEl.insertAdjacentHTML('beforeend', markup(imageProp));
}
//-------------------------------------------------------

function clearSearchResults() {
  galleryEl.innerHTML = '';
  renderedImagesAmount = 0;
  page = 0;
}
//-------------------------------------------------------

function onClickLoadMore() {
  page += 1;
  showImages(searchData, page);
  // setSmoothScroll();
  console.log('page', page);
}
//-------------------------------------------------------

function setSmoothScroll() {
  const { height: cardHeight } =
    galleryEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

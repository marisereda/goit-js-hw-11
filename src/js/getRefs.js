export function getRefs() {
  formEl = document.querySelector('#search-form');
  return {
    form: formEl,
    gallery: document.querySelector('.gallery'),
    loadMoreBtn: document.querySelector('.load-more'),
    loader: document.querySelector('.loader'),
    checkbox: formEl.elements.autosearch,
    guard: document.querySelector('.guard'),
  };
}

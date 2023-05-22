import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
const { default: axios } = require('axios');

// Notify.success('Sol lucet omnibus');
// Notify.failure('Qui timide rogat docet negare');
// Notify.warning('Memento te hominem esse');
// Notify.info('Cogito ergo sum');

const API_KEY = '36560074-bb43b489ed70be2851a43808b';
const URL = 'https://pixabay.com/api/';
let page = 1;
let inputValue = '';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', imagesSearchService);
refs.loadMore.addEventListener('click', loadMoreImages);

function imagesSearchService(event) {
  event.preventDefault();
  refs.gallery.innerHTML = '';
  resetPage();
  hideLoadMoreButton();
  inputValue = refs.searchForm.firstElementChild.value.trim();
  if (inputValue === '') {
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
  } else {
    getImagesMarkup().then(totalHits => {
      if (totalHits !== 0) {
        Notify.success(`Hooray! We found ${totalHits} images.`);
      }
    });
    incrementPage();
  }
}

function loadMoreImages(event) {
  getImagesMarkup();
  incrementPage();
}

async function getImages(value, page) {
  const { data } = await axios.get(
    `${URL}?key=${API_KEY}&q=${value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=40&page=${page}`
  );
  return data;
}

async function getImagesMarkup() {
  try {
    const images = await getImages(inputValue, page);
    if (images.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      createGallery(images.hits);
      showLoadMoreButton();
      whenImagesEnd(images.totalHits);
      initializeLightbox();
    }
    return images.totalHits;
  } catch (err) {
    onError(err);
  }
}

function whenImagesEnd(totalHits) {
  if (totalHits / 40 <= page - 1) {
    hideLoadMoreButton();
    Notify.warning(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function onError(err) {
  console.error(err);
}

function createGallery(images) {
  const markup = images.reduce(
    (markup, image) =>
      markup +
      createMarkup(
        image.webformatURL,
        image.largeImageURL,
        image.tags,
        image.likes,
        image.views,
        image.comments,
        image.downloads
      ),
    ''
  );
  refs.gallery.insertAdjacentHTML('beforeend', markup);
}

function createMarkup(
  webformatURL,
  largeImageURL,
  tags,
  likes,
  views,
  comments,
  downloads
) {
  return `<div class="photo-card">
            <a class="photo-link" href="${largeImageURL}"><img class="img" src="${webformatURL}" alt="${tags}" loading="lazy"/></a>
            <div class="info">
              <p class="info-item">
                <b>Likes</b>
                ${likes}
              </p>
              <p class="info-item">
                <b>Views</b>
                ${views}
              </p>
              <p class="info-item">
                <b>Comments</b>
                ${comments}
              </p>
              <p class="info-item">
                <b>Downloads</b>
                ${downloads}
              </p>
            </div>
          </div>`;
}

function showLoadMoreButton() {
  refs.loadMore.classList.remove('hidden');
}

function hideLoadMoreButton() {
  refs.loadMore.classList.add('hidden');
}

function resetPage() {
  page = 1;
}

function incrementPage() {
  page += 1;
}
function initializeLightbox() {
  const lightbox = new SimpleLightbox('.gallery a', {
    captions: true,
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
  });
}

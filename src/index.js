import './css/styles.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';
import { key } from './partials/pass';

const gallery = document.querySelector('.gallery');
const form = document.querySelector('.search-form');
const input = document.querySelector('input');
const loader = document.querySelector('.load-more');
const switcher = document.querySelector('.switch');
const imagesPerPage = 40;

let infinityCheck = switcher.innerHTML === 'Image Loader: Infinite Scroll';
let i = 1;
let end = null;
let inputQuery = null;

form.addEventListener('submit', handleSubmit);
loader.addEventListener('click', loadMoreImages);
switcher.addEventListener('click', switchingMode);

const fetchPictures = async (name, page = 1) => {
  const table = await axios.get(
    `https://pixabay.com/api/?key=${key}&q=${name}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${imagesPerPage}`
  );
  return table;
};

var lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

function loadMoreImages() {
  i++;
  fetchPictures(inputQuery, i)
    .then(function (response) {
      // handle success
      renderImages(response);
      if (
        imagesPerPage * i >= response.data.totalHits &&
        response.data.totalHits !== 0
      ) {
        end = true;
        Notiflix.Notify.warning(
          "We're sorry, but you've reached the end of search results."
        );
      }
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

function handleSubmit(event) {
  event.preventDefault();
  inputQuery = input.value;
  i = 1;
  if (!infinityCheck) { end = false };
  gallery.innerHTML = '';
  fetchPictures(inputQuery)
    .then(function (response) {
      // handle success
      if (response.data.hits.length === 0) {
        Notiflix.Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
        return;
      }
      renderImages(response);
      Notiflix.Notify.success(
        `Hooray! We found ${response.data.totalHits} images.`
      );
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

function renderImages(response) {
  const markupList = response.data.hits
    .map(
      image => `<div class="photo-card">
   <a href="${image.largeImageURL}"><img class="album" src="${image.webformatURL}" alt="${image.tags}" loading="lazy" /></a>
  <div class="info">
    <p class="info-item">
      <b>Likes</b> ${image.likes}
    </p>
    <p class="info-item">
      <b>Views</b> ${image.views}
    </p>
    <p class="info-item">
      <b>Comments</b> ${image.comments}
    </p>
    <p class="info-item">
      <b>Downloads</b> ${image.downloads}
    </p>
  </div>
</div>`
    )
    .join('');
  gallery.insertAdjacentHTML('beforeend', markupList);
  lightbox.refresh();
  window.removeEventListener('scroll', handleInfiniteScroll);
  window.addEventListener('scroll', handleInfiniteScroll);
}

loader.classList.toggle('hidden');
function switchingMode() {
  if (switcher.innerHTML === 'Image Loader: Infinite Scroll') {
    switcher.innerHTML = 'Image Loader: Button';
    loader.classList.toggle('hidden');
    end = true;
  } else {
    switcher.innerHTML = 'Image Loader: Infinite Scroll';
    end = false;
    loader.classList.toggle('hidden');
    window.removeEventListener('scroll', handleInfiniteScroll);
    window.addEventListener('scroll', handleInfiniteScroll);
  }
}

//Infinite Scroll and Throttle
var throttleTimer;
const throttle = (callback, time) => {
  if (throttleTimer) return;

  throttleTimer = true;

  setTimeout(() => {
    callback();
    throttleTimer = false;
  }, time);
};

const handleInfiniteScroll = () => {
  throttle(() => {
    const endOfPage =
      window.innerHeight + window.pageYOffset >= document.body.offsetHeight;

    if (endOfPage) {
      loadMoreImages();
      console.log('scroll');
    }

    if (end) {
      removeInfiniteScroll();
    }
  }, 1000);
};

const removeInfiniteScroll = () => {
  window.removeEventListener('scroll', handleInfiniteScroll);
};

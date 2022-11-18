import Notiflix from 'notiflix';

function fetchCountries(name) {
  // Change the number of items in the group here
  return fetch(`https://restcountries.com/v3.1/name/${name}?fields=name,capital,flags,population,languages
`).then(response => {
    if (!response.ok) {
      if (response.status === 404) {
        Notiflix.Notify.failure('Oops, there is no country with that name');
      }
      throw new Error(response.status);
    }
    return response.json();
  });
}
export { fetchCountries };

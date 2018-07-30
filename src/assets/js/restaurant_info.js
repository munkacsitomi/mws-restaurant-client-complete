let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap();
});

/**
 * Initialize leaflet map
 */
initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.newMap = L.map('map', {
        center: [restaurant.latlng.lat, restaurant.latlng.lng],
        zoom: 16,
        scrollWheelZoom: false
      });
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
        mapboxToken: 'pk.eyJ1IjoibXVua2Fjc2l0b21pIiwiYSI6ImNqaWl2bHFzMjFuOWsza2xpd3N1MDZnMDAifQ.4zyXFPfSXwny86YwtcPyIQ',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: 'mapbox.streets'
      }).addTo(newMap);
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  fillRestaurantFavoriteHTML();

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const picture = document.getElementById('restaurant-picture');
  const source = document.createElement('source');

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant, '800', 'large');
  image.alt = restaurant.name;

  source.media = '(min-width: 900px) and (max-width: 1199px), (max-width: 599px)';
  source.srcset = DBHelper.imageUrlForRestaurant(restaurant);

  picture.insertBefore(source, image);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  fillReviewsHTML();
  buildReviewFormHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}


/**
 * Create restaurant add or remove favorite
 */
fillRestaurantFavoriteHTML = (is_favorite = self.restaurant.is_favorite, id = self.restaurant.id) => {
  const favorite = document.getElementById('restaurant-favorite');

  let btn = document.createElement('button');
  btn.setAttribute('id', 'button-favorite');
  btn.className = 'restaurant-button';

  if (is_favorite == 'true') {
    btn.innerHTML = 'Remove from Favorites';
    btn.setAttribute('onclick', `DBHelper.toggleFavorite(${id}, false);`);
    btn.classList.add('button-red');
  } else {
    btn.innerHTML = 'Add to Favorites';
    btn.setAttribute('onclick',`DBHelper.toggleFavorite(${id}, true);`);
    btn.classList.add('button-black');
  }
  favorite.appendChild(btn);
};

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h2');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    noReviews.className = 'no-reviews';
    container.appendChild(noReviews);
  } else {
    const ul = document.getElementById('reviews-list');
    reviews.forEach(review => {
      ul.appendChild(createReviewHTML(review));
    });
    container.appendChild(ul);
  }
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const div = document.createElement('div');
  div.classList.add('flex-container-space-between');
  div.classList.add('review-header');

  const name = document.createElement('p');
  name.innerHTML = review.name;
  div.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  div.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  div.appendChild(rating);

  li.appendChild(div);

  const comments = document.createElement('blockquote');
  comments.innerHTML = review.comments;
  comments.className = 'review-comment';
  li.appendChild(comments);

  return li;
}

/**
 * Build review form
 */
buildReviewFormHTML = (id = self.restaurant.id) => {
  const formContainer = document.getElementById('add-review-container');

  const heading = document.createElement('p');
  heading.innerHTML = 'Create a new review';

  const createform = document.createElement('form');
  createform.classList.add('inputs-container');
  createform.classList.add('flex-container');
  createform.setAttribute('id', 'newReviewForm');
  createform.setAttribute('onsubmit', `DBHelper.saveOfflineReview(event, this);`);

  const hiddenRestaurantId = document.createElement('input');
  hiddenRestaurantId.setAttribute('type', 'hidden');
  hiddenRestaurantId.setAttribute('name', 'id');
  hiddenRestaurantId.setAttribute('value', `${id}`);
  createform.appendChild(hiddenRestaurantId);

  const hiddenReviewDate = document.createElement('input');
  unixTime = Math.round(Date.now());
  hiddenReviewDate.setAttribute('type', 'hidden');
  hiddenReviewDate.setAttribute('name', 'ddate');
  hiddenReviewDate.setAttribute('value', `${unixTime}`);
  createform.appendChild(hiddenReviewDate);

  const hiddenFlag = document.createElement('input');
  hiddenFlag.setAttribute('type', 'hidden');
  hiddenFlag.setAttribute('name', 'dflag');
  hiddenFlag.setAttribute('value', 'unsynced');
  createform.appendChild(hiddenFlag);

  const namelabel = document.createElement('label');
  namelabel.innerHTML = 'Name: ';
  createform.appendChild(namelabel);

  const inputelement = document.createElement('input');
  inputelement.setAttribute('type', 'text');
  inputelement.setAttribute('name', 'dname');
  inputelement.setAttribute('placeholder', 'Add your name');
  inputelement.setAttribute('aria-label', 'Reviewer name');
  createform.appendChild(inputelement);

  const ratinglabel = document.createElement('label');
  ratinglabel.innerHTML = 'Rating: ';
  createform.appendChild(ratinglabel);

  const ratingelement = document.createElement('input');
  ratingelement.setAttribute('type', 'number');
  ratingelement.setAttribute('name', 'drating');
  ratingelement.setAttribute('min', '1');
  ratingelement.setAttribute('max', '5');
  ratingelement.setAttribute('placeholder', 'Enter a number between 1 to 5');
  ratingelement.setAttribute('aria-label', 'Restaurant rating');
  createform.appendChild(ratingelement);

  const ratingbreak = document.createElement('br');
  createform.appendChild(ratingbreak);

  const reviewlabel = document.createElement('label');
  reviewlabel.innerHTML = 'Review: ';
  createform.appendChild(reviewlabel);

  const texareaelement = document.createElement('textarea');
  texareaelement.setAttribute('name', 'dreview');
  texareaelement.setAttribute('rows', '5');
  texareaelement.setAttribute('cols', '10');
  texareaelement.setAttribute('placeholder', 'A your review');
  texareaelement.setAttribute('aria-label', 'Restaurant review');
  createform.appendChild(texareaelement);

  const reviewbreak = document.createElement('br');
  createform.appendChild(reviewbreak);

  const submit = document.createElement('input');
  submit.setAttribute('id', 'add-review-button');
  submit.setAttribute('type', 'submit');
  submit.setAttribute('name', 'dsubmit');
  submit.setAttribute('value', 'Submit');
  createform.appendChild(submit);

  formContainer.appendChild(heading);
  formContainer.appendChild(createform);
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

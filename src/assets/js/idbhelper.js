const restaurantsDb = 'restaurants-db';
const restaurantsTx = 'restaurants';
/**
 * Common idb helper functions.
 */
class IDBHelper {
  /**
   * Open IndexedDB Promised.
   * {@link https://github.com/jakearchibald/idb}
   */
  static get dbPromise() {
    const dbPromise = idb.open(restaurantsDb, 1);
    return dbPromise;
  }

  /**
   * Check if idb restaurants index exists
   */
  static databaseExists(dbname) {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(dbname);
      req.onsuccess = () => {
        req.result.close();
        resolve(true);
      };
      req.onupgradeneeded = event => {
        event.target.transaction.abort();
        reject(false);
      };
    });
  }

  /**
   * Delete idb restaurants index if exists
   */
  static deleteOldDatabase() {
    let DBDeleteRequest = window.indexedDB.deleteDatabase(restaurantsDb);
    DBDeleteRequest.onerror = () => {
      console.log('Error deleting database.');
    };
    DBDeleteRequest.onsuccess = () => {
      console.log('Old db successfully deleted!');
    };
  }

  /**
   * Create new IDB restaurant index
   */
  static createNewDatabase() {
    idb.open(restaurantsDb, 1, upgradeDb => {
      if (!upgradeDb.objectStoreNames.contains(restaurantsTx)) {
        upgradeDb.createObjectStore(restaurantsTx, { keypath: 'id', autoIncrement: true });
      }
      console.log('restaurants-db has been created!');
    });
  }

  /**
   * Initialize data population
   */
  static populateDatabase(dbPromise) {
    return fetch(`${DBHelper.DATABASE_URL}/restaurants`)
      .then(res => res.json())
      .then(json => {
        json.map(restaurant => IDBHelper.populateRestaurantsWithReviews(restaurant, dbPromise));
      })
      .catch(err => console.log(err));
  }

  /**
   * Populate restaurants data including reviews
   */
  static populateRestaurantsWithReviews(restaurant, dbPromise) {
    let id = restaurant.id;
    fetch(`${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`)
      .then(res => res.json())
      .then(restaurantReviews =>
        dbPromise.then(db => {
          const tx = db.transaction(restaurantsTx, 'readwrite');
          const store = tx.objectStore(restaurantsTx);
          let item = restaurant;
          item.reviews = restaurantReviews;
          store.put(item);
          tx.complete;
        })
      )
      .catch(err => console.log(err));
  }

  /**
   * Populate restaurants data without reviews (from P2 project)
   */
  static insertEachTransaction(restaurant, dbPromise) {
    dbPromise.then(db => {
      let tx = db.transaction(restaurantsTx, 'readwrite');
      let store = tx.objectStore(restaurantsTx);
      store.add(restaurant);
      return tx.complete;
    });
    console.log('item has been inserted');
    IDBHelper.populateReviews(restaurant.id, dbPromise);
  }

  /**
   * Read all data from idb restaurants index
   */
  static readAllIdbData(dbPromise) {
    return dbPromise.then(db => {
      return db
        .transaction(restaurantsTx)
        .objectStore(restaurantsTx)
        .getAll();
    });
  }

  /**
   * Toggle and update favorite in idb by id
   */
  static idbToggleFavorite(id, condition) {
    IDBHelper.dbPromise.then(async db => {
      const tx = db.transaction(restaurantsTx, 'readwrite');
      const store = tx.objectStore(restaurantsTx);
      let val = (await store.get(id)) || 0;
      val.is_favorite = String(condition);
      store.put(val, id);
      return tx.complete;
    });
  }

  /**
   * Add new review in idb restaurant review
   */
  static idbPostReview(id, body) {
    let key = parseInt(id);
    IDBHelper.dbPromise.then(async db => {
      const tx = db.transaction(restaurantsTx, 'readwrite');
      const store = tx.objectStore(restaurantsTx);
      let val = await store.get(key);
      val.reviews.push(body);
      store.put(val, key);
      return tx.complete;
    });
  }

  /**
   * Fetch unsynced data
   */
  static syncOfflineReviews() {
    IDBHelper.readAllIdbData(IDBHelper.dbPromise).then(data => {
      let unsychedReviews = [];
      data.forEach(restaurant => {
        restaurant.reviews.forEach(review => {
          if (review.flag) {
            unsychedReviews.push(review);
            delete review.flag;
          }
        });
      });
      unsychedReviews.forEach(restaurant => {
        fetch(`${DBHelper.DATABASE_URL}/reviews/`, {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(restaurant)
        }).then(res => console.log('New review synced!', res.json()));
      });
    });
  }
}

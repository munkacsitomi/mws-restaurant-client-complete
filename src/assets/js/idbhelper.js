/**
 * Common idb helper functions.
 */
class IDBHelper {
  static get dbPromise() {
    const dbPromise = idb.open('restaurants-db', 1);
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
      req.onupgradeneeded = function(event) {
        event.target.transaction.abort();
        reject(false);
      };
    });
  }
  /**
   * Delete idb restaurants index if exists
   */
  static deleteOldDatabase() {
    let DBDeleteRequest = window.indexedDB.deleteDatabase('restaurants-db');
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
    idb.open('restaurants-db', 1, upgradeDb => {
      if (!upgradeDb.objectStoreNames.contains('restaurants')) {
        upgradeDb.createObjectStore('restaurants', { keypath: 'id', autoIncrement: true });
      }
      console.log('restaurants-db has been created!');
    });
  }
  /**
   * Initialize data population
   */
  static populateDatabase(dbPromise) {
    return fetch(DBHelper.DATABASE_URL)
      .then(res => res.json())
      .then(json => {
        json.map(restaurant => IDBHelper.populateRestaurantsWithReviews(restaurant, dbPromise));
      });
  }
  /**
   * Populate restaurants data including reviews
   */
  static populateRestaurantsWithReviews(restaurant, dbPromise) {
    let id = restaurant.id;
    fetch(`http://localhost:1337/reviews/?restaurant_id=${id}`)
      .then(res => res.json())
      .then(restoReviews =>
        dbPromise.then(db => {
          const tx = db.transaction('restaurants', 'readwrite');
          const store = tx.objectStore('restaurants');
          let item = restaurant;
          item.reviews = restoReviews;
          store.put(item);
          tx.complete;
        })
      );
  }
  /**
   * Populate restaurants data without reviews (from P2 project)
   */
  static insertEachTransaction(restaurant, dbPromise) {
    dbPromise.then(db => {
      let tx = db.transaction('restaurants', 'readwrite');
      let store = tx.objectStore('restaurants');
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
        .transaction('restaurants')
        .objectStore('restaurants')
        .getAll();
    });
  }
  /**
   * toggle and update favorite in idb by id
   */
  static idbToggleFavorite(id, condition) {
    IDBHelper.dbPromise.then(async db => {
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');
      let val = (await store.get(id)) || 0;
      val.is_favorite = String(condition);
      store.put(val, id);
      return tx.complete;
    });
  }
  /**
   * add new review in idb restaurant review
   */
  static idbPostReview(id, body) {
    let key = parseInt(id);
    IDBHelper.dbPromise.then(async db => {
      const tx = db.transaction('restaurants', 'readwrite');
      const store = tx.objectStore('restaurants');
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
      data.forEach(resto => {
        resto.reviews.forEach(review => {
          if (review.flag) {
            unsychedReviews.push(review);
            delete review.flag;
          }
        });
      });
      unsychedReviews.forEach(resto => {
        const body = {
          restaurant_id: resto.restaurant_id,
          name: resto.name,
          rating: resto.rating,
          comments: resto.comments,
          updatedAt: resto.updatedAt
        };
        fetch(`http://localhost:1337/reviews/`, {
          method: 'post',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }).then(res => console.log('New review synced!', res.json()));
      });
    });
  }
}

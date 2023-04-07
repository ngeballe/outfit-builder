function properCase(word) {
  return word[0].toUpperCase() + word.slice(1);
}

function nChoose2(array) {
  const result = [];
  array.forEach((el, idx) => {
    const laterEls = array.slice(idx + 1);
    laterEls.forEach(el2 => {
      result.push([el, el2]);
    });
  });
  return result;
}

function allObjectValuesEmptyArrays(obj) {
  return Object.values(obj).flat().length === 0;
}

function cycleValueUp(value, max) {
  return (value === max) ? 0 : value + 1;
}

function cycleValueDown(value, max) {
  return (value === 0) ? max : value - 1;
}

function productOfTwoArrays(array1, array2) {
  return array1.flatMap(el1 => {
    if (Array.isArray(el1)) {
      return array2.map(el2 => {
        return [...el1, el2];
      });
    } else {
      return array2.map(el2 => [el1, el2]);
    }
  });
}

function product(array1, ...otherArrays) {
  return otherArrays.reduce((cumProduct, array) => {
    return productOfTwoArrays(cumProduct, array);
  }, array1);
}

function unique(array) {
  return array.filter((el, idx) => {
    return !array.slice(0, idx).includes(el);
  });
}

function sortBy(arrayOfObjects, criterion, descending = false) {
  const arrayCopy = arrayOfObjects.slice();

  arrayCopy.sort((a, b) => {
    let comparisonValue;
    if (a[criterion] > b[criterion]) {
      comparisonValue = 1;
    } else if (a[criterion] < b[criterion]) {
      comparisonValue = -1;
    } else {
      comparisonValue = 0;
    }
    if (descending) {
      comparisonValue *= -1;
    }
    return comparisonValue;
  });
  return arrayCopy;
}

const App = {
  ITEM_TYPES: ['shirt', 'pants', 'sweater', 'shoes'],
  COMBINATION_VETO_RATING: 0,
  SEASONS: ['spring', 'summer', 'fall', 'winter'],

  loadLocalStorageData() {
    this.items = [];

    const data = JSON.parse(localStorage.getItem('outfits'));
    if (!data) {
      return;
    }

    const { items, combinations } = data;

    if (items) {
      this.items = items;
    }

    if (combinations && !allObjectValuesEmptyArrays(combinations)) {
      this.combinations = combinations;
    } else {
      this.resetCombinations();
    }
  },

  updateCombination(type1, type2, id1, id2, rating) {
    // find combination
    const combination = this.findCombination(type1, type2, id1, id2);
    if (combination) {
      combination.rating = rating;
      this.updateLocalStorage();
    } else {
      alert('Error! Combination not found!');
    }
  },

  createCombination(id1, id2, rating) {
    return {
      id1,
      id2,
      rating,
    };
  },

  findCombinationsKeysWithType(type) {
    return Object.keys(this.combinations).filter(key => key.includes(type));
  },

  createCombinationsForNewItem(newItem) {
    // get newItem type
    const newItemType = newItem.type;
    // find this.combinations keys by newItem present in key
    const combinationsKeysWithType = this.findCombinationsKeysWithType(newItemType);
    combinationsKeysWithType.forEach(combinationsKey => {
      const existingCombinations = this.combinations[combinationsKey];
      const otherType = combinationsKey.replace(newItemType, '').replace('-', '');
      const otherTypeItems = this.itemsByType(otherType);
      newCombinations = otherTypeItems.map(item => {
        let item1, item2;
        if (combinationsKey.startsWith(newItemType)) {
          item1 = newItem;
          item2 = item;
        } else {
          item1 = item;
          item2 = newItem;
        }
        return this.createCombination(item1.id, item2.id, null);
      });
      this.combinations[combinationsKey] = [...existingCombinations, ...newCombinations];
    });
  },

  resetCombinations() {
    // be careful -- sets it
    this.combinations = {};
    const itemTypePairs = nChoose2(this.ITEM_TYPES);
    itemTypePairs.forEach(pair => {
      const key = pair.join('-');
      const value = this.findCombinations(pair[0], pair[1]);
      this.combinations[key] = value;
    });
    this.updateLocalStorage();
  },

  findCombination(type1, type2, id1, id2) {
    const combinations = this.combinations[`${type1}-${type2}`];
    return combinations.find(combo => {
      return combo.id1 === id1 && combo.id2 === id2;
    });
  },

  findCombinations(type1, type2) {
    const items1 = this.itemsByType(type1).map(item => item.id);
    const items2 = this.itemsByType(type2).map(item => item.id);
    return product(items1, items2).map(pair => {
      return {
        id1: pair[0],
        id2: pair[1],
        rating: null,
      };
    });
  },

  validCombinations() {
    const combinations = this.combinations;
    const result = {};
    Object.keys(combinations).forEach(itemTypes => {
      const combinationsSet = combinations[itemTypes];
      const valid = combinationsSet.filter(combo => {
        return combo.rating && combo.rating > this.COMBINATION_VETO_RATING;
      });
      result[itemTypes] = valid;
    });
    return result;
  },

  nextId() {
    if (this.items.length === 0) {
      return 1;
    }

    const ids = this.items.map(el => el.id);
    const maxId = Math.max(...ids);
    return maxId + 1;
  },

  updateLocalStorage() {
    localStorage.setItem('outfits', JSON.stringify({
        items: this.items,
        combinations: this.combinations,
      })
    );
  },

  itemIndex(item) {
    return this.items.indexOf(item);
  },

  findItem(type, id) {
    const items = this.itemsByType(type);
    return items.find(item => item.id === id);
  },

  itemsByType(itemType) {
    return this.items.filter(item => item.type === itemType);
  },

  itemIdsByType(itemType) {
    return this.itemsByType(itemType).map(item => item.id);
  },

  shirts() {
    return this.itemsByType('shirt');
  },

  pants() {
    return this.itemsByType('pants');
  },

  sweaters() {
    return this.itemsByType('sweater');
  },

  shoes() {
    return this.itemsByType('shoes');
  },

  findShirt(id) {
    return this.shirts().find(shirt => shirt.id === id);
  },

  findPants(id) {
    return this.pants().find(pants => pants.id === id);
  },

  findSweater(id) {
    return this.sweaters().find(sweater => sweater.id === id);
  },

  findShoes(id) {
    return this.shoes().find(shoes => shoes.id === id);
  },

  createItem(itemType, imagePath, title, spring, summer, fall, winter, dirty, damaged) {
    if (imagePath === '') {
      alert('Cannot create item without imagePath');
      throw "no imagePath";
    }

    const id = this.nextId();
    const item = Object.create(Item).init(id, itemType, imagePath, title, spring, summer, fall, winter, dirty, damaged);

    this.items.push(item);

    this.createCombinationsForNewItem(item);

    this.updateLocalStorage();
  },

  updateItem(id, type, imagePath, title, spring, summer, fall, winter, dirty, damaged) {
    // console.log(item);
    const item = this.items.find(item => item.id === id && item.type === type);

    item.imagePath = imagePath;
    item.title = title;
    item.spring = spring;
    item.summer = summer;
    item.fall = fall;
    item.winter = winter;
    item.dirty = dirty;
    item.damaged = damaged;

    this.updateLocalStorage();
  },

  deleteItem(type, id) {
    if (!id) {
      throw "Cannot delete item without id";
    }
    this.items = this.items.filter(item => {
      return !(item.type === type && item.id === id);
    });
    // delete combinations with item
    this.deleteCombinationsWithItem(type, id);
    this.updateLocalStorage();
  },

  deleteCombinationsWithItem(type, id) {
    const combinationsKeysWithType = this.findCombinationsKeysWithType(type);
    combinationsKeysWithType.forEach(key => {
      const combinations = this.combinations[key];
      // filter out combinations with key
      const combinationsFiltered = combinations.filter(combo => {
        if (key.startsWith(type)) {
          return combo.id1 !== id;
        } else {
          return combo.id2 !== id;
        }
      });
      this.combinations[key] = combinationsFiltered;
    });
  },

  totalCombinationsLength() {
    return Object.values(this.combinations).flat().length;
  },

  addMyData() {
    // temp
    this.items = [];
    myClothesData.forEach(({itemType, imagePath, title}) => {
      this.createItem(itemType, imagePath, title, true, true, true, true, false, false);
    });
  },

  init() {
    this.loadLocalStorageData();
    this.updateLocalStorage();
  },
};

App.init();

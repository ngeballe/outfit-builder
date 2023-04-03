const OutfitsPage = Object.create(Page);

Object.assign(OutfitsPage, {
  // change these in HTML or (better) on back end with Ruby variable
  initTableSettings() {
    this.tableSettings = {
      includeSweaters: document.querySelector('#include-sweaters').checked,
      includeShoes: false,
      showImages: document.querySelector('#show-images').checked,
      seasons: ['spring', 'summer', 'winter', 'fall'],
      includeDirty: document.querySelector('#include-dirty').checked,
      includeDamaged: document.querySelector('#include-damaged').checked,
    };
  },

  renderOutfits() {
    const { includeSweaters, includeShoes, showImages, seasons: seasonsSetting, includeDirty, includeDamaged } = this.tableSettings;

    const shirtIds = App.itemIdsByType('shirt');
    const pantsIds = App.itemIdsByType('pants');
    const sweaterIds = App.itemIdsByType('sweater');
    const fullProducts = product(shirtIds, pantsIds, sweaterIds);

    const validCombinations = App.validCombinations();

    let validOutfits = this.validShirtPantsOutfits(validCombinations);

    if (includeSweaters) {
      validOutfits = this.updateWithSweaters(validOutfits, validCombinations);
    }

    if (includeShoes) {
      // filter by that
      debugger;
    }

    this.hideOutfitsMessage();
    this.addRatings(validOutfits);

    validOutfits = this.updateWithFullItems(validOutfits);
    validOutfits = this.updateWithSeasons(validOutfits, seasonsSetting);
    validOutfits = this.filterBasedOnDirtyAndDamaged(validOutfits, includeDirty, includeDamaged);

    if (validOutfits.length === 0) {
      this.showOufitsMessage('No outfits found. Go set some combinations.');
      this.outfitsTable.innerHTML = '';
      return;
    }

    validOutfitsSorted = sortBy(validOutfits, 'overallRating', true);

    this.outfitsTable.innerHTML = this.templates['outfitsTable']({ outfits: validOutfitsSorted, includeShoes, includeSweaters, showImages });
  },

  hideOutfitsMessage() {
    this.outfitsMessage.classList.add('hide');
    this.outfitsMessage.textContent = '';
  },

  showOufitsMessage(text) {
    this.outfitsMessage.textContent = text;
    this.outfitsMessage.classList.remove('hide');
  },

  validShirtPantsOutfits(validCombinations) {
    return validCombinations['shirt-pants'].map((combination) => {
      const { id1: shirtId, id2: pantsId, rating: shirtPantsRating } = combination;
      return { shirtId, pantsId, shirtPantsRating };
    });
  },

  updateWithSweaters(validOutfits, validCombinations) {
    const withSweaters = [];

    const shirtSweaterCombos = validCombinations['shirt-sweater'];
    const pantsSweaterCombos = validCombinations['pants-sweater'];

    validOutfits.forEach((outfit) => {
      // shirtId is in shirtIds of shirtSweaterCombos
      // pantsId is in pantsIds of shirtSweaterCombos
      const { shirtId, pantsId } = outfit;

      const shirtSweaterCombosWithShirt = shirtSweaterCombos.filter(({id1}) => id1 === shirtId);
      const pantsSweaterCombosWithPants = pantsSweaterCombos.filter(({id1}) => id1 === pantsId);

      const sweatersWithShirt = shirtSweaterCombosWithShirt.map(({id2}) => id2);
      const sweatersWithPants = pantsSweaterCombosWithPants.map(({id2}) => id2);
      const sweatersWithBoth = sweatersWithShirt.filter(id => sweatersWithPants.includes(id));

      sweatersWithBoth.forEach(sweaterId => {
        const shirtSweaterRating = shirtSweaterCombos.find(({id1, id2}) => id1 === shirtId && id2 === sweaterId).rating;
        const pantsSweaterRating = pantsSweaterCombos.find(({id1, id2}) => id1 === pantsId && id2 === sweaterId).rating;
        const updatedOutfit = Object.assign(outfit, { sweaterId, shirtSweaterRating, pantsSweaterRating });
        withSweaters.push(updatedOutfit);
      });
    });
    return withSweaters;
  },

  addRatings(validOutfits) {
    if (validOutfits.length === 0) {
      return validOutfits;
    }
    // mutates validOutfits
    const ratingKeys = Object.keys(validOutfits[0])
                             .filter(name => name.endsWith('Rating'));
    validOutfits.forEach((outfit, idx) => {
      const ratings = [];
      ratingKeys.forEach(ratingKey => {
        ratings.push(outfit[ratingKey]);
      });
      const overallRating = ratings.reduce((cumProd, rating) => {
        return cumProd * rating;
      });
      validOutfits[idx].overallRating = overallRating;
    });
  },

  updateWithFullItems(validOutfits) {
    return validOutfits.map((outfit) => {
      const { shirtId, pantsId, sweaterId, shoesId } = outfit;
      const newValues = {
        shirt: App.findShirt(shirtId),
        pants: App.findPants(pantsId),
      };

      if (sweaterId) {
        newValues.sweater = App.findSweater(sweaterId);
      }
      if (shoesId) {
        newValues.shoes = App.findSweater(outshoesId);
      }
      return Object.assign(outfit, newValues);
    });
  },

  updateWithSeasons(validOutfits, seasonsSetting) {
    const result = [];
    const seasons = App.SEASONS;

    validOutfits.forEach(outfit => {
      const { shirt, pants, sweater } = outfit;
      // seasons for which all items are true
      const validSeasons = seasons.filter(season => {
        return shirt[season] && pants[season] && (!sweater || sweater[season]);
      });
      if (validSeasons.some(season => seasonsSetting.includes(season))) {
        const outfitWithSeasons = Object.assign(outfit, { seasons: validSeasons });
        result.push(outfitWithSeasons);
      }
    });

    return result;
  },

  filterBasedOnDirtyAndDamaged(validOutfits, includeDirty, includeDamaged) {
    return validOutfits.filter(outfit => {
      const items = this.findItems(outfit);
      const okOnDirtyFront = includeDirty || items.every(item => !item.dirty);
      const okOnDamagedFront = includeDamaged || items.every(item => !item.damaged);
      return okOnDirtyFront && okOnDamagedFront;
    });
  },

  findItems(outfit) {
    const items = [outfit.shirt, outfit.pants];
    if (outfit.sweater) {
      items.push(outfit.sweater);
    }
    return items;
  },

  bindMoreEvents() {
    this.includeSweatersCheckbox.addEventListener('change', this.handleIncludeSweatersSetting.bind(this));
    this.showImagesCheckbox.addEventListener('change', this.handleShowImagesSetting.bind(this));
    document.querySelector('#seasons').addEventListener('change', this.handleSeasonsSelect.bind(this));
    this.includeDirtyCheckbox.addEventListener('change', this.handleIncludeDirtySetting.bind(this));
    this.includeDamagedCheckbox.addEventListener('change', this.handleIncludeDamagedSetting.bind(this));
    this.outfitsTable.addEventListener('click', this.handleOutfitsTableClick.bind(this));
  },

  handleIncludeSweatersSetting(event) {
    this.tableSettings.includeSweaters = event.target.checked;
    this.renderOutfits();
  },

  handleShowImagesSetting(event) {
    this.tableSettings.showImages = event.target.checked;
    this.renderOutfits();
  },

  handleIncludeDirtySetting(event) {
    this.tableSettings.includeDirty = event.target.checked;
    this.renderOutfits();
  },

  handleIncludeDamagedSetting(event) {
    this.tableSettings.includeDamaged = event.target.checked;
    this.renderOutfits();
  },

  handleOutfitsTableClick(event) {
    if (event.target.classList.contains('view-outfit')) {
      event.preventDefault();
      const tr = event.target.closest('tr');
      const shirtId = +tr.dataset.shirtId;
      const pantsId = +tr.dataset.pantsId;
      const sweaterId = +tr.dataset.sweaterId;
      this.showOutfitModal(shirtId, pantsId, sweaterId);
    }
  },

  showOutfitModal(shirtId, pantsId, sweaterId) {
    const shirt = App.findShirt(shirtId);
    const pants = App.findPants(pantsId);
    const sweater = App.findSweater(sweaterId);

    this.modal.innerHTML = this.templates['outfit-modal-template']({shirt, pants, sweater});

    this.modalBackground.classList.remove('hide');
  },

  handleSeasonsSelect(event) {
    const value = event.target.value;
    if (value === 'all') {
      this.tableSettings.seasons = App.SEASONS.map(s => s.toLowerCase());
    } else {
      this.tableSettings.seasons = [value];
    }

    this.renderOutfits();
  },

  init() {
    Page.init();

    this.initTableSettings();

    this.outfitsMessage = document.querySelector('.outfits-message');
    this.outfitsTable = document.querySelector('#outfits');
    this.includeSweatersCheckbox = document.querySelector('#include-sweaters');
    this.showImagesCheckbox = document.querySelector('#show-images');
    this.includeDirtyCheckbox = document.querySelector('#include-dirty');
    this.includeDamagedCheckbox = document.querySelector('#include-damaged');
  },
});

document.addEventListener('DOMContentLoaded', () => {
  OutfitsPage.init();

  OutfitsPage.bindEvents = function() {
    Page.bindEvents();
  };

  OutfitsPage.run = function() {
    this.renderOutfits();
    this.bindMoreEvents();
  };

  OutfitsPage.run();
});

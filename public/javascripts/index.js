const IndexPage = Object.create(Page);
Object.assign(IndexPage, {
  handleItemLinkClick(event) {
    const link = event.target.closest('.item-link');
    if (link) {
      event.preventDefault();
      const id = +link.dataset.id;
      const type = link.dataset.type;
      this.showItemModal(type, id);
    }
  },

  bindEvents(events) {
    this.addShirt.addEventListener('click', this.showNewItemModal.bind(this, 'shirt'));
    this.addPants.addEventListener('click', this.showNewItemModal.bind(this, 'pants'));
    this.addSweater.addEventListener('click', this.showNewItemModal.bind(this, 'sweater'));
    this.addShoes.addEventListener('click', this.showNewItemModal.bind(this, 'shoes'));

    document.querySelector('.items').addEventListener('click', this.handleItemLinkClick.bind(this));

    // modal delete event
    this.modal.addEventListener('click', this.handleModalClick.bind(this));
    document.addEventListener('keyup', this.handleModalKeyup.bind(this));

    this.pageNav.addEventListener('click', this.handlePageNavClick.bind(this));
  },

  handlePageNavClick(event) {
    const link = event.target.closest('a');

    const pageNavLinks = this.pageNav.querySelectorAll('a');
    pageNavLinks.forEach(link => link.classList.remove('active'));
    link.classList.add('active');
  },

  handleModalClick(event) {
    const target = event.target;
    const deleteButton = event.target.closest('.btn-delete');
    if (deleteButton) {
      const itemId = +deleteButton.dataset.id;
      const itemType = deleteButton.dataset.itemType;
      this.handleDeleteButton(itemType, itemId);
    }
    const editButton = event.target.closest('.btn-edit');
    if (editButton) {
      event.preventDefault();
      const itemId = +editButton.dataset.id;
      const itemType = editButton.dataset.itemType;
      this.showEditItemModal(itemType, itemId);
    }

    const currentArrowButton = event.target.closest('.btn-arrow');

    if (currentArrowButton) {
      this.handleArrowButton(currentArrowButton);
    }
  },

  handleModalKeyup(event) {
    const modalOpen = !document.querySelector('.modal-background').classList.contains('hide');
    if (!modalOpen) {
      return;
    }

    event.preventDefault();
    const key = event.key;
    const clickEvent = new MouseEvent('click', { bubbles: true });

    if (key === 'ArrowRight') {
      const rightArrowButton = document.querySelector('.modal .btn-arrow-right');
      rightArrowButton.dispatchEvent(clickEvent);
    } else if (key === 'ArrowLeft') {
      const leftArrowButton = document.querySelector('.modal .btn-arrow-left');
      leftArrowButton.dispatchEvent(clickEvent);
    }
  },

  handleArrowButton(currentArrowButton) {
    const modalBody = currentArrowButton.closest('.modal-body');
    const currentId = modalBody.dataset.itemId;
    const currentType = modalBody.dataset.itemType;

    const itemLinksOnPage = Array.from(document.querySelectorAll('.item-link'));
    const maxItemIndex = itemLinksOnPage.length - 1;
    const currentIndex = itemLinksOnPage.findIndex(link => {
      return link.dataset.id === currentId && link.dataset.type === currentType;
    });

    if (currentIndex === undefined) {
      alert("Index not found. Something is wrong.");
      return;
    }

    if (currentArrowButton.classList.contains('btn-arrow-right')) {
      const nextItemIndex = cycleValueUp(currentIndex, maxItemIndex);
      const nextItemLink = itemLinksOnPage[nextItemIndex];
      const { type, id } = nextItemLink.dataset;
      this.showItemModal(type, +id);
    } else if (currentArrowButton.classList.contains('btn-arrow-left')) {
      const prevItemIndex = cycleValueDown(currentIndex, maxItemIndex);
      const prevItemLink = itemLinksOnPage[prevItemIndex];
      const { type, id } = prevItemLink.dataset;
      const prevItem = itemLinksOnPage[prevItemIndex];
      this.showItemModal(type, +id);
    }
  },

  hideModal() {
    // newItem modal
    const form = this.modal.querySelector('form');
    if (form) {
      form.reset();
    }

    this.modalBackground.classList.add('hide');
  },

  handleDeleteButton(itemType, itemId) {
    const ok = confirm("Are you sure you want to delete the item? Cannot undo.");
    if (ok) {
      App.deleteItem(itemType, itemId);
      this.renderItems();
      this.hideModal();
    }
  },

  showEditItemModal(type, id) {
    const item = App.findItem(type, id);
    this.modal.innerHTML = this.templates['edit-item-template']({item: item, seasons: App.SEASONS });

    this.modal.querySelector('form#edit-item').addEventListener('submit', this.handleEditItemFormSubmit.bind(this));

    this.modalBackground.classList.remove('hide');
  },

  showItemModal(type, id) {
    const item0 = App.findItem(type, id);

    const xhr = new XMLHttpRequest();
    xhr.open('GET', '/items/6');
    xhr.responseType = 'json';
    xhr.addEventListener('loadend', (e) => {
      // console.log(event);
      // console.log('load?');
      // console.log(xhr.responseText);
      const item = xhr.response;
      console.log(xhr.response);
      console.log(item0);
      console.log(item);

    });
    this.modal.innerHTML = this.templates['show-item-template'](item);
    this.modalBackground.classList.remove('hide');

    const categoryTitle = properCase(category);
  },

  handleNewItemFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const itemType = form.type.value;
    const imagePath = form['image-path'].value;

    if (imagePath === '') {
      alert('Your item must have an image (link or file path)');
      throw 'error';
    }

    const title = form.title.value;
    const spring = form.spring.checked;
    const summer = form.summer.checked;
    const fall = form.fall.checked;
    const winter = form.winter.checked;
    const dirty = form.dirty.checked;
    const damaged = form.damaged.checked;

    App.createItem(itemType, imagePath, title, spring, summer, fall, winter, dirty, damaged);

    this.hideModal();
    this.renderItems();
  },

  handleEditItemFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const itemType = form.type.value;
    const itemId = +form.id.value;
    const imagePath = form['image-path'].value;

    if (imagePath === '') {
      alert('Your item must have an image (link or file path)');
    }

    const title = form.title.value;
    const spring = form.spring.checked;
    const summer = form.summer.checked;
    const fall = form.fall.checked;
    const winter = form.winter.checked;
    const dirty = form.dirty.checked;
    const damaged = form.damaged.checked;

    const item = App.findItem(itemType, itemId);

    if (!item) {
      alert('Error! Item not found');
      throw 'error';
    }

    App.updateItem(itemId, itemType, imagePath, title, spring, summer, fall, winter, dirty, damaged);

    this.hideModal(); // or back to show??
    this.renderItems();
  },

  renderItems() {
    // this.shirtsEl.innerHTML = this.templates['item-list-template']({ heading: 'Shirts', items: App.shirts(), type: 'shirt' });
    // this.pantsEl.innerHTML = this.templates['item-list-template']({ heading: 'Pants', items: App.pants(), type: 'pants' });
    this.sweatersEl.innerHTML = this.templates['item-list-template']({ heading: 'Sweaters', items: App.sweaters(), type: 'sweater' });
    this.shoesEl.innerHTML = this.templates['item-list-template']({ heading: 'Shoes', items: App.shoes(), type: 'shoes' });
  },

  showNewItemModal(category) {
    event.preventDefault();
    // new item modal
    this.modal.innerHTML = this.templates['new-item-template']({itemType: category, seasons: App.SEASONS });

    this.modal.querySelector('form#new-item').addEventListener('submit', this.handleNewItemFormSubmit.bind(this));

    this.modalBackground.classList.remove('hide');
    // add category to form as data-id
    const form = this.modal.querySelector('form');
    form.dataset.itemTypeId = category;
    // change to be hidden input like edit for consistency?
    form['image-path'].focus();
  },

  run() {
    this.renderItems();

    App.items = App.items.filter(item => item.id !== null);
    App.updateLocalStorage();
  },

  init() {
    Page.init();

    this.shirtsEl = document.querySelector('.shirts');
    this.pantsEl = document.querySelector('.pants');
    this.sweatersEl = document.querySelector('.sweaters');
    this.shoesEl = document.querySelector('.shoes');
    this.addShirt = document.querySelector('#add-shirt');
    this.addPants = document.querySelector('#add-pants');
    this.addSweater = document.querySelector('#add-sweater');
    this.addShoes = document.querySelector('#add-shoes');

    this.pageHeaderContent.innerHTML = this.templates['page-nav-template']();
    this.pageNav = document.querySelector('.page-nav');

    this.bindEvents();

    return this;
  },
});

document.addEventListener('DOMContentLoaded', () => {
  IndexPage.init().run();
});

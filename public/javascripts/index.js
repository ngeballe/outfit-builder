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
    console.log('3');
    debugger;
    Page.bindEvents();

    this.addShirt.addEventListener('click', this.showNewItemModal.bind(this, 'shirt'));
    this.addPants.addEventListener('click', this.showNewItemModal.bind(this, 'pants'));
    this.addSweater.addEventListener('click', this.showNewItemModal.bind(this, 'sweater'));
    this.addShoes.addEventListener('click', this.showNewItemModal.bind(this, 'shoes'));

    document.querySelector('.items').addEventListener('click', this.handleItemLinkClick.bind(this));

    // modal delete event
    this.modal.addEventListener('click', this.handleModalClick.bind(this));

    debugger;
    document.querySelector('.page-nav').style.display = 'none';
    document.querySelector('.page-nav').addEventListener('click', this.handlePageNavClick.bind(this));
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
    const item = App.findItem(type, id);

    // const categoryTitle = properCase(category);
    this.modal.innerHTML = this.templates['show-item-template'](item);

    this.modalBackground.classList.remove('hide');
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
    this.shirtsEl.innerHTML = this.templates['item-list-template']({ heading: 'Shirts', items: App.shirts(), type: 'shirt' });
    this.pantsEl.innerHTML = this.templates['item-list-template']({ heading: 'Pants', items: App.pants(), type: 'pants' });
    this.sweatersEl.innerHTML = this.templates['item-list-template']({ heading: 'Sweaters', items: App.sweaters(), type: 'sweater' });
    this.shoesEl.innerHTML = this.templates['item-list-template']({ heading: 'Shoes', items: App.shoes(), type: 'shoes' });
  },

  showNewItemModal(category) {
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

    this.bindEvents();

    this.shirtsEl = document.querySelector('.shirts');
    this.pantsEl = document.querySelector('.pants');
    this.sweatersEl = document.querySelector('.sweaters');
    this.shoesEl = document.querySelector('.shoes');
    this.addShirt = document.querySelector('#add-shirt');
    this.addPants = document.querySelector('#add-pants');
    this.addSweater = document.querySelector('#add-sweater');
    this.addShoes = document.querySelector('#add-shoes');

    return this;
  },
});

document.addEventListener('DOMContentLoaded', () => {
  IndexPage.init().run();
});

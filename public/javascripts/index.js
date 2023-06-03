const IndexPage = Object.create(Page);
Object.assign(IndexPage, {
  handleItemLinkClick(event) {
    const link = event.target.closest('.item-link');
    if (link) {
      event.preventDefault();
      const id = +link.dataset.id;
      this.showItemModal(id);
    }
  },

  bindEvents(events) {
    this.addShirt.addEventListener('click', this.showNewItemModal.bind(this, 'shirt'));
    this.addPants.addEventListener('click', this.showNewItemModal.bind(this, 'pants'));
    this.addSweater.addEventListener('click', this.showNewItemModal.bind(this, 'sweater'));

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
      // const itemId = +deleteButton.dataset.id;
      this.handleDeleteButton(event);
      return;
    }

    const editButton = event.target.closest('.btn-edit');
    if (editButton) {
      event.preventDefault();
      const itemId = +editButton.dataset.id;
      this.showEditItemModal(itemId);
      return;
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

    const itemLinksOnPage = Array.from(document.querySelectorAll('.item-link'));
    const maxItemIndex = itemLinksOnPage.length - 1;
    const currentIndex = itemLinksOnPage.findIndex(link => {
      return link.dataset.id === currentId;
    });

    if (currentIndex === undefined) {
      alert("Index not found. Something is wrong.");
      return;
    }

    if (currentArrowButton.classList.contains('btn-arrow-right')) {
      const nextItemIndex = cycleValueUp(currentIndex, maxItemIndex);
      const nextItemLink = itemLinksOnPage[nextItemIndex];
      const id = nextItemLink.dataset.id;
      this.showItemModal(+id);
    } else if (currentArrowButton.classList.contains('btn-arrow-left')) {
      const prevItemIndex = cycleValueDown(currentIndex, maxItemIndex);
      const prevItemLink = itemLinksOnPage[prevItemIndex];
      const id = prevItemLink.dataset.id;
      const prevItem = itemLinksOnPage[prevItemIndex];
      this.showItemModal(+id);
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

  async handleDeleteButton(event) {
    const ok = confirm("Are you sure you want to delete the item? Cannot undo.");
    if (ok) {
      const form = event.target.closest('.btn-delete').querySelector('form');
      // xhr.open('POST', `/items/${id}/delete`);
      form.submit();
      // const deleteConfirmationMsg = await App.deleteItem(itemId);
      // this.renderItems();
      // console.log(deleteConfirmationMsg);
      // this.hideModal();
    }
  },

  async showEditItemModal(id) {
    const item = await App.fetchItem(id);
    console.log(item);
    console.log(App.SEASONS);
    this.modal.innerHTML = this.templates['edit-item-template']({item: item, seasons: App.SEASONS });

    this.modal.querySelector('form#edit-item').addEventListener('submit', this.handleEditItemFormSubmit.bind(this));

    this.modalBackground.classList.remove('hide');
  },

  async showItemModal(id) {
    // const xhr = new XMLHttpRequest();
    // xhr.open('GET', `/items/${id}`);
    // xhr.responseType = 'json';
    // xhr.addEventListener('load', event => {
    //   const item = xhr.response;
    //   this.modal.innerHTML = this.templates['show-item-template'](item);
    //   this.modalBackground.classList.remove('hide');
    // });
    // xhr.send();

    const item = await App.fetchItem(id);
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

    form.submit();
  },

  handleEditItemFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const itemId = +form.id.value;
    const imagePath = form['image-path'].value;

    if (imagePath === '') {
      alert('Your item must have an image (link or file path)');
      form.reset();
    }

    const data = new FormData(form);
    const xhr = new XMLHttpRequest();

    xhr.open(form.method, form.action);
    xhr.responseType = 'json';
    xhr.addEventListener('load', event => {
      const item = xhr.response;
      this.hideModal(); // or back to show??
      const currentItemLink = document.querySelector(`.item-link[data-id="${itemId}"]`);
      currentItemLink.outerHTML = this.templates['itemTemplate'](item);
      });

    xhr.send(data);
  },

  renderItems() {
    // this.shirtsEl.innerHTML = this.templates['item-list-template']({ heading: 'Shirts', items: App.shirts(), type: 'shirt' });
    // this.pantsEl.innerHTML = this.templates['item-list-template']({ heading: 'Pants', items: App.pants(), type: 'pants' });
    // this.sweatersEl.innerHTML = this.templates['item-list-template']({ heading: 'Sweaters', items: App.sweaters(), type: 'sweater' });
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

  init() {
    Page.init();

    this.shirtsEl = document.querySelector('.shirts');
    this.pantsEl = document.querySelector('.pants');
    this.sweatersEl = document.querySelector('.sweaters');
    this.addShirt = document.querySelector('#add-shirt');
    this.addPants = document.querySelector('#add-pants');
    this.addSweater = document.querySelector('#add-sweater');

    this.pageHeaderContent.innerHTML = this.templates['page-nav-template']();
    this.pageNav = document.querySelector('.page-nav');

    this.bindEvents();

    return this;
  },
});

document.addEventListener('DOMContentLoaded', () => {
  IndexPage.init();
});

const Page = {
  templates: {},

  cacheTemplates() {
    document.querySelectorAll('[type="text/x-handlebars-template"]').forEach(tmpl => {
      this.templates[tmpl.id] = Handlebars.compile(tmpl.innerHTML);
      if (tmpl.classList.contains('partial')) {
        Handlebars.registerPartial(tmpl.id, tmpl.innerHTML);
      }
    });
    Handlebars.registerHelper('sum', function(a, b) {
      return a + b;
    });
    Handlebars.registerHelper('eq', function(a, b) {
      return a === b;
    });
    Handlebars.registerHelper('and', function(a, b) {
      return a && b;
    });
    Handlebars.registerHelper('selectedIfEqual', function(x, y) {
      if (x === y) {
        return 'selected';
      } else {
        return '';
      }
    });
    Handlebars.registerHelper('titleCase', function(str) {
      return str[0].toUpperCase() + str.slice(1);
    });
    Handlebars.registerHelper('checkedOrNot', function(boolean) {
      return boolean ? 'checked' : '';
    });
    Handlebars.registerHelper('commaJoin', function(array) {
      return array.join(', ');
    });
    Handlebars.registerHelper('join', function(array, delimiter) {
      return array.join(delimiter);
    });
  },

  handleKeyup(event) {
    if (event.key === 'Escape') {
      this.hideModal();
    }
  },

  handleModalClick(event) {
    const target = event.target;
    if (target.closest('.btn-close')) {
      event.preventDefault();
      this.hideModal();
    }
    if (target.closest('.btn-zoom')) {
      event.preventDefault();
      this.handleModalImagesZoom(target.closest('.btn-zoom'));
    }
  },

  handleModalImagesZoom(target) {
    const MAX_ZOOM = 3;
    const MIN_ZOOM = 1;

    const imgs = this.modal.querySelectorAll('img');
    const zoomLevel = +imgs[0].dataset.zoom;

    if (target.classList.contains('btn-zoom-in') && zoomLevel < MAX_ZOOM) {
      imgs.forEach(img => img.dataset.zoom = zoomLevel + 1);
    } else if (target.classList.contains('btn-zoom-out') && zoomLevel > MIN_ZOOM) {
      imgs.forEach(img => img.dataset.zoom = zoomLevel - 1);
    }

    const newZoomLevel = +imgs[0].dataset.zoom;

    const btnZoomIn = this.modal.querySelector('.btn-zoom-in');
    const btnZoomOut = this.modal.querySelector('.btn-zoom-out');

    btnZoomIn.disabled = (newZoomLevel === MAX_ZOOM);
    btnZoomOut.disabled = (newZoomLevel === MIN_ZOOM);
  },

  hideModal() {
    this.modalBackground.classList.add('hide');
  },

  bindEvents() {
    this.bindModalEvents();
    this.bindKeyEvents();
  },

  bindModalEvents() {
    this.modalBackground.addEventListener('click', event => {
      const target = event.target;
      if (!target.closest('.modal') && !target.closest('.modal-footer') && !target.closest('.modal-body') && !target.closest('.modal-header')) {
        this.hideModal();
      }
    });

    this.modal.addEventListener('click', this.handleModalClick.bind(this));
  },

  bindKeyEvents() {
    document.addEventListener('keyup', this.handleKeyup.bind(this));
  },

  init() {
    this.modalBackground = document.querySelector('.modal-background');
    this.modal = document.querySelector('.modal');

    this.cacheTemplates();
    this.bindEvents();

    this.pageHeaderContent = document.querySelector('.page-header-content');

    return this;
  },
};
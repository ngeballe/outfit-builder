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
    Handlebars.registerHelper('dirtyDamagedStatus', function(shirt, pants, sweater) {
      const items = [shirt, pants];
      if (sweater) {
        items.push(sweater);
      }
      const reports = items.reduce((reportsSoFar, item) => {
        const type = item.type;
        let problems = [];
        if (item.dirty) {
          problems.push('dirty');
        }
        if (item.damaged) {
          const verb = type === 'pants' ? 'need' : 'needs';
          problems.push(`${verb} mending`);
        }
        if (problems.length > 0) {
          reportsSoFar.push(`${type} ${problems.join(' and ')}`);
        }
        return reportsSoFar;
      }, []);
      return reports.join(', ');
    });
    Handlebars.registerHelper('allSeasonsTag', function(tag) {
      return tag === 'All Seasons';
    });
    Handlebars.registerHelper('flawTags', function(item) {
      return ['dirty', 'damaged'].filter(prop => item[prop]);
    });
    Handlebars.registerHelper('findIconClass', function(tagName) {
      const lookupTable = {
        spring: 'fa-duotone fa-flower-tulip',
        summer: 'fa-duotone fa-sun',
        fall: 'fa-sharp fa-solid fa-leaf-maple',
        winter: 'fa-sharp fa-regular fa-snowflake',
        dirty: 'fa-regular fa-washing-machine',
        damaged: 'fa-solid fa-shirt-running',
      };
      return lookupTable[tagName];
    });
    Handlebars.registerHelper('tags', function(item) {
      let tags = [];

      let seasonTags = [];
      const seasons = App.SEASONS.filter(season => item[season]);
      if (seasons.length === 4) {
        seasonTags.push('All Seasons');
      } else {
        seasonTags.push(...seasons);
      }

      const dirtyDamagedTags = ['dirty', 'damaged'].filter(prop => item[prop]);

      tags = { seasonTags, dirtyDamagedTags };
      // if (item.di)
      return tags;
      // return item.unusualFeatures();
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
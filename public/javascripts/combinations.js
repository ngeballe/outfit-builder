const CombinationsPage = Object.create(Page);
Object.assign(CombinationsPage, {
  renderCombinations() {
    const columnType = this.type1;
    const rowType = this.type2;

    const columnItems = App.itemsByType(columnType);
    const rowItems = App.itemsByType(rowType);
    const combinations = App.combinations[`${columnType}-${rowType}`];

    const combinationsMatrix = rowItems.map(rowItem => {
      const rowItemId = rowItem.id;

      const combinationsForRow = columnItems.map(columnItem => {
        const combo = App.findCombination(columnType, rowType, columnItem.id, rowItemId);
        if (!combo) {
          debugger;
        }
        let { id1: columnId, id2: rowId, rating } = combo;
        return { columnId, rowId, rating };
      });
      const rowData = {
        rowItem,
        combinationsForRow,
      };
      return rowData;
    });

    this.tableContainer.innerHTML = this.templates['combinations-table-template']({columnItems, rowItems, columnType, rowType, combinationsMatrix });
  },

  bindSelectEvents() {
    document.querySelectorAll('#combinations-table select').forEach(selectEl => {
      selectEl.addEventListener('change', event => {
        const value = selectEl.value;
        const rating = value === '' ? null : +value;
        const cell = selectEl.closest('td');
        const table = cell.closest('table');
        const columnId = +cell.dataset.columnId;
        const rowId = +cell.dataset.rowId;
        const columnType = table.dataset.columnType;
        const rowType = table.dataset.rowType;
        App.updateCombination(columnType, rowType, columnId, rowId, rating);
        cell.dataset.rating = rating;
      });
    });
  },

  bindMoreEvents() {
    this.bindSelectEvents();
    document.querySelector('#combinations-table').addEventListener('click', event => {
      if (event.target.closest('.view-combination')) {
        event.preventDefault();
        const td = event.target.closest('td');
        const columnId = +td.dataset.columnId;
        const rowId = +td.dataset.rowId;
        const table = td.closest('table');
        const columnType = table.dataset.columnType;
        const rowType = table.dataset.rowType;
        this.showCombinationModal(columnId, rowId, columnType, rowType, td);
      }
    });

    document.addEventListener('keydown', this.handleKeydown.bind(this));

    this.typesSelectEl.addEventListener('change', this.updateTable.bind(this));
  },

  updateTable(event) {
    const value = event.target.value;
    const [ type1, type2 ] = value.split('-');
    this.updateParams(type1, type2);

    // load page with new types
    this.renderCombinations();
  },

  updateParams(type1, type2) {
    window.location.search = `?type1=${type1}&type2=${type2}`;
  },

  showCombinationModal(columnId, rowId, columnType, rowType, td) {
    const columnItem = App.findItem(columnType, columnId);
    const rowItem = App.findItem(rowType, rowId);
    const combo = App.findCombination(columnType, rowType, columnId, rowId);
    const rating = combo.rating;

    this.modal.innerHTML = this.templates['combination-modal-template']({item1: columnItem, item2: rowItem, rating});

    this.modalBackground.classList.remove('hide');

    this.modal.querySelector('select').addEventListener('change', this.handleModalRatingSelect.bind(this, columnId, rowId, columnType, rowType, td));

    this.modal.querySelectorAll('.btn-scroll').forEach(btnScroll => {
      btnScroll.addEventListener('click', this.handleModalScroll.bind(this, columnId, rowId, columnType, rowType, td));
    });
  },

  handleKeydown(event) {
    const TINDER_STYLE = true;
    const modalOpen = !this.modalBackground.classList.contains('hide');
    const key = event.key;
    if (modalOpen && TINDER_STYLE) {
      event.preventDefault();
      this.handleKeydownInModalTinder(key);
    } else if (modalOpen) {
      event.preventDefault();
      this.handleKeydownInModalOLD(key);
    }
  },

  handleKeydownInModalOLD(key) {
    const valueGood = '5';
    const valueOkay = '3';
    const valueBad = '0';
    const selectEl = this.modal.querySelector('select');

    if (key === 'ArrowDown') {
      document.querySelector('#btn-scroll-down').click();
    } else if (key === 'ArrowUp') {
      document.querySelector('#btn-scroll-up').click();
    } else if (key === 'ArrowLeft') {
      document.querySelector('#btn-scroll-left').click();
    } else if (key === 'ArrowRight') {
      document.querySelector('#btn-scroll-right').click();
    } else if (key === '1') {
      selectEl.value = valueGood;
      selectEl.dispatchEvent(new Event('change'));
    } else if (key === '3') {
      selectEl.value = valueBad;
      selectEl.dispatchEvent(new Event('change'));
    } else if (key === '2') {
      selectEl.value = valueOkay;
      selectEl.dispatchEvent(new Event('change'));
    }
  },

  handleKeydownInModalTinder(key) {
    const valueGood = '5';
    const valueOkay = '3';
    const valueBad = '0';
    const selectEl = this.modal.querySelector('select');
    const SHOW_UNRATED_COMBOS_ONLY = true;

    if (key === 'ArrowRight') {
      this.changeSelect(selectEl, valueGood);
      this.showNextCombination(SHOW_UNRATED_COMBOS_ONLY);
    } else if (key === 'ArrowLeft') {
      this.changeSelect(selectEl, valueBad);
      this.showNextCombination(SHOW_UNRATED_COMBOS_ONLY);
    } else if (key === 'o' || key === '/') { // 'o' as in okay
      this.changeSelect(selectEl, valueOkay);
      this.showNextCombination(SHOW_UNRATED_COMBOS_ONLY);
    } else if (key === 's' || key === ' ') { // 's' as in skip
      this.showNextCombination(SHOW_UNRATED_COMBOS_ONLY);
    }
  },

  showNextCombination(unratedOnly = true) {
    const table = this.tableContainer.querySelector('table');
    // const typeString = table.dataset.columnType + '-' + table.dataset.rowType;
    // get all combinations
    // let combinations = App.combinations[typeString];
    // if unratedOnly, filter by unrated

    // get this row & column id -- to ensure next isn't this if skipping
    const modalBodyEl = this.modal.querySelector('.modal-body');
    const currentRowId = +modalBodyEl.dataset.rowId;
    const currentColumnId = +modalBodyEl.dataset.columnId;

    const otherTds = Array.from(document.querySelectorAll(`td:not([data-row-id="${currentRowId}"][data-column-id="${currentColumnId}"]`));

    let nextTd;
    if (unratedOnly) {
      nextTd = otherTds.find(td => td.dataset.rating === '');
    } else {
      nextTd = otherTds[0];
    }

    // if no unrated, say "All rated" (or "no combinations"), go back to main page
    if (!nextTd) {
      const msg = unratedOnly ? 'No unrated combinations.' : 'No other combinations.';
      alert(msg);
      this.hideModal();
      return;
    }

    const columnId = +nextTd.dataset.columnId;
    const rowId = +nextTd.dataset.rowId;
    const columnType = document.querySelector('table').dataset.columnType;
    const rowType = document.querySelector('table').dataset.rowType;

    setTimeout(() => {
      this.showCombinationModal(columnId, rowId, columnType, rowType, nextTd);
    }, 500);
  },

  changeSelect(selectEl, value) {
    selectEl.value = value;
    selectEl.dispatchEvent(new Event('change'));
  },

  handleModalScroll(columnId, rowId, columnType, rowType, td) {
    const btnId = event.currentTarget.id;

    let rowIndex = +td.closest('tr').dataset.rowIndex;
    let columnIndex = +td.dataset.columnIndex;

    const lastRowIndex = document.querySelectorAll('tbody tr').length - 1;
    const lastColumnIndex = document.querySelectorAll('tbody tr:first-child td').length - 1;

    if (btnId === 'btn-scroll-down') {
      rowIndex = cycleValueUp(rowIndex, lastRowIndex);
    } else if (btnId === 'btn-scroll-up') {
      rowIndex = cycleValueDown(rowIndex, lastRowIndex);
    } else if (btnId === 'btn-scroll-right') {
      columnIndex = cycleValueUp(columnIndex, lastColumnIndex);
    } else if (btnId === 'btn-scroll-left') {
      columnIndex = cycleValueDown(columnIndex, lastColumnIndex);
    }

    // update cell
    td = document.querySelector(`#combinations-table tr[data-row-index="${rowIndex}"] td[data-column-index="${columnIndex}"]`);
    rowId = +td.dataset.rowId;
    columnId = +td.dataset.columnId;
    console.log({ columnId, rowId, columnType, rowType, td });

    this.showCombinationModal(columnId, rowId, columnType, rowType, td);
  },

  hideModal() {
    this.modalBackground.classList.add('hide');
  },

  setTypes() {
    const href = window.location.href;
    if (href.endsWith('combinations.html')) {
      this.type1 = 'shirt';
      this.type2 = 'pants';
    } else {
      const search = window.location.search;
      const regex = /type1=(.+)&type2=(.+)/;
      this.type1 = search.match(regex)[1];
      this.type2 = search.match(regex)[2];
    }
    this.updateTypesSelect();
  },

  updateTypesSelect() {
    this.typesSelectEl.value = `${this.type1}-${this.type2}`;
  },

  handleModalRatingSelect(columnId, rowId, columnType, rowType, td) {
    const value = event.target.value;
    const rating = value === '' ? null : +value;
    App.updateCombination(columnType, rowType, columnId, rowId, rating);
    td.dataset.rating = rating;
    td.querySelector('select').innerHTML = this.templates.ratingSelectMenu({ rating: rating });
  },

  run() {
    this.setTypes();
    this.renderCombinations();
    this.bindMoreEvents();
  },

  init() {
    Page.init();

    this.tableContainer = document.querySelector('#table-container');
    this.pageHeaderContent.innerHTML = this.templates['type-selector']();

    this.typesSelectEl = document.querySelector('#types');

    return this;
  }
});

document.addEventListener('DOMContentLoaded', () => {
  CombinationsPage.init().run();
});

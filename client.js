//
import dataService from './dataService.js';
import {
  debounce
} from './debounce.js';

import {
  addSingaleVideoReq
} from './addSingaleVideoReq.js';

import {
  checkValidity
} from './checkValidity.js';


// const listOfVideoEle = document.getElementById('listOfRequests');
const SUPER_USER_ID = '19980201';

export const state = {
  sortBy: 'newFirst',
  searchTerm: '',
  filterBy: 'all',
  userId: '',
  isSuperUser: false
}

document.addEventListener('DOMContentLoaded', function () {
  const formVidReqEle = document.getElementById('formVideoRequest');
  const sortByElmes = document.querySelectorAll('[id*=sort_by_]');
  const filterByElmes = document.querySelectorAll('[id*=filter_by_]');
  const searchEle = document.getElementById('search_box');

  const formLoginEle = document.querySelector('.form-login');
  const appContentEle = document.querySelector('.app-content');

  if (window.location.search) {

    state.userId = new URLSearchParams(window.location.search).get('id');

    if (state.userId === SUPER_USER_ID) {
      state.isSuperUser = true;
      document.querySelector('.normal-user-content').classList.add('d-none');
    }
    formLoginEle.classList.add('d-none');
    appContentEle.classList.remove('d-none');

  }


  // function to display all Video Topic
  dataService.loadAllVidReqs(state);

  // tow button to sort by new or by Top voted
  sortByElmes.forEach((elm) => {
    elm.addEventListener('click', function (e) {
      e.preventDefault();

      state.sortBy = this.querySelector('input').value;
      dataService.loadAllVidReqs(state);

      if (state.sortBy === 'topVotedFirst') {
        document.getElementById('sort_by_new').classList.remove('active');
      } else {
        document.getElementById('sort_by_top').classList.remove('active');
      }

      this.classList.add('active');

    });
  });

  // Filter 
  filterByElmes.forEach(element => {
    element.addEventListener('click', function (e) {
      e.preventDefault();
      state.filterBy = this.querySelector('input').value;
      filterByElmes.forEach(ele => ele.classList.remove('active'));
      dataService.loadAllVidReqs(state);
      this.classList.add('active');
    })
  });
  // Search 
  searchEle.addEventListener('input', debounce((e) => {

    state.searchTerm = e.target.value;
    dataService.loadAllVidReqs(state);

  }, 600));


  // Add topic to database
  formVidReqEle.addEventListener('submit', (e) => {
    e.preventDefault();
    // Fetch
    // formDate return all the values of the inout of the form
    const formdata = new FormData(formVidReqEle);
    formdata.append('author_id', state.userId);

    // Validation of input 
    const isvalid = checkValidity(formdata);

    if (isvalid === false) {
      return;
    }

    dataService.AddVideoReq(formdata).then((data) => {
      addSingaleVideoReq(data, state, true);
    });
  });
});
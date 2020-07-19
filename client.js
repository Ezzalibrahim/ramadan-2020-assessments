//

const listOfVideoEle = document.getElementById('listOfRequests');

const SUPER_USER_ID = '19980201';
const state = {
  sortBy: 'newFirst',
  searchTerm: '',
  userId: '',
  isSuperUser: false
}

function getSingaleVideoReq(videoInfo, isprepend = false) {

  var videoContainerEle = document.createElement('div');
  const statusVideo = videoInfo.status;
  console.log(statusVideo);
  var vidReqTemplate = `
<div class="card mb-3">
${ state.isSuperUser? `<div class="card-header d-flex justify-content-between">
        <div class ="row mr-4">
          <select   class="form-control col-xs-2 " id="admin_change_status_${videoInfo._id}">
            <option ${statusVideo === 'new'? 'selected' :''}  value="new">new</option>
            <option ${statusVideo === 'planned'? 'selected' :''}  value="planned">planned</option>
            <option ${statusVideo === 'done'? 'selected' :''} value="done">done</option>
          </select>
        </div>
          <div class="input-group  mr-2 ${statusVideo === 'done'? '' :'d-none'} " id="admin_video_res_container_${videoInfo._id}">
            <input type="text" class="form-control"
              id="admin_video_res_${videoInfo._id}" value = "${videoInfo.video_ref.link}"
              placeholder="paste here youtube video id">
            <div class="input-group-append">
              <button class="btn btn-outline-secondary" 
                id="admin_save_video_res_${videoInfo._id}"
                type="button">Save</button>
            </div>
          </div>
          <button id="admin_delete_video_req_${videoInfo._id}" class='btn btn-danger '>delete</button>
        </div>` : ''
      }
        <div class="card-body d-flex justify-content-between flex-row">
          <div class="d-flex flex-column">
            <h3>${videoInfo.topic_title}</h3>
            <p class="text-muted mb-2">${videoInfo.topic_details}</p>
            <p class="mb-0 text-muted">
              ${
                videoInfo.expected_result && 
              `<strong>Expected results:</strong> ${videoInfo.expected_result}`
            }
                  </p>
          </div>
          <div class="d-flex flex-column text-center">
            <a id="votes_ups_${videoInfo._id}" class="btn btn-link">🔺</a>
            <h3 id="scour_vote_${videoInfo._id}">${videoInfo.votes.ups.length - videoInfo.votes.downs.length }</h3>
            <a  id="votes_downs_${videoInfo._id}" class="btn btn-link">🔻</a>
          </div>
        </div>
        <div class="card-footer d-flex flex-row justify-content-between">
          <div>
            <span class="text-info">${videoInfo.status.toUpperCase()}</span>
            &bullet; added by <strong>${videoInfo.author_name}</strong> on
            <strong>${new Date(videoInfo.submit_date).toLocaleDateString()}</strong>
          </div>
          <div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
            <div class="badge badge-success">
            ${videoInfo.target_level}
            </div>
          </div>
        </div>
        </div>

`;

  videoContainerEle.innerHTML = vidReqTemplate;
  isprepend ? listOfVideoEle.prepend(videoContainerEle) : listOfVideoEle.appendChild(videoContainerEle);

  changeStyleVotes(videoInfo._id, videoInfo);

  function adminSubmitChange(id, status, resVideo = '') {
    fetch('http://localhost:7777/video-request', {
        method: 'PUT',
        headers: {
          'content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          status,
          resVideo
        })
      }).then((rse) => rse.json())
      .then((data) => window.location.reload());
  }

  if (state.isSuperUser) {

    const adminChangeStatusElm = document.getElementById(`admin_change_status_${videoInfo._id}`);
    const adminDeleteVideoReqElm = document.getElementById(`admin_delete_video_req_${videoInfo._id}`);
    const adminVideoRespElm = document.getElementById(`admin_video_res_${videoInfo._id}`);
    const adminSaveVideoResElm = document.getElementById(`admin_save_video_res_${videoInfo._id}`);

    const admin_video_res_container = document.getElementById(`admin_video_res_container_${videoInfo._id}`);


    // Change status 
    adminChangeStatusElm.addEventListener('change', (e) => {
      if (e.target.value === 'done') {
        admin_video_res_container.classList.remove('d-none');
      } else {
        admin_video_res_container.classList.add('d-none');

        //TODO:add function to fetch
        adminSubmitChange(videoInfo._id, e.target.value);

      }
    })

    // Save the Video 
    adminSaveVideoResElm.addEventListener('click', (e) => {
      e.preventDefault();
      if (!adminVideoRespElm.value) {
        adminVideoRespElm.classList.add('is-invalid');
        adminVideoRespElm.addEventListener('input', () => {
          adminVideoRespElm.classList.remove('is-invalid');
        })
        return;
      }
      adminSubmitChange(videoInfo._id, 'done', adminVideoRespElm.value);

    })

  } // End idf is super user

  const countVotEle = document.getElementById(`scour_vote_${videoInfo._id}`);
  const voteElm = document.querySelectorAll(`[id^=votes_][id$=_${videoInfo._id}]`);


  voteElm.forEach(element => {
    element.addEventListener('click', function (e) {
      e.preventDefault();

      const [, vote_type, id] = e.target.getAttribute('id').split('_');

      fetch('http://localhost:7777/video-request/vote', {
          method: 'PUT',
          headers: {
            'content-Type': 'application/json'
          },
          body: JSON.stringify({
            id,
            vote_type,
            user_id: state.userId
          })
        }).then(bold => bold.json())
        .then(data => {

          countVotEle.innerText = data.votes.ups.length - data.votes.downs.length;

          changeStyleVotes(id, data, vote_type);

        });
    });
  });


}

function changeStyleVotes(videoId, listVotes, vote_type) {

  if (!vote_type) {
    if (listVotes.votes.ups.includes(state.userId)) {
      vote_type = 'ups';
    } else if (listVotes.votes.downs.includes(state.userId)) {
      vote_type = 'downs';
    } else {
      return;
    }
  }

  const videoVotUpsEle = document.getElementById(`votes_ups_${videoId}`);
  const videoVotDownsEle = document.getElementById(`votes_downs_${videoId}`);

  const votesDirEle = vote_type === 'ups' ? videoVotUpsEle : videoVotDownsEle;
  const otherDirEle = vote_type === 'ups' ? videoVotDownsEle : videoVotUpsEle;


  if (listVotes.votes[vote_type].includes(state.userId)) {
    votesDirEle.style.opacity = 1;
    otherDirEle.style.opacity = '0.5';
  } else {
    otherDirEle.style.opacity = 1;
  }
}

function loadAllVidReqs(sortBy = 'newFirst', searchTerm = '') {

  fetch(`http://localhost:7777/video-request?sortBy=${sortBy}&searchTerm=${searchTerm}`)
    .then(blod => blod.json())
    .then(data => {
      //we give an empty value to the container of video Topic and after we load all video again and sort theme
      listOfVideoEle.innerHTML = "";

      data.forEach((videoInfo) => {
        getSingaleVideoReq(videoInfo);
      });
    });
}

function debounce(fn, time) {
  let timeout;

  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), time);
  };
}

function checkValidity(formData) {

  const topic = formData.get('topic_title');
  const topicDetails = formData.get('topic_details');

  // General Email Regex to validate email
  const emailPattern = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

  if (!topic || topic.length > 20) {
    document.querySelector('[name=topic_title]').classList.add('is-invalid');
  }
  if (!topicDetails) {
    document.querySelector('[name=topic_details]').classList.add('is-invalid');
  }

  // get all the inout in the form whith class is-invalid
  const filed_invalid = document.getElementById('formVideoRequest').querySelectorAll('.is-invalid');

  if (filed_invalid.length) {
    filed_invalid.forEach((element) => {
      element.addEventListener('input', function () {
        this.classList.remove('is-invalid');
      });
    });
    return false;
  }


  return true;
}

document.addEventListener('DOMContentLoaded', function () {
  const formVidReqEle = document.getElementById('formVideoRequest');
  const sortByElmes = document.querySelectorAll('[id*=sort_by_]');
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
  loadAllVidReqs();

  // tow button to sort by new or by Top voted
  sortByElmes.forEach((elm) => {
    elm.addEventListener('click', function (e) {
      e.preventDefault();

      state.sortBy = this.querySelector('input').value;
      loadAllVidReqs(state.sortBy, state.searchTerm);

      if (state.sortBy === 'topVotedFirst') {
        document.getElementById('sort_by_new').classList.remove('active');
      } else {
        document.getElementById('sort_by_top').classList.remove('active');
      }

      this.classList.add('active');

    });
  });

  // Search 
  searchEle.addEventListener('input', debounce((e) => {

    state.searchTerm = e.target.value;
    loadAllVidReqs(state.sortBy, state.searchTerm);

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

    fetch('http://localhost:7777/video-request', {
        method: 'POST',
        body: formdata
      })
      .then((bold) => bold.json())
      .then((data) => {
        console.log(data);
        getSingaleVideoReq(data, true);
      });

  });
});
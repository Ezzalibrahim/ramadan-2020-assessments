import {
  changeVoteStyle
} from './changeVoteStyle.js';
import dataService from './dataService.js';

import {
  state
} from "./client.js";


const listOfVideoEle = document.getElementById('listOfRequests');

export function addSingaleVideoReq(videoInfo, state, isprepend = false) {
  var videoContainerEle = document.createElement('div');
  // change the format of date 
  function formatdate(date) {
    return new Date(date).toLocaleDateString();
  }
  // we de destraction to avoid repet videoInfo a lot of time !!
  const {
    _id: id,
    status,
    topic_title: title,
    topic_details: details,
    expected_result: expected,
    video_ref: videoRef,
    votes,
    author_name: author,
    submit_date: submitDate,
    target_level: level
  } = videoInfo;

  // add Calss bootstrap to video template
  const className = status === 'done' ? 'text-success' : status === 'planned' ? 'text-primary' : 'text-muted'

  // Vote Score 
  const votesScore = votes.ups.length - votes.downs.length;

  // add a special DOM to VideoTemplate if the user is an admin
  function getAdminDOM(id, status) {
    return `<div class="card-header d-flex justify-content-between">
              <div class ="row mr-4">
                <select   class="form-control col-xs-2 " id="admin_change_status_${id}">
                  <option ${status === 'new'? 'selected' :''}  value="new">new</option>
                  <option ${status === 'planned'? 'selected' :''}  value="planned">planned</option>
                  <option ${status === 'done'? 'selected' :''} value="done">done</option>
                </select>
              </div>
                <div class="input-group  mr-2 ${status === 'done'? '' :'d-none'} " id="admin_video_res_container_${id}">
                  <input type="text" class="form-control"
                    id="admin_video_res_${id}" value = "${videoRef.link}"
                    placeholder="paste here youtube video id">
                  <div class="input-group-append">
                    <button class="btn btn-outline-secondary" 
                      id="admin_save_video_res_${id}"
                      type="button">Save</button>
                  </div>
                </div>
                <button id="admin_delete_video_req_${id}" class='btn btn-danger '>delete</button>
            </div>`
  }

  // if the video is done add the video dom to the video template
  function addVideoRef(link) {
    return `
            <div class="ml-auto mr-3">
              <iframe src="https://www.youtube.com/embed/${link}" allowfullscreen frameborder="0">
              </iframe>
            </div>
          `
  }
  var vidReqTemplate = `
  <div class="card mb-3"> ${ state.isSuperUser? getAdminDOM(id , status) : '' }
          <div class="card-body d-flex justify-content-between flex-row">
            <div class="d-flex flex-column">
              <h3>${title}</h3>
              <p class="text-muted mb-2"> ${details}</p>
              <p class="mb-0 text-muted"> ${ expected && `<strong>Expected results:</strong> ${expected}` } </p>
            </div>
            ${status === 'done' ? addVideoRef(videoRef.link) : ``}

            <div class="d-flex flex-column text-center">
              <a id="votes_ups_${id}" class="btn btn-link">🔺</a>
              <h3 id="scour_vote_${id}">${votesScore}</h3>
              <a  id="votes_downs_${id}" class="btn btn-link">🔻</a>
            </div>
          </div>
          <div class="card-footer d-flex flex-row justify-content-between">
            <div class="${className}">
              <span >${status.toUpperCase()}
              ${status === 'done'? `  On ${formatdate(videoRef.date)} ` :''}
              </span>
              &bullet; added by <strong>${author}</strong> on
              <strong>${formatdate(submitDate)}</strong>
            </div>
            <div class="d-flex justify-content-center flex-column 408ml-auto mr-2">
              <div class="badge badge-success">
              ${level}
              </div>
            </div>
          </div>
          </div>
  
  `;


  //! Functions of Admin 
  // bind all admin action( functions )
  function bindAdminAction(id, title) {

    const adminChangeStatusElm = document.getElementById(`admin_change_status_${id}`);
    const adminDeleteVideoReqElm = document.getElementById(`admin_delete_video_req_${id}`);
    const adminVideoRespElm = document.getElementById(`admin_video_res_${id}`);
    const adminSaveVideoResElm = document.getElementById(`admin_save_video_res_${id}`);

    const admin_video_res_container = document.getElementById(`admin_video_res_container_${id}`);


    //! Change status 
    adminChangeStatusElm.addEventListener('change', (e) => {
      if (e.target.value === 'done') {
        admin_video_res_container.classList.remove('d-none');
      } else {
        admin_video_res_container.classList.add('d-none');

        //Change the status of the video
        dataService.updateVideoStatus(id, e.target.value);
      }
    })

    //! Save the Video 
    adminSaveVideoResElm.addEventListener('click', (e) => {
      e.preventDefault();
      if (!adminVideoRespElm.value) {
        adminVideoRespElm.classList.add('is-invalid');
        adminVideoRespElm.addEventListener('input', () => {
          adminVideoRespElm.classList.remove('is-invalid');
        })
        return;
      }
      dataService.updateVideoStatus(id, 'done', adminVideoRespElm.value);

    })

    //! Delete Video
    adminDeleteVideoReqElm.addEventListener('click', (e) => {

      const isSureToDelete = confirm(`Are You Sure To delete  ${title}`);
      if (!isSureToDelete) return;


      dataService.deletevideoReq(id).then((_) => window.location.reload());
    })
  }

  // bind vote action
  function bindVotesAction(id, status, state) {

    const voteElm = document.querySelectorAll(`[id^=votes_][id$=_${id}]`);

    voteElm.forEach(element => {
      if (state.isSuperUser || status === 'done') {
        return;
      }
      element.addEventListener('click', function (e) {
        e.preventDefault();

        const [, vote_type, id] = e.target.getAttribute('id').split('_');

        dataService.updateVote(id, vote_type, state.userId).then(data => {

          countVotEle.innerText = data.votes.ups.length - data.votes.downs.length;

          changeVoteStyle(id, data.votes, status, state, vote_type);

        });
      });
    });
  }

  videoContainerEle.innerHTML = vidReqTemplate;
  isprepend ? listOfVideoEle.prepend(videoContainerEle) : listOfVideoEle.appendChild(videoContainerEle);

  // add fuontonalty if the user is super user 
  if (state.isSuperUser) {
    bindAdminAction(id, title);
  }

  changeVoteStyle(id, votes, status, state);

  const countVotEle = document.getElementById(`scour_vote_${id}`);

  bindVotesAction(id, status, state);
}
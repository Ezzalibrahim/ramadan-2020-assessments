import {
  changeVoteStyle
} from './changeVoteStyle.js';
import dataService from './dataService.js';


const listOfVideoEle = document.getElementById('listOfRequests');

export function addSingaleVideoReq(videoInfo, state, isprepend = false) {
  var videoContainerEle = document.createElement('div');

  var vidReqTemplate = `
  <div class="card mb-3">
  ${ state.isSuperUser? `<div class="card-header d-flex justify-content-between">
          <div class ="row mr-4">
            <select   class="form-control col-xs-2 " id="admin_change_status_${videoInfo._id}">
              <option ${videoInfo.status === 'new'? 'selected' :''}  value="new">new</option>
              <option ${videoInfo.status === 'planned'? 'selected' :''}  value="planned">planned</option>
              <option ${videoInfo.status === 'done'? 'selected' :''} value="done">done</option>
            </select>
          </div>
            <div class="input-group  mr-2 ${videoInfo.status === 'done'? '' :'d-none'} " id="admin_video_res_container_${videoInfo._id}">
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
  
            ${videoInfo.status === 'done' ?`
            <div class="ml-auto mr-3">
              <iframe src="https://www.youtube.com/embed/${videoInfo.video_ref.link}" allowfullscreen frameborder="0">
              </iframe>
            </div>
            `:``}
  
            <div class="d-flex flex-column text-center">
              <a id="votes_ups_${videoInfo._id}" class="btn btn-link">🔺</a>
              <h3 id="scour_vote_${videoInfo._id}">${videoInfo.votes.ups.length - videoInfo.votes.downs.length }</h3>
              <a  id="votes_downs_${videoInfo._id}" class="btn btn-link">🔻</a>
            </div>
          </div>
          <div class="card-footer d-flex flex-row justify-content-between">
            <div class="${videoInfo.status === 'planned'? 'text-info' :''}
                        ${videoInfo.status === 'done'? 'text-success' :''}">
              <span >${videoInfo.status.toUpperCase()}
              ${videoInfo.status === 'done'? `
                On ${new Date(videoInfo.video_ref.date).toLocaleDateString()}
              ` :''}
              </span>
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

  changeVoteStyle(videoInfo._id, videoInfo, videoInfo.state, state);


  //! Functions of Admin
  if (state.isSuperUser) {

    const adminChangeStatusElm = document.getElementById(`admin_change_status_${videoInfo._id}`);
    const adminDeleteVideoReqElm = document.getElementById(`admin_delete_video_req_${videoInfo._id}`);
    const adminVideoRespElm = document.getElementById(`admin_video_res_${videoInfo._id}`);
    const adminSaveVideoResElm = document.getElementById(`admin_save_video_res_${videoInfo._id}`);

    const admin_video_res_container = document.getElementById(`admin_video_res_container_${videoInfo._id}`);


    //! Change status 
    adminChangeStatusElm.addEventListener('change', (e) => {
      if (e.target.value === 'done') {
        admin_video_res_container.classList.remove('d-none');
      } else {
        admin_video_res_container.classList.add('d-none');

        //Change the status of the video
        dataService.updateVideoStatus(videoInfo._id, e.target.value);
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
      dataService.updateVideoStatus(videoInfo._id, 'done', adminVideoRespElm.value);

    })

    //! Delete Video
    adminDeleteVideoReqElm.addEventListener('click', (e) => {

      const isSureToDelete = confirm(`Are You Sure To delete  ${videoInfo.topic_title}`);
      if (!isSureToDelete) return;

      fetch('http://localhost:7777/video-request', {
          method: 'DELETE',
          headers: {
            'content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: videoInfo._id
          })
        }).then((rse) => rse.json())
        .then((data) => window.location.reload());
    })

  } // End if is super user

  const countVotEle = document.getElementById(`scour_vote_${videoInfo._id}`);
  const voteElm = document.querySelectorAll(`[id^=votes_][id$=_${videoInfo._id}]`);


  voteElm.forEach(element => {
    if (state.isSuperUser || videoInfo.status === 'done') {
      return;
    }
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

          changeVoteStyle(id, data, videoInfo.status, state, vote_type);

        });
    });
  });


}
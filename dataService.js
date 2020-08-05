import {
    addSingaleVideoReq
} from "./addSingaleVideoReq.js";
import {
    state
} from "./client.js";
import api from "./api.js";

export default {
    AddVideoReq: (formdata) => {
        return api.videoReq.post(formdata);
    },
    deletevideoReq: (id) => {
        return api.videoReq.delete(id);
    },
    // Admin submit changes (change status or add Video Link)
    updateVideoStatus: (id, status, resVideo = '') => {
        return api.videoReq.update(id, status, resVideo).then((_) => window.location.reload());
    },
    loadAllVidReqs: (state) => {
        const listOfVideoEle = document.getElementById('listOfRequests');
        api.videoReq.get(state).then(data => {
            //we give an empty value to the container of video Topic and after we load all video again and sort theme
            listOfVideoEle.innerHTML = "";

            data.forEach((videoInfo) => {
                addSingaleVideoReq(videoInfo, state);
            });
        });
    },
    updateVote: (id, vote_type, user_id) => {
        return api.votes.update(id, vote_type, user_id);
    }
}
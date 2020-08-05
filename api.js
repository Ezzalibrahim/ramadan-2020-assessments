const URL = 'http://localhost:7777/video-request';
export default {
    videoReq: {
        get: (state) => {
            return fetch(`${URL}?sortBy=${state.sortBy}&searchTerm=${state.searchTerm}&filterBy=${state.filterBy}`)
                .then(blod => blod.json())
        },
        post: (formdata) => {

            return fetch(URL, {
                    method: 'POST',
                    body: formdata
                })
                .then((bold) => bold.json())
        },
        update: (id, status, resVideo = '') => {
            return fetch(URL, {
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
        },
        delete: (id) => {
            return fetch(URL, {
                method: 'DELETE',
                headers: {
                    'content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id
                })
            }).then((rse) => rse.json())
        }
    },
    votes: {
        update: (id, vote_type, user_id) => {
            return fetch(`${URL}/vote`, {
                method: 'PUT',
                headers: {
                    'content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id,
                    vote_type,
                    user_id
                })
            }).then(bold => bold.json());

        }

    }
}
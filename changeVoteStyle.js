export function changeVoteStyle(videoId, votes, videoStatus, state, vote_type) {
    const videoVotUpsEle = document.getElementById(`votes_ups_${videoId}`);
    const videoVotDownsEle = document.getElementById(`votes_downs_${videoId}`);

    if (state.isSuperUser || videoStatus === 'done') {
        videoVotUpsEle.style.opacity = '0.5';
        videoVotDownsEle.style.opacity = '0.5';
        videoVotUpsEle.style.cursor = 'not-allowed';
        videoVotDownsEle.style.cursor = 'not-allowed';
        return;
    }

    if (!vote_type) {
        if (votes.ups.includes(state.userId)) {
            vote_type = 'ups';
        } else if (votes.downs.includes(state.userId)) {
            vote_type = 'downs';
        } else {
            return;
        }
    }


    const votesDirEle = vote_type === 'ups' ? videoVotUpsEle : videoVotDownsEle;
    const otherDirEle = vote_type === 'ups' ? videoVotDownsEle : videoVotUpsEle;


    if (votes[vote_type].includes(state.userId)) {
        votesDirEle.style.opacity = 1;
        otherDirEle.style.opacity = '0.5';
    } else {
        otherDirEle.style.opacity = 1;
    }
}
const VideoRequest = require('./../models/video-requests.model');
const User = require('./../models/user.model');
const {
  filter
} = require('bluebird');

module.exports = {
  createRequest: async (vidRequestData) => {

    const authorId = vidRequestData.author_id;

    if (authorId) {
      const user = await User.findOne({
        _id: authorId
      });
      vidRequestData.author_name = user.author_name;
      vidRequestData.author_email = user.author_email;

    }

    let newRequest = new VideoRequest(vidRequestData);
    return newRequest.save();
  },

  getAllVideoRequests: (filterBy) => {
    const filter = filterBy === 'all' ? {} : {
      status: filterBy
    };
    return VideoRequest.find(filter).sort({
      submit_date: '-1'
    })
  },

  searchRequests: (topic, filterBy) => {
    const filter = filterBy === 'all' ? {} : {
      status: filterBy
    };
    return VideoRequest.find({
        topic_title: {
          $regex: topic,
          $options: 'i'
        },
        ...filter
      })
      .sort({
        addedAt: '-1'
      })

  },

  getRequestById: (id) => {
    return VideoRequest.findById({
      _id: id
    });
  },

  updateRequest: (id, status, resVideo) => {
    const updates = {
      status: status,
      video_ref: {
        link: resVideo,
        date: resVideo && new Date(),
      },
    };

    return VideoRequest.findByIdAndUpdate(id, updates, {
      new: true
    });
  },

  updateVoteForRequest: async (id, vote_type, user_id) => {
    const oldRequest = await VideoRequest.findById({
      _id: id
    });
    const other_type = vote_type === 'ups' ? 'downs' : 'ups';

    const oldVotesList = oldRequest.votes[vote_type];
    const oldOtherList = oldRequest.votes[other_type];

    if (!oldVotesList.includes(user_id)) {
      oldVotesList.push(user_id);
    } else {
      oldVotesList.splice(user_id);
    }

    if (oldOtherList.includes(user_id)) {
      oldOtherList.splice(user_id);
    }

    return VideoRequest.findByIdAndUpdate({
      _id: id
    }, {
      votes: {
        [vote_type]: oldVotesList,
        [other_type]: oldOtherList
      },
    }, {
      new: true
    });
  },

  deleteRequest: (id) => {
    return VideoRequest.deleteOne({
      _id: id
    });
  },
};
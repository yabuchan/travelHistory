'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Sound = mongoose.model('Sound'),
  UserStatus = mongoose.model('UserStatus'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  restClient = require('node-rest-client').Client,
  _ = require('lodash');
var client = new restClient();
var youtubeMicroserviceUrl = 'http://localhost:5000/broker/list';


/**
 * Show the current Sound
 */
exports.read = function(req, res) {
  // convert mongoose document to JSON
  var sound = req.sound ? req.sound.toJSON() : {};

  // Add a custom field to the Article, for determining if the current User is the "owner".
  // NOTE: This field is NOT persisted to the database, since it doesn't exist in the Article model.
  sound.isCurrentUserOwner = req.user && sound.user && sound.user._id.toString() === req.user._id.toString();

  res.jsonp(sound);
};


/**
 * List of Sounds
 */
exports.list = function(req, res) {
  var address = req.query.address;
  var locality = req.query.locality;
  var lng, lat;
  if (req.query.lng) {
    lng = req.query.lng;
  } else {
    lng = 37.2619583;
  }
  if (req.query.lat) {
    lat = req.query.lat;
  } else {
    lat = -121.9643371;
  }
  console.log(lng);
  console.log(lat);
  var keywords = req.query.keywords;

  //  var sounds = getContents(lng, lat, keywords);
  getContents(lng, lat, keywords).then(function(sounds) {
    //respond list.
    res.jsonp(sounds);
  });

};

/**
 * Sound middleware
 */
exports.soundByID = function(req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Sound is invalid'
    });
  }

  Sound.findById(id).populate('user', 'displayName').exec(function(err, sound) {
    if (err) {
      return next(err);
    } else if (!sound) {
      return res.status(404).send({
        message: 'No Sound with that identifier has been found'
      });
    }
    req.sound = sound;
    next();
  });
};

exports.launch = function(req, res) {
  console.log(req.params.controlUserId);
  //get parameters
  var controlUserId = req.params.controlUserId,
    youtubeId = req.params.youtubeId;

  var startTime = getStartTime(youtubeId);

  //Update the user status
  var statusCode = updateUserSoundStatus(controlUserId, youtubeId, startTime);
  var sounds = 'ok';
  res.status(statusCode).send({
    message: '-'
  });
};

function updateUserSoundStatus(controlUserId, youtubeId, startTime) {
  if (controlUserId) {
    UserStatus.findOne({ userId: controlUserId }, function(err, userstatus) {
      if (userstatus) {
        if (youtubeId) {
          userstatus.youtubeId = youtubeId;
        } else {
          userstatus.youtubeId = 'none';
        }
        userstatus.startTime = startTime;

        userstatus.save(function(err) {
          if (err) {
            console.error('ERROR!');
          }
        });
      } else {
        console.log('no userStatus with this user_id is found');
        userstatus = new UserStatus({ userId: controlUserId, youtubeId: youtubeId });
        console.log(userstatus);
        userstatus.save(function(err) {
          if (err) {
            console.error('ERROR!');
          }
        });
      }
    });
    return 200;
  } else {
    return 404;
  }
}

function getStartTime(youtubeId) {
  var startTime;
  switch (youtubeId) {
    case 'aaa':
      startTime = 0;
      break;
    case 'aaa':
      startTime = 0;
      break;
    default:
      startTime = 0;
  }
  return startTime;
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function getContents(lat, lng, keywords) {
  var sounds = [];
  var args = {
    data: {
      lng: lng,
      lat: lat,
      keywords: keywords
    },
    headers: { "Content-Type": "application/json" }
  };

  var youtubeMicroserviceUrlWithQuery = youtubeMicroserviceUrl + '?lng=' + lng + '&lat=' + lat + '&keywords=' + keywords;

  return new Promise(function(resolve, reject) {
    client.get(youtubeMicroserviceUrlWithQuery, args,
      function(data, response) {
        // parsed response body as js object 
        var decodedData = ab2str(data);
        var persedData = JSON.parse(decodedData);

        resolve(persedData.items);
      });
  });
}

function getDummyContents(locality, activity) {
  var sounds = [];
  sounds.push({
    id: 'jznOT028iK0',
    url: 'https://s3-us-west-1.amazonaws.com/hackathon-prototype/roadrace1.mp3',
    description: "Attaque d'Alberto Contador au col du Galibier Tour de France 2007",
    detailDescription: 'On the road, both carriages and automotives were running.',
    year: '1900s',
    location: 'New York'
  });
  return sounds;
}

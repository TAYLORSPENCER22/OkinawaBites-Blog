const mongoose = require('mongoose');
const {Schema, model} = mongoose;

// a restaurant/spot that posts can be tied to and shown as a map pin
const LocationSchema = new Schema({
    name: {type: String, required: true},
    lat: {type: Number, required: true},
    lng: {type: Number, required: true},
    address: String,
}, {
    timestamps: true,
});

const LocationModel = model('Location', LocationSchema);

module.exports = LocationModel;

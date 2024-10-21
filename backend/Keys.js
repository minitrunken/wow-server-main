const mongoose = require('mongoose');

// Define the schema for a key
const keySchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true,  // Ensures each key is unique
    },
    createdAt: {
        type: Date,
        default: Date.now,  // Automatically set to current date when created
        required: true,
    }
});

// Create a Mongoose model from the schema
const Key = mongoose.model('Key', keySchema);

module.exports = Key;

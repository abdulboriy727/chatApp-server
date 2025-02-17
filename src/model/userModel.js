const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        minlength: 10
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: Number,
        default: 100,
        enam: [100, 101]
    },
    profilePicture: {
        type: String,
        default: "",
    },
    coverPicture: {
        type: String,
        default: ""
    },
    about: {
        type: String,
        default: "",
    },
    liveIn: {
        type: String,
        default: ""
    },
    country: {
        type: String,
        default: ""
    },
    works: {
        type: String,
        default: ""
    }
}, {timestamps: true})

module.exports = mongoose.model("User", userSchema);
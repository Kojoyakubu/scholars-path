const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  level: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Level', 
  },
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
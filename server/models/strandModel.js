const mongoose = require('mongoose');

const strandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Subject',
  },
}, { timestamps: true });

module.exports = mongoose.model('Strand', strandSchema);
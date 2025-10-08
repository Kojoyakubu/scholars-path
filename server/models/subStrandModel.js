const mongoose = require('mongoose');

const subStrandSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  strand: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Strand',
  },
}, { timestamps: true });

module.exports = mongoose.model('SubStrand', subStrandSchema);
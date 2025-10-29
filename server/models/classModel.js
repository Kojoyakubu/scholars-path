const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Class', classSchema);

const mongoose = require('mongoose')

const goalSchema = mongoose.Schema(
  {
 
    title: {
      type: String,
      required: [true, 'Please add a title'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

module.exports = mongoose.model('Goal', goalSchema)

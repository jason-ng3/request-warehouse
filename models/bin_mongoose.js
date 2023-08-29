const mongoose = require('mongoose');

mongoose.set('strictQuery',false);

const binSchema = new mongoose.Schema({
  binURL: String,
  requests: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request'
    }
  ]
});

binSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Bin', binSchema);
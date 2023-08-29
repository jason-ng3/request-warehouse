const mongoose = require('mongoose');

mongoose.set('strictQuery',false);

const requestSchema = new mongoose.Schema({
  requestType: String,
  path: String, 
  params: Object,
  query: Object,
  headers: Object,
  body: Object,
  bin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bin'
  }
});

requestSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Request', requestSchema);
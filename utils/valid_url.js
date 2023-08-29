const validUrl = function(url) {
  const path = url.slice(3)
  return typeof url === 'string' && path.length > 10;
};

module.exports = { validUrl };
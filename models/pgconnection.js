const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  host: 'localhost',
  database: 'reqbin_pg',
  password: 'password',
  port: 5432,
});

const pg_enqueue = function(pathKey, request_data) {
  fs.readFile('pg_queue.json', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }

    try {
      const jsonData = JSON.parse(data);

      const pg_queue = jsonData.requests;

      pg_queue.push(
        { path: pathKey, data: request_data }
      );

      const updatedData = JSON.stringify(jsonData, null, 2);

      fs.writeFile('pg_queue.json', updatedData, (err) => {
        if (err) {
          console.error('Error writing to file:', err);
          return;
        }
      });
    } catch(error) {
      console.error('Error parsing JSON:', error);
    }
  });
};

const pg_batch_dequeue = function() {
  return new Promise((resolve, reject) => {
    fs.readFile('pg_queue.json', 'utf8', (err, data) => {
      if (err) {
        console.error('Error reading file:', err);
        return;
      }
      let pg_queue;

      try {
        const jsonData = JSON.parse(data);

        pg_queue = jsonData.requests;
        console.log("pg queue", pg_queue)

        const updatedData = JSON.stringify(
          {
            "requests": []
          }
        );

        fs.writeFile('pg_queue.json', updatedData, (err) => {
          if (err) {
            console.error('Error writing to file:', err);
            reject(err);
            return;
          }
          resolve(pg_queue);
        });
      } catch(error) {
        console.error('Error parsing JSON:', error);
      }
      
    });
  });
};

module.exports = {
  pg_enqueue,
  pg_batch_dequeue,
  pool,
};
const { pool, pg_batch_dequeue } = require('./models/pgconnection');
// const fs = require('fs');


  //INSERT DATA INTO POSTGRES
async function batch_process_pg_queue() {
  try {
    // batch dequeue from pg_queue
    // console.log(pg_batch_dequeue())
    const requests = await pg_batch_dequeue();
    for (let idx = 0; idx < requests.length; idx++) {

      const pathKey = requests[idx].path;
      // const request_data = requests[idx].data;
      const http_method = requests[idx].data.requestType;
      const content_type = requests[idx].data.headers['content-type'];
      const content_length = parseInt(requests[idx].data.headers['content-length'], 10);
      const user_agent = requests[idx].data.headers['user-agent']
      let body = requests[idx].data.body;
      if (!body || body.length === 0) {
        body = null;
      }

      const urlExists = await pool.query(
        `SELECT * FROM bin WHERE bin_url = $1`, [pathKey]
      );
      
      //If the endpoint doesn't yet exist in pg, instead of returning error, we insert it
      //This is because for now, the mongo data may not line up 100% with pg data.
      if (urlExists.rowCount === 0) {
        await pool.query(
          `INSERT INTO bin (bin_url) VALUES ($1)`, [pathKey]
        )
        const newBin = await pool.query(
          `SELECT * FROM bin WHERE bin_url = $1`, [pathKey]
        );
        const bin_id = newBin.rows[0].id;
        // await pool.query(
        //   `INSERT INTO request (body, bin_id,  ) VALUES ($1, $2)`, [request_data, bin_id]
        // )
        await pool.query(
          `INSERT INTO request (http_method, content_type, content_length, user_agent, body, bin_id)
           VALUES ($1, $2, $3, $4, $5, $6)`, 
           [http_method || null, 
            content_type || null,
            content_length || null,
            user_agent || null,
            body,
            bin_id || null,

          ]
          )
      } else {
        const bin_id = urlExists.rows[0].id;
        await pool.query(
          `INSERT INTO request (http_method, content_type, content_length, user_agent, body, bin_id)
           VALUES ($1, $2, $3, $4, $5, $6)`, 
           [http_method || null, 
            content_type || null,
            content_length || null,
            user_agent || null,
            body,
            bin_id || null,

          ]
        )
      }
    }
  } catch (error) {
    console.error('Error executing query ', error);
  }
};

batch_process_pg_queue();


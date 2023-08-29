CREATE TABLE bin (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bin_url text NOT NULL
);

CREATE TABLE request (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  http_method varchar(15),
  content_type text,
  content_length integer,
  user_agent text,
  body JSONB,
  bin_id integer REFERENCES bin(id) ON DELETE CASCADE NOT NULL
);

--EXAMPLE DATA
-- INSERT INTO bin (bin_url)
-- VALUES  
--   ('d38b587a-cf1d-4dd4-b62b-4e91d71ca4b8'),
--   ('ed2679e9-7a96-458e-bba4-0e07bf0dfeb8'),
--   ('1928856b-92d9-4589-85c1-47376d311ccf');

-- INSERT INTO request (request_data, bin_id)        
-- VALUES
--   ('{ "phones":[ {"type": "mobile", "phone": "001001"} , {"type": "fix", "phone": "002002"} ] }', 'd38b587a-cf1d-4dd4-b62b-4e91d71ca4b8'),
--   ('{ "phones":[ {"type": "mobile", "phone": "001001"} , {"type": "fix", "phone": "002002"} ] }', 'd38b587a-cf1d-4dd4-b62b-4e91d71ca4b8'),
--   ('{ "phones":[ {"type": "mobile", "phone": "001001"} , {"type": "fix", "phone": "002002"} ] }', 'ed2679e9-7a96-458e-bba4-0e07bf0dfeb8'),
--   ('{ "phones":[ {"type": "mobile", "phone": "001001"} , {"type": "fix", "phone": "002002"} ] }', 'ed2679e9-7a96-458e-bba4-0e07bf0dfeb8');



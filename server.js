const mongoose = require('mongoose');
const dotenv = require('dotenv');
process.on('UNCAUGHT EXCEPTION', (err) => {
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: './config.env' });
const app = require('./app');

const db = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);
console.log(db);
// console.log(process.env);
mongoose
  .connect(db)
  .then((con) => {
    // console.log(con.connections);
    console.log('DB connection successful');
  })
  .catch((err) => console.log(err));

// const testTour = new Tour({ name: 'Dalat', price: 2000000 });
// testTour
//   .save()
//   .then((doc) => {
//     console.log(doc);
//   })
//   .catch((err) => {
//     console.log('Error when saving document to database: ' + err);
//   });
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
const a = 10;
//TEST

process.on('unhandledRejecttion', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLE REJECTION  . SHUTTING DOWN...');
  process.exit(1);
});

// loi khong duoc xu li boi async await

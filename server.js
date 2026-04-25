const mongoose = require('mongoose');
const dotenv = require('dotenv'); 
dotenv.config({ path: './config.env' });
const app = require('./app');



const db = process.env.DATABASE.replace("<db_password>",process.env.DATABASE_PASSWORD)
// console.log(db);
mongoose.connect(db,{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then((con) => {
    // console.log(con.connections);
    console.log("Database connected successfuly")
})



const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`listening to port ${port}...`);
})
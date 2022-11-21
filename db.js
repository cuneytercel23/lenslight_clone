import mongoose from "mongoose";

const conn = () => {
    mongoose.connect(process.env.DB_URI, {
        dbName:"lenslight_tr", // database oluşturma isteği
        useNewUrlParser : true, // ?
        useUnifiedTopology :true // bunlar ?
    }).then(() => console.log("Connected to DB succesfully"))
    .catch((err) => {
        console.log(`DB connection Error ${err}`);
    })
};

export default conn; // yeni nesil export :D
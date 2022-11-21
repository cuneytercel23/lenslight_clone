import express from "express";
import dotenv  from "dotenv";
import conn from "./db.js"; // ecma6 için js kısmı kesin yazılmalı ***
import cookieParser from "cookie-parser";
import pageRoute from "./routes/pageRoute.js";
import photoRoute from "./routes/photoRoute.js";
import userRoute from "./routes/userRoute.js";
import { checkUser } from "./middlewares/authMiddleware.js";
import fileUpload from "express-fileupload";
import {v2 as cloudinary} from "cloudinary"; //bunu 2.versiyonunu import ettik
import methodOverride from "method-override";


dotenv.config(); // Artık ulaşabiliyorum env dosyasınaa :D

cloudinary.config({
    cloud_name : process.env.CLOUD_NAME,
    api_key : process.env.CLOUD_API_KEY,
    api_secret : process.env.CLOUD_API_SECRET,
})

// Database Connection
conn(); 

const app = express();
const port = process.env.PORT;

//EJS TEMPLATE ENGINE 
app.set("view engine", "ejs"); //render yardımı

// STATIC FILES MIDDLEWARES
// Geliştirilen web sayfalarında CSS, JavaScript ve Resim gibi birden fazla dosya bulunabilir. //Ancak Node.js ile her dosya isteğine ayrı cevap vermek kodların uzamasına ve kod tekrarına neden olur. //Express içerisinde sabit dosyaların yolunu tanımlamak için static metodu kullanılır.
app.use(express.static("public")); 
app.use(cookieParser());
app.use(express.json()); // Bu demekki artık bizim gönderdiğimiz post değerleri, artık req.bodynin içinde yer alıcak. Bunu yapmayınca postmanden istek gönderdiğimiz zaman hata veriyor. req.body boş geliyor.
app.use(express.urlencoded({extended : true})) // Formbodylerinin içerisindeki verileri parse edebilmesi için bunu yazdııık.
app.use(fileUpload({useTempFiles : true})); // cloudinarye dosya yolladığımız zaman, geçiçi bir dosya oluşturucaz.
app.use(methodOverride("_method",{ // ?  ???? 
    methods : ["POST", "GET"]
}))

// Routes //app.use=get,post 
app.use ("*",checkUser) //! * demek tüm sayfalarda her şeyde bunu kontrol edeceksin demek.
app.use("/", pageRoute); // middleware -  "/" olunca pageRoutea geç - sonra pageroute da zaten duruma göre controllerlardaki fonksiyonlara yönlendiriyor.
app.use("/photos", photoRoute);
app.use("/users", userRoute);
 // cookie parserı fonksiyon olarak çalıştırdık // ilk yaptığımız hamle bu cokomelli değil ezber



// app.get("/", (req,res) => { //localhost3000
//     res.render("index"); // views sayfasındaki index.html i ejs uzantısına cevirdik. get isteği atılınca direkt index htmli veriyoruz.
// })
// app.get("/about", (req,res) => { //localhost3000/about
//     res.render("about"); 
// })

app.listen(port, () => {
    console.log(`application running on ${port}`);
})


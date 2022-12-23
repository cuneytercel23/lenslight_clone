import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Photo from "../models/photoModel.js";

//* The req.params property is an object containing properties mapped to the named route “parameters”. For example, if you have the route /student/:id, then the “id” property is available as req.params.id. This object defaults to {}.
//* req.params.id = özel seçtiğin kullanıcı(idsi), örneğin cüneytle giriş yaptın , gizeme baktın
//* res.locals.user._id = login olan kullanıcı(idsi) cookiden alınan


const createUser = async (req,res) => {

    try { // Try kısmı genelde awaitli kısımda oluyor.**
     
            const user = await User.create(req.body); // Normalde kullanıcı bir form dolduruyor resim veya adı, yorumu varsa vs. - bizde o formun bodysinden gelecek verileri çekmek için req.body yazdık. ama şimdilik frontend yok diye o mevzuda yok :d
            //* res.status(201).json({ // 201 yeni bir şey oluşturduk demek. - Daha sonra başarılı yazısı ve photo verisini gönderiyoruz.
            // *    succeded : true,
            //  *   user,
            //? html kodlarında zaten gönderdiğimiz için burda commente aldım - res.redirect("/login"); // sen kayıp yapar yapmaz, beni login sayfasına at yukarda istediğim gibi json verisini görmeme gerek yok.
            res.status(201).json({user: user._id});
    
            
        } catch (error){
            //* HATA BU, DAHA İYİ ANLAMAK İÇİN YAPIŞTIRDIM. {"succeded":false,"error":{"errors":{"username":{"name":"ValidatorError","message":"Path `username` is required.","properties":{"message":"Path `username` is required.","type":"required","path":"username","value":""},"kind":"required","path":"username","value":""},"email":{"name":"ValidatorError","message":"Path `email` is required.","properties":{"message":"Path `email` is required.","type":"required","path":"email","value":""},"kind":"required","path":"email","value":""},"password":{"name":"ValidatorError","message":"Path `password` is required.","properties":{"message":"Path `password` is required.","type":"required","path":"password","value":""},"kind":"required","path":"password","value":""}},"_message":"User validation failed","name":"ValidationError","message":"User validation failed: username: Path `username` is required., email: Path `email` is required., password: Path `password` is required."}}

             if (error.code === 11000) {
                errors2.email = "E-mail is already registered."
             }


            let errors2 = {};

            if (error.name === "ValidationError") {
                Object.keys(error.errors).forEach((key) => { //keyi error içindeki errors olarak gezdiriyorum.
                    errors2[key] = error.errors[key].message   // erorun içindeki errors kısmında olan mesajları yazdır diyoruz yani bize username girmedin, pass girmedin, email girmedin diyor.
                });

            }

l
        res.status(500).json({
            succeded : false,
            error,
            
        });
    }
    };

//! KULLANICIYI LOGİN ETME - sonradan cookie falan girdi devreye
// ! 1- Formdan gelen unique veriyi alıcam
// ! 2- Usernameden faydalanarak, databaseden ilgili kullanıcıyı bulucam.
// ! 3- Formdan gelen şifreyle databasedeki kullanıcının şifresini karşılaştırıcam ama databasedeki şifre hashli !
// ! 4- bcrypt compare fonksiyonuna bakarak iki şifreyi karşılaştırıyorum.

    const loginUser = async (req,res) => {

        try { // Try kısmı genelde awaitli kısımda oluyor.**
            const {username, password} = req.body; //? 1 
            const user = await User.findOne ({username}); // ? 2 - Veritabanından kullanıcımız geldii -  findbyId demedik, bizim çünkü usernamemiz unique, ve onun içinde findOne kullanılıyor. username(üstte değişken atadığımız) : username(veritabanındaki) ama aynı isim diye kullanmıyoruz bu arada. 
            
            let same = false
            
            if (user) { // eğer databaseden çektiğimiz kullanıcı varsa
                same = await bcrypt.compare(password, user.password); // İlk password formdan gelen, diğeri dbden. compare ediyoruz eşleşiyorsa true, eşleşmezse false döndürüyor.

            }else { // eğer kullanıcı yoksa
              return res.status(401).json( { //! Return yazdık çünkü, eğer kullanıcı yoksa alltaki iflere devam etmemesi için.
                    succeded : false,
                    error : "There is no such an user"
                });

            }

            if (same) { // eğer same eşleşiyorsa true değeri döner ve eğer true değeri dönüyorsa ..

                const token = createToken(user._id); //! Eğer password eşleşirse, createToken fonksiyonunu çalıştır ve içine dbdeki _id diye adlandırılan parametreyi koy.
                res.cookie("jwt",token, { //? COOOKİE --  Jwt(cookie ismi) ismini biz verdik, ikincisi oluşturduğumuz tokeni yerleştirdik, diğerleri opsiyonel. Böylece tokenımızı cookiye kaydetmiş olduk.
                    httpOnly : true, // html erişimleri (boş)
                    maxAge : 1000* 60 * 60 * 24 // 24 saat
                })
                res.redirect("/users/dashboard"); // beni dashboard sayfasına gönder.

            } else {
                res.status(401).json( { // eğer same eşleşmiyorsa yani false ise ..
                    succeded : false,
                    error : "Passwords are not matched! "
                })
            }
            
            } catch (error){
            res.status(500).json({
                succeded : false,
                error : "token create err"
                
            });
        
        };
        };

            //! JWT İLE TOKEN OLUŞTURMAAAAAAAAAAAAAAAAAAAAAA
            //* jwt.sign() içine ilk yazdığımız payload(body), ikinci yazdığımız kendi isteğimize göre bir secretkey , 3. sü opsiyonel biz oraya tokenın sona erme tarihini yazdık.
            // ? Şimdi createToken içine verdiğimiz userIdyi, login kısmında eğer paswordlar eşleşirse oradaki veritabanındaki id yi, userId nin içine koyarak çalıştırıyoruz ve bize bir token oluşuyor.

        const createToken = (userId) => { // ! parantezin için tokena vermek istediğimiz parametreleri veriyoruz. userId ismini biz verdik , payload kısmında tokenı jwtio da okuttuğumuz zaman sadece userId ve oluşturulduğu zaman gibi şeyler  oluyor.
            return jwt.sign({userId}, process.env.JWT_SECRET, {
                expiresIn : "2d"
            })

        }


        const getDashboardPage = async (req,res) => {
            const photos = await Photo.find({user: res.locals.user._id}) //! Kardeş git, bana dbde, photomodel de , "user :" kısmı o an giriş yapan kullanıcının adresine eşit olanı(res.locals.user._id (cookie'den aldığımız)) getir. 
            const user = await User.findById({_id: res.locals.user._id }).populate(["followers", "followings"]) //! Populate, normalde userı json olarak bana döndürecek ya postman, orda follower followingsler id olarak gözüküyor normalde liste halinde, populate yapınca onları da görebiliyoruz. örneğin o asdasdsaasd id li kişinin adı ve diğer bilgileri gibi ;)
             res.render("dashboard", {
             link : "dashboard", // linke tıklayınca dashboard ışıklı yansın istiyoruz diye f.e de link neyse o yansın diye kod yazdık.
             photos, // render metodu ile ejs gönderdik
             user // Template engine gönderdik, populate yaptık diye aslında followers ve followingse de ulaşabiliyoruz.

         });
        }

        // Veritabanına istek atıp kaydettiğimiz tüm verileri çekmece 
const getAllUsers = async (req,res) => {
    try {
        //console.log("Res.locals.user =", res.locals.user);
        const users = await User.find({_id: {$ne : res.locals.user._id }}); // GetAllUser yaparken kullanıcılar arasında kendimizi görmek istemiyoruz o yüzden, ne = notequal  o anki giren kullanıcıya demek istedik.
        res.status(200).render("users",{     //! Render olayı ile templateenginede selam çakıyoruz.
            users,
            link : "users"
        });
    } catch (error) {
        res.status(500).json({
            succeded : false,
            error
        })
        
    }
}


const getAUser = async (req,res) => {
    try {
        
        const user = await User.findById({_id: req.params.id})//! req istek , params = urldeki /photos dan sonra gelen parametre olarak vericez. örneğin localhost3k/photos/saddassadasdas213123 (herhangi bir fotonun idsi)
        const inFollowers = user.followers.some((follower) => { //? localdaki userid(res.locals.user._id), özel olarak seçilen kullanınıcın follower kısmında varsa true değeri döndürüyor bize jsnin some fonksiyonu. bizde burdan aldığımız true değerine göre, butonumuzu follow unfollow diye değiştiricem. 

            return follower.equals(res.locals.user._id)

        });

        const photos = await Photo.find({user : user._id}) // fotoğrafın(dbdeki) user alanındaki idsi , localdaki user_id ile eşit olan  fotoları tut çek. 
        res.status(200).render("user", {
            user,
            photos, // gönder fotoları.
            link : "users", // Frontend de users kısmına basılınca o kısımın işaretlenmiş gözükmesi için.
            inFollowers, // Bunları ejs dosyalarında kullanabilmek için yazıyos.
        })
    } catch (error) {
        res.status(500).json({
            succeded : false,
            error
        })
        
    }
}

const  follow = async (req,res) => {
    try {
    let user = await User.findByIdAndUpdate( 
        { _id: req.params.id },
        { $push : {followers : res.locals.user._id} },
        { new : true}
        
    )

    user = await User.findByIdAndUpdate( 
        { _id: res.locals.user._id },
        { $push : {followings : req.params.id} },
        { new : true} 
    )

    res.status(200).json({
        succeded : true,
        user
    })


    } catch (error) {
        res.status(500).redirect(`/users/${req.params.id}`)
        
    }
}

const  unfollow = async (req,res) => {
    try {
    let user = await User.findByIdAndUpdate( 
        { _id: req.params.id },
        { $pull : {followers : res.locals.user._id} },
        { new : true}
        
    )

    user = await User.findByIdAndUpdate( 
        { _id: res.locals.user._id },
        { $pull  : {followings : req.params.id} },
        { new : true} 
    )

    res.status(200).json({
        succeded : true,
        user
    })


    } catch (error) {
        res.status(500).json({
            succeded : false,
            error
        })
        
    }
}

    export {createUser, loginUser, getDashboardPage, getAllUsers, getAUser,follow, unfollow};
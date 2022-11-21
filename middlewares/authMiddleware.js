import jwt from "jsonwebtoken"
import User from "../models/userModel.js";

//* Eski Usul- Tryın içini böyle yapmıştık. cookie devreye girince değiştirmek zorunda kaldık.
// if (!token) { // eğer token yoksa hata ver 
    //      return  res.status(401).json({
    //         succeded: false,
    //         error : "No token available"
    //     });
    // }

    // // eğer vars token
    // // ! req.monkey yaptım
    // req.monkey = await User.findById( //! requestteki monkeyi(isimi kendimiz verdik), veritabanından gelecek olan ve userIdsi(token create ederken bu adı veriyoruz.) tokenda bulunan kullanıcıya(maymuna) eşitle demek istiyorum. 
    // jwt.verify(token, process.env.JWT_SECRET).userId); //! userId parametresini tokeni oluştururken biz vermiştik.
    // next(); // middleware tm


const checkUser = async (req,res,next) => {
    const token = req.cookies.jwt; 
    if (token) {
        jwt.verify(token, process.env.JWT_SECRET,  async(err, decodedToken) => {  //! Kendimce özet- eğer cookiede token varsa, bunu önce al ve secretkeyiyle birlikte bir verify et , hata yoksa çözülmüş tokenının payloadundaki idsine bakarak veritabanındaki kullanıcının idsi ile eşitle ve son olarak da bunu res.locals.user diye tanımla.
            if (err) { // Hata varsa 
                console.log(err.message);
                res.locals.user = null // herhangi bir şekilde kullanıcı girişi olmadı 
                next();
            }else { // eğer varsa token 
                // Decoded token = jwt içindeki payload kısımı =console.log("decoded : ", decodedToken);
                const user2 = await User.findById(decodedToken.userId) //! userı, veritabanından gelecek olan kullanıcı ile token içindeki(payload kısmında) userId'si aynı olanları eşitle ve user2 değişkenine koy.
                res.locals.user = user2  //! EN ÖNEMLİ PART DENİLEBİLİR.- veritabanından gelen eşleşmiş user2 değişkenimizi , localdeki usera(sol) atmış oluyoruz. Local dediğimiz de kullanıcının kendisine özel demek istiyorum.
                next();
            }

        })
    } else {
        res.locals.user = null // herhangi bir şekilde kullanıcı girişi olmadı 
                next();

    }
}


const authenticateToken = async (req,res,next) => {

    try {
        const token = req.cookies.jwt;  //! Tokenı cookiedeki jwt(biz verdik ismi) ismini koyduğumuz yerden çektik.
        
         if (token) {

            jwt.verify(token, process.env.JWT_SECRET, (err) => { // cookieden geleni doğruluyoruz.
                if (err) { // Hata varsa mesaj yazdır ve login sayfasına tekrardan git.
                    console.log(err.message);
                    res.redirect("/login");

                }else {
                    next();
                }

            })
            
         }else {
            res.redirect("/login");
         }
} catch (error) {
    console.log(error);
   return res.status(401).json({ 
        succeded : false,
        error: "no authenticate"
        
    });
    
    
}
}
export { authenticateToken, checkUser };
import Photo from "../models/photoModel.js"; //js unutma
import {v2 as cloudinary} from "cloudinary"; //bunu 2.versiyonunu import ettik
import fs from "fs"; //* Bunu indirmedik bu nodejsin. 

//! ASYNC-AWAIT LAZIMSSSSSS !!!!!!!!!!1
//? Bunu yaptığımız zaman photo datası postmanda boş geldi, bunun da sebebi create olurken zaman kaybedilmesiydi. Bundan ötürü biz, async await kullanıcaz, hata yakalamak içinde try-catch
// const createPhoto = (req,res) => {
//     const photo = Photo.create(req.body); // Normalde kullanıcı bir form dolduruyor resim veya adı, yorumu varsa vs. - bizde o formun bodysinden gelecek verileri çekmek için req.body yazdık. ama şimdilik frontend yok diye o mevzuda yok :d
//     res.status(201).json({
//         succeded : true,
//         photo, 
//     }); // 201 yeni bir şey oluşturduk demek. - Daha sonra başarılı yazısı ve photo verisini gönderiyoruz.
// };
//? ----------------------------------------------------------------

const createPhoto = async (req,res) => {

try { // Try kısmı genelde awaitli kısımda oluyor.**

    //*Cloudinary Yükleme İşlemi
    const result = await cloudinary.uploader.upload(
        req.files.image.tempFilePath, // oluşturduğum görselin geçiçi  pathini oluştur (tmp diye bir dosya içine)
        {use_filename : true, // cloudinary özelliğimiş.
         folder: "lenslight_latest" } //cloudinary browserında kaydedceğimiz dosyanın adı.
    )


    //! Oluşturduk şemamızı şimdi, photo veya kullanıcı oluşturma için burası var.
        await Photo.create({
            name : req.body.name,
            description : req.body.description,
            user : res.locals.user._id, //! Middleware kısımında oluşturduğumuz localuser olayını burada kullanıyoruz. yani localden yeni fotoğraf paylaşınca, obje kısmında user diye yeni bir şey oluşuyor ve o ObjectId ile, userın object id si eşitleniyor. Sonuç olarak o fotoğrafın sahibinin belli olduğu anlaşılıyor.
            url : result.secure_url, //* Cloudinarye resim yüklemek için verdiğimiz resultdan secure_url diye bişi dönüyor ve biz onu tutmak istiyoruz(çünkü, foto sadece cloudinarye yükleniyor secureurl kullanarak fotoyu, lenslight içinde de göstericez.).
            image_id : result.public_id, //? Cloudinaryden resim silmek için resulttan dönen public_idyi modelde oluşturduğumuz image_url ye atıyoruz.
        }); // Normalde kullanıcı bir form dolduruyor resim veya adı, yorumu varsa vs. - bizde o formun bodysinden gelecek verileri çekmek için req.body yazdık. ama şimdilik frontend yok diye o mevzuda yok :d
        res.status(201).redirect("/users/dashboard");

        //* Yükleme işlemi bittikten sonra tmp dosyası şişmesin diye sil.
        fs.unlinkSync(req.files.image.tempFilePath) // geçiçi(tmp) klasördeki geçiçi dosyaları sil

    } catch (error){
    res.status(500).json({
        succeded : false,
        error
    });

};
};

// Veritabanına istek atıp kaydettiğimiz tüm verileri çekmece 
const getAllPhotos = async (req,res) => {
    try {
        const photos = res.locals.user ? //eğer localde bi user varsa .. 
        await Photo.find({user: {$ne : res.locals.user._id }}) 
        : await Photo.find({})  //İf olayı var local kullanıcı varsa, photosda kendi fotolarımı gösterme, yoksa herkesin fotosunu göster.
        res.status(200).render("photos",{     //! Render olayı ile templateenginede selam çakıyoruz.
            photos,
            link : "photos" // yukarıdaki menüde photos  ı
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            succeded : false,
            error : error
        })
        
    }
}

const getAPhoto = async (req,res) => {
    try {
        const photo = await Photo.findById({_id: req.params.id}).populate("user") //! req istek , params = urldeki /photos dan sonra gelen parametreyi almamızı sağlıyo ve onu bulmamızı istiyor. // populate olayı ön kısımda gözükmedi diye yaptık cokomelli değil. ama user ve fotoğraf arasında ilişki olduğu için yazdık.

        let isOwner = false

        if (res.locals.user) { // Eğer local bir kullanıcı varsa..
           isOwner = photo.user.equals(res.locals.user._id)  //* Ve yukarda oluşturduğumuz kullanıcı ile, localdaki adamın idsi eşitse isOwneri trueya ceviriyoruz. Front end ilede, sahip olmadığımız fotolar için update, deletei göstermeyeceğiz bu true false değerine göre.
        }


        res.status(200).render("photo", {
            photo,
            link : "photo", // Frontend de photos kısmına basılınca o kısımın işaretlenmiş gözükmesi için.
            isOwner
        })




    } catch (error) {
        res.status(500).json({
            succeded : false,
            error
        })
        
    }
}

const deleteAPhoto = async (req,res) => {
    try {
        const photo = await Photo.findById(req.params.id) // req.params.id ile /photos/örnekphotoid 'si seçilmiş olan fotoğrafı alıyoruz.
        
        const photoId = photo.image_id //! Fotoğrafı üstte(const photo kısmında) aldık, cloudinaryden silmek içinde, public_idsini almamız gerekiyordu onuda image_id ye koymuştuk create ederken ve burdan aldık idyi.

        await cloudinary.uploader.destroy(photoId) // Cloudinaryden sildik fotoğrafı.
        await Photo.findOneAndRemove({_id: req.params.id}) //? Databaseden sildik - Fakat buraya yukarda oluşturduğumuz fotoyu koysak olmaz mıydı ??

        res.status(200).redirect("/users/dashboard")

    } catch (error) {
        res.status(500).json({
            succeded : false,
            error
        })
        
    }
}

const updateAPhoto = async (req,res) => {
    try {
        const photo = await Photo.findById(req.params.id) // req.params.id ile /photos/örnekphotoid 'si seçilmiş olan fotoğrafı alıyoruz.
        
        if (req.files) { //? eğer bi dosya gönderimi varsa, yani update ederken foto seçiliyorsa demek (ama files ne alaka anlamadım pek.)
            //* Eskisini sildik
            const photoId = photo.image_id //! Fotoğrafı üstte(const photo kısmında) aldık, cloudinaryden güncellemek içinde, public_idsini almamız gerekiyordu onuda image_id ye koymuştuk create ederken ve burdan aldık idyi.
            await cloudinary.uploader.destroy(photoId) // Cloudinaryden sildik fotoğrafı.   

            //* yenisini ekledik.
            const result = await cloudinary.uploader.upload(
                req.files.image.tempFilePath, // oluşturduğum görselin geçiçi  pathini oluştur (tmp diye bir dosya içine)
                {use_filename : true, // cloudinary özelliğimiş.
                 folder: "lenslight_latest" } //cloudinary browserında kaydedceğimiz dosyanın adı.
            );
                //* url ve imageid güncelleme, eskisi kalmasın diye.
                photo.url = result.secure_url
                photo.image_id = result.public_id
                fs.unlinkSync(req.files.image.tempFilePath) // geçiçi(tmp) klasördeki geçiçi dosyaları sil

        } // if koşulunun dışına cıkıyoruz şimdi 

        //* eğer dosya da yoksa sadece isim ve descrp güncellemesi
        photo.name = req.body.name,
        photo.description = req.body.description

        photo.save() // kaydettiiik.

        res.status(200).redirect(`/photos/${req.params.id}`);

        

    } catch (error) {
        res.status(500).json({
            succeded : false,
            error
        })
        
    }
}

export { createPhoto, getAllPhotos,getAPhoto,deleteAPhoto,updateAPhoto};
import mongoose from "mongoose";

const {Schema} = mongoose; // Sen artık Mongoose ile oluşmuş bi şema gibi bişisin diyoruz :D

const photoSchema = new Schema( {
    

    name : {
        type: String,
        required : true,
        trim : true // başta sondaki boşlukları kesmece
},
    description : {
        type: String,
        required : true,
        trim : true
    },
    uploadedAt : {
         type : Date,
         default: Date.now,

    },
    user : { //! UserModel ile eşleştirdik.
        type : Schema.Types.ObjectId,
        ref : "User"
    },
    url : { //! Bunu cloudinaryde görsel yüklenince secureurl diye bir şey geliyor ve bizde onu kayıt etmek için modele ekledik, bundan sonra createPhotya ekliyecez.
        type : String,
        required : true
    },
    image_id : { 
        type : String
    },

});

const Photo = mongoose.model("Photo", photoSchema); // ilk model adı, ikincisi hangi schemadan oluşturduğumuz.

export default Photo;
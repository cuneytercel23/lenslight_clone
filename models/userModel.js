import mongoose, { SchemaType } from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const {Schema} = mongoose; // Sen artık Mongoose ile oluşmuş bi şema gibi bişisin diyoruz :D

const userSchema = new Schema( {


    username : {
        type: String,
        required : [true, "Username field is required "],
        lowercase : true,
        validate: [validator.isAlphanumeric, "Only Alphannumeric characters is valid "] // rakam ve sayılardan oluşması lazım.
},
    email : {
        type: String,
        required : [true, "E-mail field is required "],
        unique : true,
        validate: [validator.isEmail, "Valid e-mail is required"],
    },
    password : {
         type : String,
         required : [true, "Password field is required "],
         minLength : [4, "At least 4 characters for password !"]


    },
    followers : [ // 
        {
            type: Schema.Types.ObjectId,
            ref : "User"
        }
    ],
    followings : [ // 
        {
            type: Schema.Types.ObjectId,
            ref : "User"
        }
    ]
}, {
    timestamps : true // Kullanıcının upload ve kayıt tarihi için uploadAt değilde bunu kullanuyoruz.
});

//? Pre Hooks - Save yapılmadan hemen önce, bcrypt kullanarak passwordümüzü hashledik.

userSchema.pre("save",  function(next) {
    const user = this; // user
    bcrypt.hash(user.password,10, (err,hash) => {
        user.password = hash;
        next();
         
    })
})

const User = mongoose.model("User", userSchema); //! en başta yaptığım User diye tanımladığım şeyi database kücük harflerle sonuna s ekleyerek alıyor. ilk model adı, ikincisi hangi schemadan oluşturduğumuz.

export default User;
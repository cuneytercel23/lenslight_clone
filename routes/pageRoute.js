import  express  from "express";
//import * as pageController from "../controllers/pageController.js"; // getIndexPage ve getAboutPage çekebilmek için *as kullandık bide .js i unutmamak lazım ecmascript için.
import  {getIndexPage, getAboutPage, getRegisterPage, getLoginPage, getLogout, getContactPage, sendMail} from  "../controllers/pageController.js";


const router = express.Router(); // sen artık yönlendiricisin artık kardeş.

router.route("/").get(getIndexPage); //  "/" tıklanırsa, pagecontrollerdaki,getIndexPagei çalıştır.
router.route("/about").get(getAboutPage); 
router.route("/register").get(getRegisterPage)
router.route("/login").get(getLoginPage);
router.route("/logout").get(getLogout);
router.route("/contact").get(getContactPage);
router.route("/contact").post(sendMail); 


export default router;

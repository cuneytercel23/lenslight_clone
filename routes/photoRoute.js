import express from "express";
import * as photoController from "../controllers/photoController.js" // 2 çeşit yazımı vardı burayı farklı pageRouteu farklı yazdım.

const router = express.Router();

//? İki routerde da "/" ye gittiği için, zincir halinde yazabiliyoruz ama öyle tercih etmedim.
//! Bu şekilde => router.route("/").post(photoController.createPhoto)..get(photoController.getAllPhotos);

router.route("/").post(photoController.createPhoto); 
router.route("/").get(photoController.getAllPhotos);
router.route("/:id").get(photoController.getAPhoto); // /photos dan sonra yazdığımız fonksiyon ile (getAphoto), oraya /id veriyoruz ve ona göre tekil sayfaya geçmek istiyoruz.
router.route("/:id").delete(photoController.deleteAPhoto); 
router.route("/:id").put(photoController.updateAPhoto);

export default router;
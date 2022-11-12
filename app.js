import express from "express";

const app = express();
const port = 3000;



app.listen(port, () => {
    console.log(`application running on ${port} `);
})

app.get("/", (req,res) => { // normalde app listen yapınca boş bir hatalı sayfa geliyor. Bu komutla bizde anasayafaya index sayfası diye yazı gönderdik.
    res.send("Index sayfası");
})
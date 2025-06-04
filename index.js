const path = require("path");
const express = require("express");
const multer = require("multer");
const app = express();
const port = 8000;
// const upload = multer({ dest: './uploads' })

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)); // This line was changed
}
}) ;
const upload = multer({ storage: storage })
app.set("view engine","ejs");
app.set("views",path.resolve("./views"));

app.use(express.urlencoded({extended : false })); //parse form data

app.get("/", (req,res) => {
    return res.render("homepage");
});
app.post('/upload',upload.single('profileImage'),(req,res) => {
     console.log(req.body);
     console.log(req.file);
     return res.redirect("/");
     
});



app.listen(port ,() => console.log(`Server started on port ${port}`));
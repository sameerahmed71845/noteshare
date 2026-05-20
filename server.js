const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const path = require("path");

const Note = require("./models/note");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= FRONTEND =================

app.use(express.static(path.join(__dirname,"frontend")));

app.get("/",(req,res)=>{

res.sendFile(
path.join(__dirname,"frontend","index.html")

);

});

// ================= CLOUDINARY =================

cloudinary.config({

cloud_name:"ds7gxnp5p",

api_key:"455578232828944",

api_secret:"aOGQPAuBMcN5NT-rCCOIyC4s0ic"

});

// ================= CLOUD STORAGE =================

const storage = new CloudinaryStorage({

cloudinary,

params:{

folder:"notes",

resource_type:"raw"

}

});

const upload = multer({

storage

});

// ================= MONGODB =================

mongoose.connect(

"mongodb://admin:sameer71845@ac-zjvhrzl-shard-00-00.szbepmy.mongodb.net:27017,ac-zjvhrzl-shard-00-01.szbepmy.mongodb.net:27017,ac-zjvhrzl-shard-00-02.szbepmy.mongodb.net:27017/?ssl=true&replicaSet=atlas-zhiir5-shard-0&authSource=admin&appName=noteshares"

)

.then(()=>{

console.log("MongoDB Connected ✅");

})

.catch((err)=>{

console.log("DB ERROR ❌",err);

});

// ================= GET NOTES =================

app.get("/notes",async(req,res)=>{

try{

const notes = await Note.find();

res.json(notes);

}

catch(err){

res.status(500).json(err);

}

});

// ================= UPLOAD NOTE =================

app.post(

"/upload-note",

upload.single("pdf"),

async(req,res)=>{

try{

console.log(req.body);

console.log(req.file);

if(!req.file){

return res.status(400).json({

message:"No PDF Uploaded"

});

}

const {title,subject}=req.body;

const newNote = new Note({

title,

subject,

pdfUrl:req.file.path,

fileName:req.file.originalname

});

await newNote.save();

res.json({

message:"Uploaded Successfully ✅"

});

}

catch(err){

console.log(err);

res.status(500).json({

error:err.message

});

}

}

);

// ================= DELETE NOTE =================

app.delete(

"/delete-note/:id",

async(req,res)=>{

try{

await Note.findByIdAndDelete(

req.params.id

);

res.json({

message:"Deleted ✅"

});

}

catch(err){

res.status(500).json(err);

}

}

);

// ================= DOWNLOAD COUNT =================

app.post(

"/download/:id",

async(req,res)=>{

await Note.findByIdAndUpdate(

req.params.id,

{

$inc:{

downloads:1

}

}

);

res.send("Updated");

}

);

// ================= TRENDING =================

app.get(

"/trending",

async(req,res)=>{

const notes=

await Note.find()

.sort({

downloads:-1

})

.limit(5);

res.json(notes);

}

);

// ================= SERVER =================

const PORT=

process.env.PORT||

3000;

app.listen(PORT,()=>{

console.log(

`Server running on port ${PORT} 🚀`

);

});
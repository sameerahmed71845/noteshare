const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

const Note = require("./models/note");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= CLOUDINARY CONFIG =================
cloudinary.config({
  cloud_name: "ds7gxnp5p",
  api_key: "455578232828944",
  api_secret: "aOGQPAuBMcN5NT-rCCOIyC4s0ic"
});

// ================= STORAGE =================
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "notes",
    resource_type: "raw" // for PDF
  }
});

const upload = multer({ storage });

// ================= MONGODB =================
mongoose.connect("mongodb://admin:sameer71845@ac-zjvhrzl-shard-00-00.szbepmy.mongodb.net:27017,ac-zjvhrzl-shard-00-01.szbepmy.mongodb.net:27017,ac-zjvhrzl-shard-00-02.szbepmy.mongodb.net:27017/?ssl=true&replicaSet=atlas-zhiir5-shard-0&authSource=admin&appName=noteshare")
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("DB ERROR ❌", err));
// ================= ROUTES =================

// GET NOTES
app.get("/notes", async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
});

// UPLOAD NOTE
app.post("/upload-note", upload.single("pdf"), async (req, res) => {
  try {
    const { title, subject } = req.body;

    const newNote = new Note({
      title,
      subject,
      pdfUrl: req.file.path,
      fileName: req.file.originalname   // 👈 ADD THIS
    });

    await newNote.save();

    res.json({ message: "Uploaded ✅" });

  } catch (err) {
    res.status(500).json(err);
  }
});

// DELETE NOTE
app.delete("/delete-note/:id", async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted ✅" });
});

app.post("/download/:id", async (req, res) => {
  await Note.findByIdAndUpdate(req.params.id, {
    $inc: { downloads: 1 }
  });
  res.send("Updated");
});

app.get("/trending", async (req, res) => {
  const notes = await Note.find().sort({ downloads: -1 }).limit(5);
  res.json(notes);
});


// ================= SERVER =================
app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});
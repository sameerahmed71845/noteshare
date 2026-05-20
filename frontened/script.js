const API = "http://localhost:3000";


// ================= UPLOAD =================
async function upload() {
  const title = document.getElementById("title").value;
  const subject = document.getElementById("subject").value;
  const file = document.getElementById("pdf").files[0];

  if (!file) {
    alert("Please select a file ❌");
    return;
  }

  const formData = new FormData();
  formData.append("title", title);
  formData.append("subject", subject);
  formData.append("pdf", file);

  try {
    await fetch(API + "/upload-note", {
      method: "POST",
      body: formData
    });

    alert("Uploaded successfully 🚀");

    // clear inputs
    document.getElementById("title").value = "";
    document.getElementById("subject").value = "";
    document.getElementById("pdf").value = "";

  } catch (err) {
    console.log(err);
    alert("Upload failed ❌");
  }
}


// ================= GET NOTES =================
async function getNotes() {
  try {
    const res = await fetch(API + "/notes");
    const data = await res.json();

    const container = document.getElementById("notes");
    container.innerHTML = "";

    data.forEach(note => {
      const div = document.createElement("div");
      div.className = "note";

      div.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.subject}</p>

        <a href="${note.pdfUrl}" download="${note.fileName}" target="_blank">
          📄 Download
        </a>

        <br><br>

        <button onclick="deleteNote('${note._id}')">
          ❌ Delete
        </button>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    console.log(err);
  }
}


// ================= DELETE =================
async function deleteNote(id) {
  try {
    await fetch(API + "/delete-note/" + id, {
      method: "DELETE"
    });

    getNotes(); // refresh

  } catch (err) {
    console.log(err);
  }
}


// ================= AUTO LOAD =================
if (window.location.pathname.includes("notes.html")) {
  getNotes();
}
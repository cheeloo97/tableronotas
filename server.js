const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 443;

app.use(express.json());
app.use(express.static("."));

const NOTES_FILE = "notes.json";

function readNotes() {
  try {
    if (fs.existsSync(NOTES_FILE)) {
      const data = fs.readFileSync(NOTES_FILE, "utf8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error leyendo notas:", error);
  }
  return [];
}

function saveNotes(notes) {
  try {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
    return true;
  } catch (error) {
    console.error("Error guardando notas:", error);
    return false;
  }
}

app.get("/api/notes", (req, res) => {
  const notes = readNotes();
  res.json(notes);
});

app.post("/api/notes", (req, res) => {
  const notes = req.body;
  if (saveNotes(notes)) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Error guardando notas" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// NUEVA RUTA TV MEJORADA - SIN JAVASCRIPT
app.get("/tv", (req, res) => {
  const notes = readNotes();
  
  let notesHTML = '';
  
  if (notes.length === 0) {
    notesHTML = '<div class="no-notes">No hay notas disponibles</div>';
  } else {
    notesHTML = notes.map(note => `
      <div class="note" style="
        background: ${note.backgroundColor || '#2d3748'};
        border-left-color: ${note.borderColor || '#4299e1'};
      ">
        <div class="note-content" style="
          color: ${note.textColor || 'white'};
          font-size: ${note.fontSize || '1.4rem'};
          font-weight: ${note.fontWeight || 'normal'};
          text-decoration: ${note.textDecoration || 'none'};
        ">
          ${escapeHtml(note.content)}
        </div>
        <div class="note-time" style="color: ${note.textColor || '#cbd5e0'}">
          ${note.timestamp || new Date().toLocaleString('es-ES')}
        </div>
      </div>
    `).join('');
  }
  
  const tvHTML = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tablero de Notas - TV</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: Arial, sans-serif;
        }
        
        body {
            background: #1a1a1a;
            color: white;
            padding: 20px;
            min-height: 100vh;
        }
        
        .header {
            background: #122247;
            color: white;
            padding: 25px;
            text-align: center;
            margin-bottom: 30px;
            border-radius: 15px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin: 0;
        }
        
        .notes-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 25px;
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .note {
            background: #2d3748;
            padding: 25px;
            border-radius: 20px;
            border-left: 10px solid #4299e1;
        }
        
        .note-content {
            font-size: 1.4rem;
            line-height: 1.5;
            margin-bottom: 15px;
            min-height: 80px;
            word-wrap: break-word;
        }
        
        .note-time {
            color: #cbd5e0;
            font-size: 1.1rem;
            text-align: right;
            border-top: 1px solid #4a5568;
            padding-top: 10px;
        }
        
        .no-notes {
            text-align: center;
            color: #a0aec0;
            font-size: 1.5rem;
            padding: 60px 20px;
            grid-column: 1 / -1;
        }
        
        .auto-refresh {
            text-align: center;
            color: #4299e1;
            margin: 15px 0;
            font-size: 1.1rem;
        }
        
        .last-update {
            text-align: center;
            color: #888;
            margin: 10px 0;
            font-size: 1rem;
        }
    </style>
    
    <!-- AUTO-REFRESH SIN JAVASCRIPT -->
    <meta http-equiv="refresh" content="10">
</head>
<body>
    <div class="header">
        <h1>📺 Tablero de Notas - TV</h1>
        <div class="auto-refresh">
            🔄 Actualizando automáticamente cada 10 segundos
        </div>
        <div class="last-update">
            Última actualización: ${new Date().toLocaleTimeString('es-ES')}
        </div>
    </div>
    
    <div class="notes-grid">
        ${notesHTML}
    </div>
</body>
</html>`;
  
  res.send(tvHTML);
});

// Función para escapar HTML
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚨 Servidor ejecutándose en http://localhost:${PORT}`);
  console.log(`📺 Versión TV (SIN JavaScript): http://localhost:${PORT}/tv`);
  console.log(`📱 Accesible desde: http://192.168.146.181:${PORT}/tv`);
});
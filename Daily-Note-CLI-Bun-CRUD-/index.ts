// Definisikan nama file di paling atas agar bisa diakses semua fungsi
const FILE_NAME = "notes.txt"
const newNote = "This is a new note.happy coding!\n";

//1 fungsi untuk menulis catatan ke dalam file
async function addNote(content: string) {
try {
    const file = Bun.file(FILE_NAME);
    
    // Ambil isi lama jika ada
    const existingContent = await file.exists() ? await file.text() : "";
    
    // Tambahkan catatan baru (dengan timestamp agar lebih keren)
    const timestamp = new Date()
      .toISOString()
      .replace("T", " ")
      .slice(0, 19);
    const formattedNote = `[${timestamp}] ${content}\n`;
    
    // Simpan kembali
    await Bun.write(FILE_NAME, existingContent + formattedNote);
    
    console.log("✅ Catatan berhasil disimpan!");
  } catch (error) {
    console.error("❌ Gagal menyimpan catatan:", error);
  }
}

// 2. Fungsi untuk membaca semua catatan
async function readNotes() {
const file = Bun.file(FILE_NAME);
  if (await file.exists()) {
    const content = await file.text();
    console.log("\n--- DAFTAR CATATAN ---");
    // Menampilkan nomor baris agar mudah untuk dihapus nanti
    const lines = content.trim().split("\n");
    lines.forEach((line, index) => {
      console.log(`${index + 1}. ${line}`);
    });
  } else {
    console.log("\n📭 Belum ada catatan tersimpan.");
  }
}

// 3. Fungsi untuk menghapus catatan berdasarkan nomor baris
async function deleteNote(lineNumber: number) {
  try {
    const file = Bun.file(FILE_NAME);
    if (!(await file.exists())) return;

    const content = await file.text();
    const lines = content.trim().split("\n");

    if (lineNumber > 0 && lineNumber <= lines.length) {
      const removed = lines.splice(lineNumber - 1, 1);
      // Simpan kembali sisa barisnya, jangan lupa tambahkan newline di akhir
      await Bun.write(FILE_NAME, lines.join("\n") + (lines.length > 0 ? "\n" : ""));
      console.log(`🗑️ Berhasil menghapus: ${removed}`);
    } else {
      console.log("❌ Nomor catatan tidak valid!");
    }
  } catch (error) {
    console.error("❌ Gagal menghapus catatan:", error);
  }
}

// 4. Fungsi untuk update catatan
async function updateNote(lineNumber: number, newContent: string) {
  try {
    const file = Bun.file(FILE_NAME);

    if (!(await file.exists())) {
      console.log("📭 Tidak ada catatan.");
      return;
    }

    const content = await file.text();
    const lines = content.trim().split("\n");

    if (lineNumber > 0 && lineNumber <= lines.length) {

      // Timestamp format baru (sesuai tugas)
      const timestamp = new Date()
        .toISOString()
        .replace("T", " ")
        .slice(0, 19);

      lines[lineNumber - 1] = `[${timestamp}] ${newContent}`;

      await Bun.write(
        FILE_NAME,
        lines.join("\n") + (lines.length > 0 ? "\n" : "")
      );

      console.log("✏️ Catatan berhasil diupdate!");
    } else {
      console.log("❌ Nomor tidak valid.");
    }

  } catch (error) {
    console.error("❌ Gagal update:", error);
  }
}

// 5. Fungsi search catatan
async function searchNotes(keyword: string) {
  const file = Bun.file(FILE_NAME);

  if (!(await file.exists())) {
    console.log("📭 Tidak ada catatan.");
    return;
  }

  const content = await file.text();
  const lines = content.trim().split("\n");

  const results = lines.filter(line =>
    line.toLowerCase().includes(keyword.toLowerCase())
  );

  if (results.length === 0) {
    console.log(`🔍 Tidak ditemukan kata: ${keyword}`);
    return;
  }

  console.log(`\n🔎 Hasil pencarian "${keyword}":`);
  results.forEach((line, i) => {
    console.log(`${i + 1}. ${line}`);
  });
}

// Ambil input dari terminal: bun run index.ts "isi catatan"
const command = Bun.argv[2] || "";
const value = Bun.argv[3] || "";

//DELETE
if (command === "delete") {
  if (value) {
    const indexToDelete = parseInt(value);
    if (!isNaN(indexToDelete)) {
      await deleteNote(indexToDelete);
    } else {
      console.log("❌ Error: Harap masukkan angka.");
    }
  } else {
    console.log("⚠️ Masukkan nomor baris. Contoh: bun run index.ts delete 1");
  }
} 

// TAMBAHKAN BAGIAN INI:
else if (command === "list" || command === "view") {
  await readNotes();
}

// UPDATE
else if (command === "update") {
  const number = parseInt(value);
  const newContent = Bun.argv.slice(4).join(" ");

  if (!isNaN(number) && newContent) {
    await updateNote(number, newContent);
    await readNotes();
  } else {
    console.log('⚠️ Contoh: bun run index.ts update 1 "isi baru"');
  }
}

//SEARCH
else if (command === "search") {
  const keyword = Bun.argv.slice(3).join(" ");

  if (keyword) {
    await searchNotes(keyword);
  } else {
    console.log("⚠️ Contoh: bun run index.ts search coding");
  }
}

// TAMBAH CATATAN (DEFAULT)
else if (command) {
  // Jika argumen bukan 'delete' atau 'list', maka dianggap menambah catatan
  await addNote(command);
  await readNotes(); // Tampilkan list setelah menambah
} 
// TIPS
else {
  console.log("💡 Tips:");
  console.log("   Lihat Semua : bun run index.ts list");
  console.log("   Tambah      : bun run index.ts \"isi catatan\"");
  console.log("   Hapus       : bun run index.ts delete [nomor]");
}
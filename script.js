// Fungsi untuk memformat dan memperbarui waktu & tanggal
function updateDateTime() {
    const now = new Date();

    // Setup Nama Hari dalam Bahasa Indonesia
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const dayName = days[now.getDay()];

    // Setup Format Tanggal (DD/MM/YYYY)
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Bulan dimulai dari 0
    const year = now.getFullYear();
    const dateString = `${dayName}, ${day}/${month}/${year}`;

    // Setup Format Jam (HH:MM:SS)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const timeString = `${hours}:${minutes}:${seconds}`;

    // Memasukkan nilai ke elemen HTML berdasarkan ID
    document.getElementById('current-date').textContent = dateString;
    document.getElementById('current-time').textContent = timeString;
}

// Jalankan fungsi updateDateTime setiap 1 detik (1000 milidetik)
setInterval(updateDateTime, 1000);

// Panggil sekali saat halaman pertama kali dimuat
updateDateTime();
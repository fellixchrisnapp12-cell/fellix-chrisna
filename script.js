// Fungsi untuk menghasilkan angka acak dalam rentang
function getRandomInRange(min, max, precision = 1) {
    const value = Math.random() * (max - min) + min;
    return value.toFixed(precision);
}

// Fungsi utama untuk memperbarui data dashboard
function updateData() {
    // Simulasi pembacaan sensor bawang merah
    const currentPH = getRandomInRange(6.0, 7.5);
    const currentMoisture = getRandomInRange(70, 95);
    const currentTemperature = getRandomInRange(24, 32);
    const panelVoltage = getRandomInRange(11.5, 14.5, 2);

    // Update elemen UI di Panel Utama
    document.getElementById('ph').innerText = currentPH;
    document.getElementById('kelembapan').innerText = currentMoisture;
    document.getElementById('tegangan').innerText = panelVoltage;

    // Logika Status Pompa
    const pompaStatus = document.getElementById('pompa-status');
    const totalWaktuOperasi = document.getElementById('waktu-operasi');

    if (currentMoisture < 75) {
        pompaStatus.innerText = "MENYIRAM...";
        pompaStatus.style.color = "#E8F5E9"; // Hijau muda (teks putih di kartu hitam)
        pompaStatus.classList.remove('pompa-off');
        pompaStatus.classList.add('pompa-active');
        // Simulasi penambahan waktu operasi
        totalWaktuOperasi.innerText = `${getRandomInRange(2, 5, 0)}m`;
    } else {
        pompaStatus.innerText = "MATI";
        pompaStatus.style.color = "#FFCDD2"; // Merah muda (teks putih di kartu hitam)
        pompaStatus.classList.remove('pompa-active');
        pompaStatus.classList.add('pompa-off');
    }

    // Update Waktu Terakhir Diperbarui
    const now = new Date();
    const formattedDateTime = now.toLocaleString('id-ID');
    document.getElementById('date-time-status').innerText = formattedDateTime;
}

// Jalankan update setiap 2 detik (2000ms)
setInterval(updateData, 2000);

// Panggil sekali saat pertama kali dimuat
updateData();
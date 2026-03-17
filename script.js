function updateData() {
    // Simulasi pembacaan sensor (Angka acak)
    const suhu = (25 + Math.random() * 10).toFixed(1);
    const ph = (6.0 + Math.random() * 1.5).toFixed(1);
    const kelembapan = Math.floor(60 + Math.random() * 30);
    const tegangan = (12 + Math.random() * 2).toFixed(2);
    const arus = (0.5 + Math.random() * 1.5).toFixed(2);

    // Update ke layar
    document.getElementById('suhu').innerText = suhu;
    document.getElementById('ph').innerText = ph;
    document.getElementById('kelembapan').innerText = kelembapan;
    document.getElementById('tegangan').innerText = tegangan;
    document.getElementById('arus').innerText = arus;

    // Logika sederhana untuk Status Pompa
    const pompaStatus = document.getElementById('pompa');
    if (kelembapan < 70) {
        pompaStatus.innerText = "MENYIRAM...";
        pompaStatus.style.color = "#2e7d32";
    } else {
        pompaStatus.innerText = "MATI";
        pompaStatus.style.color = "#d32f2f";
    }

    // Update Waktu
    const now = new Date();
    document.getElementById('date-time').innerText = now.toLocaleString('id-ID');
}

// Jalankan update setiap 2 detik
setInterval(updateData, 2000);

// Panggil sekali saat pertama kali dimuat
updateData();
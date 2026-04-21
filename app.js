// 1. KONFIGURASI FIREBASE
const firebaseConfig = {
    apiKey: "AIzaSyBft8FA2rTVZG3AkSu63Bk86FCPNvKC_hA",
    authDomain: "latihan2-f2b0f.firebaseapp.com",
    databaseURL: "https://latihan2-f2b0f-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "latihan2-f2b0f",
    storageBucket: "latihan2-f2b0f.firebasestorage.app",
    messagingSenderId: "33212839471",
    appId: "1:33212839471:web:8f6f5d79785dfdfd2438da"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// 2. ELEMEN GLOBAL
// 2. AMBIL ELEMEN HTML
const elements = {
    suhu: document.getElementById('suhu'),
    phAir: document.getElementById('ph-air'),
    kelembapan: document.getElementById('kelembapan'),
    panelWatt: document.getElementById('panel-watt'),
    panelVolt: document.getElementById('panel-volt'),
    panelAmpere: document.getElementById('panel-ampere'),
    bateraiPersen: document.getElementById('baterai-persen'),
    bateraiVolt: document.getElementById('baterai-volt'),
    time: document.getElementById('current-time'),
    statusPompa: document.getElementById('status-pompa'),
    cardPompa: document.getElementById('card-pompa'),
    btnDashboard: document.getElementById('btn-dashboard'),
    btnRiwayat: document.getElementById('btn-riwayat'),
    btnGrafik: document.getElementById('btn-grafik'),
    kontenDashboard: document.getElementById('konten-dashboard'),
    kontenRiwayat: document.getElementById('konten-riwayat'),
    kontenGrafik: document.getElementById('konten-grafik'),
    tabelRiwayat: document.getElementById('isi-tabel-riwayat'), // Pastikan ada koma di sini
    btnProfil: document.getElementById('btn-profil'),           // Tambahkan ini
    kontenProfil: document.getElementById('konten-profil'),
    pompaWh: document.getElementById('pompa-wh'),   // Baris terakhir tidak wajib koma
    btnProteksi: document.getElementById('btn-proteksi'),
    kontenProteksi: document.getElementById('konten-proteksi'),
    statusArusLebih: document.getElementById('status-arus-lebih'),
    cardArusLebih: document.getElementById('card-arus-lebih'),
    statusArusEkstrem: document.getElementById('status-arus-ekstrem'),
    cardArusEkstrem: document.getElementById('card-arus-ekstrem'),
    statusBms: document.getElementById('status-bms'),
    cardBms: document.getElementById('card-status-bms')
};

// Tambahkan ini tepat di bawah kurung tutup elements di atas
let chartSuhu, chartPh, chartKelembapan, chartVolt;

// 3. LOGIKA NAVIGASI
function gantiHalaman(halamanAktif, tombolAktif) {
    // 1. Sembunyikan SEMUA container secara paksa
    const semuaKonten = [
        elements.kontenDashboard, 
        elements.kontenRiwayat, 
        elements.kontenGrafik, 
        elements.kontenProfil, 
        elements.kontenProteksi
    ];
    
    semuaKonten.forEach(konten => {
        if (konten) konten.style.display = 'none';
    });

    // 2. Hapus class 'active' dari SEMUA tombol sidebar
    const semuaTombol = [
        elements.btnDashboard, 
        elements.btnRiwayat, 
        elements.btnGrafik, 
        elements.btnProfil, 
        elements.btnProteksi
    ];

    semuaTombol.forEach(btn => {
        if (btn) btn.classList.remove('active');
    });

    // 3. Tampilkan HANYA yang diminta
    halamanAktif.style.display = 'block';
    tombolAktif.classList.add('active');
    
    // Scroll ke atas otomatis setiap ganti halaman
    window.scrollTo(0, 0);
}

function setupNavigation() {
    // Navigasi Dashboard
    elements.btnDashboard.onclick = () => {
        gantiHalaman(elements.kontenDashboard, elements.btnDashboard, 'Dashboard Monitoring');
    };

    // Navigasi Riwayat
    elements.btnRiwayat.onclick = () => {
        gantiHalaman(elements.kontenRiwayat, elements.btnRiwayat, 'Riwayat Data');
        muatRiwayat();
    };

    // Navigasi Grafik
    elements.btnGrafik.onclick = () => {
        gantiHalaman(elements.kontenGrafik, elements.btnGrafik, 'Grafik Analisis');
        muatGrafik();
    };

    // Navigasi Profil
    elements.btnProfil.onclick = () => {
        gantiHalaman(elements.kontenProfil, elements.btnProfil, 'Profil Pengembang');
    };

    // Navigasi Proteksi
    elements.btnProteksi.onclick = () => {
        gantiHalaman(elements.kontenProteksi, elements.btnProteksi, 'Sistem Proteksi INA226');
    };
}

// 4. FUNGSI DATA (REAL-TIME & RIWAYAT)

// Pindahkan variabel perhitungan ke sini agar aman (Hanya sekali deklarasi)
let totalWh = 0;
let waktuMulai = null;
const DAYA_POMPA = 12; 

function listenToData() {
    database.ref('monitoring').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // --- 1. Update Sensor Standar ---
            elements.suhu.innerText = data.suhu || "0";
            elements.phAir.innerText = data.phAir || "0";
            elements.kelembapan.innerText = data.kelembapan || "0";
            
            // --- 2. Update Panel Surya ---
            elements.panelWatt.innerText = (data.panelWatt || "0") + " W";
            elements.panelVolt.innerText = (data.panelVolt || "0") + " V";
            elements.panelAmpere.innerText = (data.panelAmpere || "0") + " A";
            
            // --- 3. Update Baterai ---
            elements.bateraiPersen.innerText = (data.bateraiPersen || "0") + " %";
            elements.bateraiVolt.innerText = (data.bateraiVolt || "0") + " V (Input)";

            // --- 4. Logika Status Pompa & Perhitungan Wh ---
            const statusPompa = data.pompa;
            if (statusPompa === "ON" || statusPompa === "NYALA") {
                elements.statusPompa.innerText = "NYALA";
                elements.cardPompa.style.backgroundColor = "#2ecc71";
                elements.statusPompa.style.color = "white";

                if (waktuMulai === null) waktuMulai = Date.now();
                let durasiDetik = (Date.now() - waktuMulai) / 1000;
                let WhBerjalan = totalWh + (DAYA_POMPA * (durasiDetik / 3600));
                elements.pompaWh.innerText = WhBerjalan.toFixed(2) + " Wh";
            } else {
                elements.statusPompa.innerText = "MATI";
                elements.cardPompa.style.backgroundColor = "white";
                elements.statusPompa.style.color = "#2c3e50";

                if (waktuMulai !== null) {
                    let durasiJam = (Date.now() - waktuMulai) / 3600000;
                    totalWh += (DAYA_POMPA * durasiJam);
                    waktuMulai = null;
                }
                elements.pompaWh.innerText = totalWh.toFixed(2) + " Wh";
            }

            // --- 5. LOGIKA PROTEKSI (INA226) ---
            const arus = parseFloat(data.panelAmpere) || 0;
            const voltase = parseFloat(data.bateraiVolt) || 0;

            // Arus Berlebih (> 3.5A)
            if (arus > 3.5) {
                elements.statusArusLebih.innerText = "BAHAYA";
                elements.cardArusLebih.style.backgroundColor = "#e74c3c";
                elements.statusArusLebih.style.color = "white";
            } else {
                elements.statusArusLebih.innerText = "AMAN";
                elements.cardArusLebih.style.backgroundColor = "white";
                elements.statusArusLebih.style.color = "#2ecc71";
            }

            // Arus Ekstrem (> 4.5A)
            if (arus > 4.5) {
                elements.statusArusEkstrem.innerText = "SANGAT TINGGI";
                elements.cardArusEkstrem.style.backgroundColor = "#c0392b";
                elements.statusArusEkstrem.style.color = "white";
            } else {
                elements.statusArusEkstrem.innerText = "NORMAL";
                elements.cardArusEkstrem.style.backgroundColor = "white";
                elements.statusArusEkstrem.style.color = "#2ecc71";
            }

            // BMS Cut-off (< 11.0V)
            if (voltase < 11.0) {
                elements.statusBms.innerText = "TERPUTUS (LOW)";
                elements.cardBms.style.backgroundColor = "#e74c3c";
                elements.statusBms.style.color = "white";
            } else {
                elements.statusBms.innerText = "TERHUBUNG";
                elements.cardBms.style.backgroundColor = "white";
                elements.statusBms.style.color = "#2ecc71";
            }
        }
    });
}

function muatRiwayat() {
    const tgl = new Date().toISOString().split('T')[0];
    database.ref(`logs/${tgl}`).limitToLast(10).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            let html = '';
            const keys = Object.keys(data).reverse();
            keys.forEach(waktu => {
                const item = data[waktu];
                const jam = waktu.match(/.{1,2}/g).join(':');
                const statusPompa = item.pompa || "OFF";
                const warnaStatus = (statusPompa === "ON" || statusPompa === "NYALA") ? "#2ecc71" : "#e74c3c";

               html += `
    <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${jam}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.suhu}°C</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.phAir}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.kelembapan}%</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.panelWatt}W</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; color: ${warnaStatus}; font-weight: bold;">${statusPompa}</td>
        
        <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.pompaWh || "0.00"} Wh</td>
    </tr>`;
            });
            elements.tabelRiwayat.innerHTML = html;
        } else {
            elements.tabelRiwayat.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">Belum ada data riwayat hari ini.</td></tr>';
        }
    });
}

// 5. SIMULASI & WAKTU
function startSimulasi() {
    setInterval(() => {
        const sekarang = new Date();
        const tgl = sekarang.toISOString().split('T')[0];
        const wkt = sekarang.toTimeString().split(' ')[0].replace(/:/g, '');

        const dataFiktif = {
            suhu: (25 + Math.random() * 7).toFixed(1),
            phAir: (6.0 + Math.random() * 0.8).toFixed(1),
            kelembapan: Math.floor(65 + Math.random() * 15),
            panelWatt: (50 + Math.random() * 20).toFixed(1),
            panelVolt: (12.2 + Math.random() * 1).toFixed(1),
            panelAmpere: (3.0 + Math.random() * 1).toFixed(2),
            bateraiPersen: Math.floor(85 + Math.random() * 10),
            bateraiVolt: (12.8 + Math.random() * 0.5).toFixed(1),
            pompa: Math.random() > 0.5 ? "ON" : "OFF", // Pastikan ada koma di sini
            
            // TAMBAHKAN BARIS INI:
            pompaWh: totalWh.toFixed(2) 
        };

        database.ref('monitoring').set(dataFiktif);
        database.ref(`logs/${tgl}/${wkt}`).set(dataFiktif);
    }, 5000);
}

function updateTime() {
    setInterval(() => {
        elements.time.innerText = new Date().toLocaleString('id-ID');
    }, 1000);
}

// 6. INITIALIZE & GRAFIK
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    listenToData();
    updateTime();
    //startSimulasi();
});

function inisialisasiGrafik(idCanvas, label, warna) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: label,
                data: [],
                borderColor: warna,
                backgroundColor: warna + '33',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

function muatGrafik() {
    if (!chartSuhu) {
        chartSuhu = inisialisasiGrafik('grafikSuhu', 'Suhu (°C)', '#e74c3c');
        chartPh = inisialisasiGrafik('grafikPh', 'pH Air', '#3498db');
        chartKelembapan = inisialisasiGrafik('grafikKelembapan', 'Kelembapan (%)', '#2ecc71');
        chartVolt = inisialisasiGrafik('grafikVolt', 'Voltase Panel (V)', '#f1c40f');
    }

    const tgl = new Date().toISOString().split('T')[0];
    database.ref(`logs/${tgl}`).limitToLast(15).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const labels = [], dSuhu = [], dPh = [], dLembap = [], dVolt = [];
            Object.keys(data).forEach(wkt => {
                const item = data[wkt];
                labels.push(wkt.match(/.{1,2}/g).join(':'));
                dSuhu.push(parseFloat(item.suhu) || 0);
                dPh.push(parseFloat(item.phAir) || 0);
                dLembap.push(parseFloat(item.kelembapan) || 0);
                dVolt.push(parseFloat(item.panelVolt) || 0);
            });

            if(chartSuhu) { chartSuhu.data.labels = labels; chartSuhu.data.datasets[0].data = dSuhu; chartSuhu.update(); }
            if(chartPh) { chartPh.data.labels = labels; chartPh.data.datasets[0].data = dPh; chartPh.update(); }
            if(chartKelembapan) { chartKelembapan.data.labels = labels; chartKelembapan.data.datasets[0].data = dLembap; chartKelembapan.update(); }
            if(chartVolt) { chartVolt.data.labels = labels; chartVolt.data.datasets[0].data = dVolt; chartVolt.update(); }
        }
    });
}   

document.getElementById('btn-download-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tgl = new Date().toLocaleDateString('id-ID');

    doc.setFontSize(16);
    doc.text('LAPORAN MONITORING BIBIT BAWANG MERAH', 14, 20);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Tanggal Laporan: ${tgl}`, 14, 30);

    doc.autoTable({
        html: '#konten-riwayat table',
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [39, 174, 96] },
        styles: { fontSize: 10, cellPadding: 3 },
    });

    doc.save(`Laporan_Monitoring_${tgl.replace(/\//g, '-')}.pdf`);
});


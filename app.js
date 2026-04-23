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
    tabelRiwayat: document.getElementById('isi-tabel-riwayat'),
    btnProfil: document.getElementById('btn-profil'),
    kontenProfil: document.getElementById('konten-profil'),
    pompaWh: document.getElementById('pompa-wh'),
    btnProteksi: document.getElementById('btn-proteksi'),
    kontenProteksi: document.getElementById('konten-proteksi'),
    statusArusLebih: document.getElementById('status-arus-lebih'),
    cardArusLebih: document.getElementById('card-arus-lebih'),
    statusArusEkstrem: document.getElementById('status-arus-ekstrem'),
    cardArusEkstrem: document.getElementById('card-arus-ekstrem'),
    statusBms: document.getElementById('status-bms'),
    cardBms: document.getElementById('card-status-bms')
};

let chartSuhu, chartPh, chartKelembapan, chartVolt;

// 3. LOGIKA NAVIGASI
function gantiHalaman(halamanAktif, tombolAktif) {
    const semuaKonten = [elements.kontenDashboard, elements.kontenRiwayat, elements.kontenGrafik, elements.kontenProfil, elements.kontenProteksi];
    semuaKonten.forEach(konten => { if (konten) konten.style.display = 'none'; });

    const semuaTombol = [elements.btnDashboard, elements.btnRiwayat, elements.btnGrafik, elements.btnProfil, elements.btnProteksi];
    semuaTombol.forEach(btn => { if (btn) btn.classList.remove('active'); });

    halamanAktif.style.display = 'block';
    tombolAktif.classList.add('active');
    window.scrollTo(0, 0);
}

function setupNavigation() {
    elements.btnDashboard.onclick = () => gantiHalaman(elements.kontenDashboard, elements.btnDashboard);
    elements.btnRiwayat.onclick = () => { gantiHalaman(elements.kontenRiwayat, elements.btnRiwayat); muatRiwayat(); };
    elements.btnGrafik.onclick = () => { gantiHalaman(elements.kontenGrafik, elements.btnGrafik); muatGrafik(); };
    elements.btnProfil.onclick = () => gantiHalaman(elements.kontenProfil, elements.btnProfil);
    elements.btnProteksi.onclick = () => gantiHalaman(elements.kontenProteksi, elements.btnProteksi);
}

// 4. FUNGSI DATA
let totalWh = 0;
let waktuMulai = null;
const DAYA_POMPA = 12;

function listenToData() {
    database.ref('monitoring').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            // Gunakan parseFloat().toFixed(2) untuk membatasi desimal di tampilan web
            elements.suhu.innerText = parseFloat(data.suhu || 0).toFixed(2);
            elements.phAir.innerText = parseFloat(data.phAir || 0).toFixed(2);
            
            // Sensor lainnya tetap seperti biasa
            elements.kelembapan.innerText = data.kelembapan || "0";
            elements.panelWatt.innerText = (parseFloat(data.panelWatt || 0).toFixed(2)) + " W";
            elements.panelVolt.innerText = (parseFloat(data.panelVolt || 0).toFixed(2)) + " V";
            elements.panelAmpere.innerText = (parseFloat(data.panelAmpere || 0).toFixed(2)) + " A";
            
            // ... sisa kode status pompa dan baterai tetap sama ...
            elements.bateraiPersen.innerText = (data.bateraiPersen || "0") + " %";
            elements.bateraiVolt.innerText = (data.bateraiVolt || "0") + " V (Input)";

            // Logika Pompa
            const statusPompa = data.pompa;
            if (statusPompa === "ON" || statusPompa === "NYALA") {
                elements.statusPompa.innerText = "NYALA";
                elements.cardPompa.style.backgroundColor = "#2ecc71";
                elements.statusPompa.style.color = "white";
            } else {
                elements.statusPompa.innerText = "MATI";
                elements.cardPompa.style.backgroundColor = "white";
                elements.statusPompa.style.color = "#2c3e50";
            }
        }
    });
}

// --- PERBAIKAN TABEL RIWAYAT ---
function muatRiwayat() {
    const tgl = new Date().toISOString().split('T')[0];
    database.ref(`logs/${tgl}`).limitToLast(10).on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            let html = '';
            const keys = Object.keys(data).reverse();
            keys.forEach(id => {
                const item = data[id];
                
                // Gunakan waktu saat ini untuk tampilan jika ID berupa PushID Firebase
                const jamTampil = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                
                const statusPompa = item.pompa || "OFF";
                const warnaStatus = (statusPompa === "ON" || statusPompa === "NYALA") ? "#2ecc71" : "#e74c3c";

                html += `
                <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${jamTampil}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.suhu}°C</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.phAir}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.kelembapan}%</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.panelWatt || 0}W</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; color: ${warnaStatus}; font-weight: bold;">${statusPompa}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.pompaWh || "0.00"} Wh</td>
                </tr>`;
            });
            elements.tabelRiwayat.innerHTML = html;
        } else {
            elements.tabelRiwayat.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">Belum ada data riwayat hari ini.</td></tr>';
        }
    });
}

// --- PERBAIKAN GRAFIK ---
function inisialisasiGrafik(idCanvas, label, warna) {
    const canvas = document.getElementById(idCanvas);
    if (!canvas) return null;
    return new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: warna, backgroundColor: warna + '33', fill: true, tension: 0.4 }] },
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
            Object.keys(data).forEach((id, index) => {
                const item = data[id];
                // Label grafik menggunakan nomor urut data terbaru
                labels.push("Data-" + (index + 1));
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

// 5. INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    listenToData();
    setInterval(() => { elements.time.innerText = new Date().toLocaleString('id-ID'); }, 1000);
});

// 6. DOWNLOAD PDF
document.getElementById('btn-download-pdf').addEventListener('click', () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const tgl = new Date().toLocaleDateString('id-ID');
    doc.setFontSize(16);
    doc.text('LAPORAN MONITORING BIBIT BAWANG MERAH', 14, 20);
    doc.autoTable({ html: '#konten-riwayat table', startY: 30, theme: 'grid', headStyles: { fillColor: [39, 174, 96] } });
    doc.save(`Laporan_Monitoring_${tgl.replace(/\//g, '-')}.pdf`);
});
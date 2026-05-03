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
    dayaAktifPompa: document.getElementById('daya-aktif-pompa'),
    detailKelistrikan: document.getElementById('detail-kelistrikan'),
    // Tambahan elemen untuk input tanggal
    inputTanggal: document.getElementById('tanggal-riwayat') 
};

let chartSuhu, chartPh, chartKelembapan, chartVolt;

// 3. LOGIKA NAVIGASI
function gantiHalaman(halamanAktif, tombolAktif) {
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

    if (halamanAktif) halamanAktif.style.display = 'block';
    if (tombolAktif) tombolAktif.classList.add('active');
    
    window.scrollTo(0, 0);
}

function setupNavigation() {
    if(elements.btnDashboard) elements.btnDashboard.onclick = () => gantiHalaman(elements.kontenDashboard, elements.btnDashboard);
    if(elements.btnRiwayat) elements.btnRiwayat.onclick = () => { gantiHalaman(elements.kontenRiwayat, elements.btnRiwayat); muatRiwayat(); };
    if(elements.btnGrafik) elements.btnGrafik.onclick = () => { gantiHalaman(elements.kontenGrafik, elements.btnGrafik); muatGrafik(); };
    if(elements.btnProfil) elements.btnProfil.onclick = () => gantiHalaman(elements.kontenProfil, elements.btnProfil);
    if(elements.btnProteksi) elements.btnProteksi.onclick = () => gantiHalaman(elements.kontenProteksi, elements.btnProteksi);
}

// 4. FUNGSI DATA
function listenToData() {
    database.ref('monitoring').on('value', (snapshot) => {
        const data = snapshot.val();
        if (data) {
            if(elements.suhu) elements.suhu.innerText = parseFloat(data.suhu || 0).toFixed(2);
            if(elements.phAir) elements.phAir.innerText = parseFloat(data.phAir || 0).toFixed(1);
            if(elements.kelembapan) elements.kelembapan.innerText = data.kelembapan || "0";
            
            // Logika Baterai (Masih dipertahankan 12V untuk sementara)
            const vBatt = parseFloat(data.bateraiVolt || 0);
            let persen = ((vBatt - 10.5) / (13.5 - 10.5)) * 100;
            persen = Math.max(0, Math.min(100, persen)); 
            
            if(elements.bateraiPersen) elements.bateraiPersen.innerText = Math.round(persen) + " %";
            if(elements.bateraiVolt) elements.bateraiVolt.innerText = vBatt.toFixed(2) + " V";
            if(elements.pompaWh) elements.pompaWh.innerText = parseFloat(data.pompaWh || 0).toFixed(2) + " Wh";

            const isNyala = (data.pompa === "ON" || data.pompa === "NYALA");
            if (elements.statusPompa) elements.statusPompa.innerText = isNyala ? "NYALA" : "MATI";
            if (elements.cardPompa) {
                elements.cardPompa.style.backgroundColor = isNyala ? "#2ecc71" : "white";
                elements.statusPompa.style.color = isNyala ? "white" : "#2c3e50";
            }

            let watt = isNyala ? parseFloat(data.pompaWatt || 0).toFixed(2) : "0.00";
            let ampere = isNyala ? parseFloat(data.pompaAmpere || 0).toFixed(2) : "0.00";
            
            if (elements.dayaAktifPompa) elements.dayaAktifPompa.innerText = watt + " W";
            if (elements.detailKelistrikan) elements.detailKelistrikan.innerText = vBatt.toFixed(2) + " V | " + ampere + " A";
        }
    });
}

// 5. RIWAYAT & GRAFIK
function muatRiwayat() {
    // Set tanggal default ke hari ini jika input masih kosong
    if (elements.inputTanggal && !elements.inputTanggal.value) {
        elements.inputTanggal.value = new Date().toLocaleDateString('en-CA');
    }

    // Ambil tanggal dari kalender (atau hari ini jika kalender tidak ada)
    const dateStr = elements.inputTanggal ? elements.inputTanggal.value : new Date().toLocaleDateString('en-CA');
    
    // Matikan listener lama agar data antar tanggal tidak menumpuk saat ganti hari
    database.ref('logs').off(); 

    // Ambil maksimal 50 data terakhir dari Firebase untuk tanggal yang dipilih
    database.ref(`logs/${dateStr}`).limitToLast(50).on('value', (snapshot) => {
        const data = snapshot.val();
        let html = '';
        if (data) {
            Object.keys(data).reverse().forEach(id => {
                const item = data[id];
                
                // Ambil jam dari database ESP32
                const jamTampil = item.waktu || "00:00:00";
                const isNyala = (item.pompa === "ON" || item.pompa === "NYALA");

                html += `<tr>
                    <td style="padding:12px; border-bottom:1px solid #eee;">${jamTampil}</td>
                    <td style="padding:12px; border-bottom:1px solid #eee;">${parseFloat(item.suhu || 0).toFixed(2)}°C</td>
                    <td style="padding:12px; border-bottom:1px solid #eee;">${parseFloat(item.phAir || 0).toFixed(1)}</td>
                    <td style="padding:12px; border-bottom:1px solid #eee;">${item.kelembapan || 0}%</td>
                    <td style="padding:12px; border-bottom:1px solid #eee;">${parseFloat(item.bateraiVolt || 0).toFixed(2)} V</td>
                    <td style="padding:12px; border-bottom:1px solid #eee; color:${isNyala ? '#2ecc71' : '#e74c3c'}; font-weight:bold;">${item.pompa || 'MATI'}</td>
                    <td style="padding:12px; border-bottom:1px solid #eee;">${parseFloat(item.pompaWh || 0).toFixed(2)} Wh</td>
                </tr>`;
            });
            if(elements.tabelRiwayat) elements.tabelRiwayat.innerHTML = html;
        } else {
            if(elements.tabelRiwayat) elements.tabelRiwayat.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:#7f8c8d;">Belum ada data untuk tanggal <b>${dateStr}</b>.</td></tr>`;
        }
    });
}

function muatGrafik() {
    if (!chartSuhu) {
        chartSuhu = inisialisasiGrafik('grafikSuhu', 'Suhu (°C)', '#e74c3c');
        chartPh = inisialisasiGrafik('grafikPh', 'pH Air', '#3498db');
        chartKelembapan = inisialisasiGrafik('grafikKelembapan', 'Kelembapan (%)', '#2ecc71');
        chartVolt = inisialisasiGrafik('grafikVolt', 'Voltase Baterai (V)', '#f1c40f');
    }

    const dateStr = elements.inputTanggal ? elements.inputTanggal.value : new Date().toLocaleDateString('en-CA');
    
    database.ref(`logs/${dateStr}`).limitToLast(15).on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data) {
            const labels = [], dSuhu = [], dPh = [], dLembap = [], dVolt = [];

            Object.keys(data).forEach((id) => {
                const item = data[id];
                labels.push(item.waktu || "00:00");
                dSuhu.push(parseFloat(item.suhu || 0));
                dPh.push(parseFloat(item.phAir || 0));
                dLembap.push(parseFloat(item.kelembapan || 0));
                dVolt.push(parseFloat(item.bateraiVolt || 0));
            });

            if(chartSuhu) { chartSuhu.data.labels = labels; chartSuhu.data.datasets[0].data = dSuhu; chartSuhu.update(); }
            if(chartPh) { chartPh.data.labels = labels; chartPh.data.datasets[0].data = dPh; chartPh.update(); }
            if(chartKelembapan) { chartKelembapan.data.labels = labels; chartKelembapan.data.datasets[0].data = dLembap; chartKelembapan.update(); }
            if(chartVolt) { chartVolt.data.labels = labels; chartVolt.data.datasets[0].data = dVolt; chartVolt.update(); }
        }
    });
}

function inisialisasiGrafik(idCanvas, label, warna) {
    const ctx = document.getElementById(idCanvas);
    if (!ctx) return null;
    return new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: { labels: [], datasets: [{ label: label, data: [], borderColor: warna, fill: true, tension: 0.4 }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// 6. INITIALIZE
document.addEventListener('DOMContentLoaded', () => {
    setupNavigation();
    listenToData();
    
    // Jika user memilih tanggal baru di kalender, muat ulang tabel dan grafik
    if (elements.inputTanggal) {
        elements.inputTanggal.addEventListener('change', () => {
            muatRiwayat();
            if (elements.kontenGrafik.style.display === 'block') {
                muatGrafik();
            }
        });
    }

    setInterval(() => { if(elements.time) elements.time.innerText = new Date().toLocaleString('id-ID'); }, 1000);
});

// 7. PDF EXPORT
document.getElementById('btn-download-pdf').onclick = () => {
    // Nama file PDF menyesuaikan dengan tanggal yang dipilih
    const dateStr = elements.inputTanggal ? elements.inputTanggal.value : new Date().toLocaleDateString('id-ID');
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Header PDF
    doc.setFontSize(14);
    doc.text(`LAPORAN MONITORING BIBIT BAWANG MERAH`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Tanggal Laporan: ${dateStr}`, 14, 28);
    
    doc.autoTable({ html: '#konten-riwayat table', startY: 35 });
    doc.save(`Laporan_Bawang_Merah_${dateStr}.pdf`);
};
// GANTI URL DI BAWAH INI DENGAN URL DARI FASE 1.3
const API_URL = 'https://script.google.com/macros/s/AKfycbxykWgMEDLfMRUPE6syMBSFe1FfO0kHq2P59WBqj_co5p1vCTUDSTzP2YJfwEnOizDe/exec'; 

// Fungsi Jam
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString('id-ID');
}, 1000);

// Fungsi Ambil Data dari Google Sheet
async function loadData() {
    try {
        // Tambah ?t= agar tidak mengambil data cache lama
        const response = await fetch(API_URL + '?t=' + new Date().getTime());
        const data = await response.json();
        
        // 1. Hitung Total Absen
        document.getElementById('total-absen').innerText = data.length;
        
        // 2. Hitung Departemen Unik
        const depts = [...new Set(data.map(item => item.Departemen))];
        document.getElementById('total-dept').innerText = depts.length;
        
        // 3. Tampilkan Log (Ambil 10 data terakhir)
        const logList = document.getElementById('log-list');
        logList.innerHTML = ''; // Kosongkan dulu
        
        // Balik urutan agar yang terbaru di atas
        const recentData = data.slice().reverse().slice(0, 10);
        
        recentData.forEach(item => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="time">[${item.Waktu}]</span> ✅ ${item.Nama} - ${item.Departemen} (${item.Lokasi})`;
            logList.appendChild(li);
        });

    } catch (error) {
        console.error("Gagal ambil data:", error);
        document.getElementById('log-list').innerHTML = '<li style="color:red;">❌ Gagal koneksi ke database!</li>';
    }
}

// Jalankan saat web dibuka, lalu refresh otomatis setiap 30 detik
loadData();
setInterval(loadData, 30000);

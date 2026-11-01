// GANTI URL DI BAWAH INI DENGAN URL DARI APPS SCRIPT
const API_URL = 'PASTE_URL_APPS_SCRIPT_DISINI';

// Fungsi Jam
setInterval(() => {
    document.getElementById('clock').innerText = new Date().toLocaleTimeString('id-ID');
}, 1000);

// Fungsi Ambil Data
async function loadData() {
    try {
        const response = await fetch(API_URL + '?t=' + new Date().getTime());
        const data = await response.json();
        
        // 1. Hitung Total Absen
        const today = new Date().toISOString().split('T')[0];
        const todayData = data.filter(item => item.Waktu && item.Waktu.includes(today));
        document.getElementById('total-absen').innerText = todayData.length;
        
        // 2. Hitung Departemen Unik
        const depts = [...new Set(todayData.map(item => item.Departemen).filter(Boolean))];
        document.getElementById('total-dept').innerText = depts.length;
        
        // 3. Tampilkan Log
        const logList = document.getElementById('log-list');
        logList.innerHTML = '';
        
        const recentData = todayData.slice().reverse().slice(0, 10);
        
        recentData.forEach(item => {
            const li = document.createElement('li');
            let waktuRapi = item.Waktu || '';
            if (waktuRapi.includes('T')) {
                waktuRapi = waktuRapi.replace('T', ' ').substring(0, 16);
            }
            
            const lokasi = item.Lokasi || 'GPS';
            const departemen = item.Departemen || 'Umum';
            
            li.innerHTML = `<span class="time">[${waktuRapi}]</span> ✅ ${item.Nama} - ${departemen} (${lokasi})`;
            logList.appendChild(li);
        });
        
        // 4. Update Radar GPS
        updateRadar(todayData);
        
    } catch (error) {
        console.error("Gagal ambil data:", error);
        document.getElementById('log-list').innerHTML = '<li style="color:red;">❌ Gagal koneksi ke database!</li>';
    }
}

// Fungsi Update Radar
function updateRadar(data) {
    const radarScreen = document.getElementById('radar-screen');
    
    // Hapus blip lama (jangan hapus sweep, center, rings)
    const oldBlips = radarScreen.querySelectorAll('.radar-blip');
    oldBlips.forEach(blip => blip.remove());
    
    // Filter data yang punya koordinat valid
    const gpsData = data.filter(item => 
        item.Latitude && 
        item.Longitude && 
        item.Latitude !== 0 && 
        item.Longitude !== 0
    );
    
    document.getElementById('target-count').innerText = gpsData.length;
    
    if (gpsData.length === 0) {
        // Tambah pesan jika tidak ada GPS
        const noData = document.createElement('div');
        noData.style.position = 'absolute';
        noData.style.top = '50%';
        noData.style.left = '50%';
        noData.style.transform = 'translate(-50%, -50%)';
        noData.style.color = 'var(--dim)';
        noData.style.fontSize = '14px';
        noData.innerText = 'Menunggu data GPS...';
        radarScreen.appendChild(noData);
        return;
    }
    
    // Hitung bounding box untuk normalisasi koordinat
    const lats = gpsData.map(d => d.Latitude);
    const lngs = gpsData.map(d => d.Longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    // Tambah padding agar tidak di tepi
    const latRange = (maxLat - minLat) || 0.001;
    const lngRange = (maxLng - minLng) || 0.001;
    
    // Buat blip untuk setiap karyawan
    gpsData.forEach((item, index) => {
        const blip = document.createElement('div');
        blip.className = 'radar-blip';
        
        // Normalisasi koordinat ke persentase (0-100%)
        // Radar screen 350px, center di 50%
        const top = 50 - ((item.Latitude - minLat) / latRange - 0.5) * 80;
        const left = 50 + ((item.Longitude - minLng) / lngRange - 0.5) * 80;
        
        blip.style.top = top + '%';
        blip.style.left = left + '%';
        blip.setAttribute('data-label', item.Nama ? item.Nama.split(' ')[0] : 'User' + index);
        
        // Warna berbeda untuk departemen berbeda
        const colors = {
            'Produksi': '#00ff41',
            'Logistik': '#00ccff',
            'Maintenance': '#ffcc00',
            'HRD': '#ff6600',
            'IT': '#cc00ff',
            'K3': '#ff0066',
            'QC': '#00ffcc'
        };
        blip.style.background = colors[item.Departemen] || '#00ff41';
        blip.style.boxShadow = `0 0 10px ${blip.style.background}`;
        
        radarScreen.appendChild(blip);
    });
}

// Jalankan saat load dan refresh tiap 30 detik
loadData();
setInterval(loadData, 30000);

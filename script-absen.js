// GANTI DENGAN URL APPS SCRIPT ANDA
const API_URL = 'https://script.google.com/macros/s/AKfycbzTDENR5ZzLbveW-JZnu7WrDGUYuTht8kwO9X61QFBjIk8lg14mqX994kolWNnmIh_2/exec';

let currentLat = null;
let currentLng = null;

// Dapatkan GPS saat halaman dimuat
window.onload = function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                document.getElementById('gps-status').innerHTML = 
                    '✅ GPS Aktif | ' + currentLat.toFixed(4) + ', ' + currentLng.toFixed(4);
                document.getElementById('gps-status').style.color = '#00ff41';
            },
            function(error) {
                document.getElementById('gps-status').innerHTML = 
                    '⚠️ GPS Error: ' + error.message;
                document.getElementById('gps-status').style.color = '#ff3333';
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        document.getElementById('gps-status').innerHTML = 
            '❌ GPS tidak didukung browser ini';
        document.getElementById('gps-status').style.color = '#ff3333';
    }
};

async function submitAbsen(status) {
    const nama = document.getElementById('nama').value;
    const departemen = document.getElementById('departemen').value;
    
    // Validasi
    if (!nama || !departemen) {
        alert('⚠️ Harap isi Nama dan Departemen!');
        return;
    }
    
    if (!currentLat || !currentLng) {
        alert('⚠️ GPS belum siap. Tunggu beberapa detik dan coba lagi.');
        return;
    }
    
    // Tampilkan loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('btn-absen').disabled = true;
    document.getElementById('btn-pulang').disabled = true;
    
    // Tentukan lokasi berdasarkan koordinat (bisa disesuaikan)
    let lokasi = 'Area Pabrik';
    if (status === 'Masuk') {
        lokasi = 'Gate Utama';
    } else {
        lokasi = 'Gate Keluar';
    }
    
    const payload = {
        nama: nama,
        departemen: departemen,
        status: status,
        lokasi: lokasi,
        latitude: currentLat,
        longitude: currentLng
    };
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            redirect: 'follow'
        });
        
        const result = await response.json();
        
        if (result.status === 'sukses') {
            alert(`✅ ABSENSI BERHASIL!\n\nNama: ${nama}\nDepartemen: ${departemen}\nStatus: ${status}\nWaktu: ${result.waktu}\nLokasi: ${lokasi}`);
            
            // Reset form
            document.getElementById('nama').value = '';
            document.getElementById('departemen').value = '';
        } else {
            throw new Error(result.message || 'Gagal menyimpan data');
        }
        
    } catch (error) {
        alert('❌ GAGAL ABSENSI!\n\n' + error.message + '\n\nPeriksa koneksi internet Anda.');
        console.error('Error:', error);
    } finally {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('btn-absen').disabled = false;
        document.getElementById('btn-pulang').disabled = false;
    }
}

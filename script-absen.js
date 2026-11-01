// 1. URL APPS SCRIPT ANDA (Sudah benar, jangan diubah)
const API_URL = 'https://script.google.com/macros/s/AKfycbzTDENR5ZzLbveW-JZnu7WrDGUYuTht8kwO9X61QFBjIk8lg14mqX994kolWNnmIh_2/exec';

let currentLat = null;
let currentLng = null;

// 2. FUNGSI AMBIL GPS (DIPERCEPAT & ADA LOKASI CADANGAN)
window.onload = function() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                // BERHASIL dapat GPS
                currentLat = position.coords.latitude;
                currentLng = position.coords.longitude;
                document.getElementById('gps-status').innerHTML = 
                    '✅ GPS Aktif | ' + currentLat.toFixed(4) + ', ' + currentLng.toFixed(4);
                document.getElementById('gps-status').style.color = '#00ff41';
            },
            function(error) {
                // GAGAL / TIMEOUT -> PAKAI LOKASI DEFAULT PABRIK
                // PENTING: Ganti angka di bawah ini dengan koordinat Google Maps pabrik Anda
                currentLat = -6.2088; 
                currentLng = 106.8456;
                
                document.getElementById('gps-status').innerHTML = 
                    '⚠️ GPS Lambat/Ditolak. Menggunakan Lokasi Default Pabrik';
                document.getElementById('gps-status').style.color = '#ffaa00';
            },
            {
                enableHighAccuracy: false, // Diubah ke false agar proses jauh lebih cepat
                timeout: 5000,             // Maksimal tunggu 5 detik saja (bukan 10)
                maximumAge: 300000         // Boleh pakai data lokasi 5 menit terakhir
            }
        );
    } else {
        // Browser tidak support GPS
        currentLat = -6.2088; 
        currentLng = 106.8456;
        document.getElementById('gps-status').innerHTML = 
            '❌ GPS tidak didukung. Menggunakan Lokasi Default';
        document.getElementById('gps-status').style.color = '#ff3333';
    }
};

// 3. FUNGSI KIRIM DATA ABSEN
async function submitAbsen(status) {
    const nama = document.getElementById('nama').value;
    const departemen = document.getElementById('departemen').value;
    
    if (!nama || !departemen) {
        alert('⚠️ Harap isi Nama dan Departemen!');
        return;
    }
    
    // Tampilkan loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('btn-absen').disabled = true;
    document.getElementById('btn-pulang').disabled = true;
    
    let lokasi = 'Area Pabrik';
    if (status === 'Masuk') lokasi = 'Gate Utama';
    else lokasi = 'Gate Keluar';
    
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
                // INI KUNCI AGAR TIDAK ERROR "Failed to fetch" (CORS)
                'Content-Type': 'text/plain;charset=utf-8', 
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

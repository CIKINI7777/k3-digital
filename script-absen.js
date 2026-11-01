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
    
    // Tentukan lokasi berdasarkan koordinat
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
                // ⬇️ INI SATU-SATUNYA BARIS YANG DIUBAH ⬇️
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

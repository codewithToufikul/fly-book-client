export async function uploadVideoToCloudinaryUnsigned(file, { cloudName, uploadPreset, folder = "courseVideos" }) {
  if (!cloudName) throw new Error("Missing Cloudinary cloudName");
  if (!uploadPreset) throw new Error("Missing Cloudinary uploadPreset");

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  if (folder) form.append("folder", folder);

  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Cloudinary upload failed: ${res.status} ${text}`);
  }
  return await res.json(); // contains secure_url, public_id, etc.
}

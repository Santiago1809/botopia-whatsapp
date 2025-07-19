export async function uploadToCloudinary(audioBlob: Blob): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioBlob);
  formData.append("upload_preset", "default");
  formData.append("cloud_name", process.env.CLOUDINARY_CLOUD_NAME!);
  formData.append("api_key", process.env.CLOUDINARY_API_KEY!);
  formData.append("folder", process.env.CLOUDINARY_FOLDER!);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );
  const data = await res.json();
  return data.secure_url;
}
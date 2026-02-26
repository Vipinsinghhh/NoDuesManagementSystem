import cloudinary from "../config/cloudinary.js";

export const uploadImageBuffer = async (file, folder) => {
  if (!file || !file.buffer) {
    throw new Error("Image file is required");
  }

  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deleteImageByPublicId = async (publicId) => {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
};

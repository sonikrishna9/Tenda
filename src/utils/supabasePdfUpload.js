const supabase = require("../../config/supabase");

const uploadToSupabase = async (file, folder) => {
  const filePath = `${folder}/${Date.now()}-${file.originalname}`;

  const { error } = await supabase.storage
    .from("product-pdfs")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("product-pdfs")
    .getPublicUrl(filePath);

  return {
    url: data.publicUrl,
    path: filePath,
  };
};

module.exports = uploadToSupabase;

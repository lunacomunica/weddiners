"use server";

import { getCoupleId } from "@/lib/getCoupleId";
import { revalidatePath } from "next/cache";
import type { Reference } from "./referencesData";

// Converte base64 (data URL) em Buffer para upload no Storage
function base64ToBuffer(dataUrl: string): { buffer: Buffer; mimeType: string } {
  const [meta, base64] = dataUrl.split(",");
  const mimeType = meta.match(/:(.*?);/)?.[1] ?? "image/jpeg";
  const buffer = Buffer.from(base64, "base64");
  return { buffer, mimeType };
}

function mimeToExt(mimeType: string) {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[mimeType] ?? "jpg";
}

export async function addReference(data: {
  category: string;
  imageData: string; // base64 data URL (upload) ou URL externa (link)
  note?: string;
  sourceUrl?: string;
  sourceType: Reference["sourceType"];
}): Promise<{ reference?: Reference; error?: string }> {
  const { supabase, coupleId } = await getCoupleId();

  let imageUrl = data.imageData;

  // Se for base64, faz upload para o Storage
  if (data.imageData.startsWith("data:")) {
    const { buffer, mimeType } = base64ToBuffer(data.imageData);
    const ext = mimeToExt(mimeType);
    const fileName = `${coupleId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("references")
      .upload(fileName, buffer, { contentType: mimeType, upsert: false });

    if (uploadError) return { error: uploadError.message };

    const { data: { publicUrl } } = supabase.storage
      .from("references")
      .getPublicUrl(fileName);

    imageUrl = publicUrl;
  }

  const { data: row, error } = await supabase
    .from("references")
    .insert({
      couple_id: coupleId,
      category: data.category,
      image_url: imageUrl,
      note: data.note ?? null,
      source_url: data.sourceUrl ?? null,
      source_type: data.sourceType ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath("/referencias");

  const reference: Reference = {
    id: row.id,
    category: row.category,
    imageUrl: row.image_url,
    note: row.note ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    sourceType: row.source_type ?? undefined,
    createdAt: row.created_at,
  };

  return { reference };
}

export async function deleteReference(id: string): Promise<{ error?: string }> {
  const { supabase, coupleId } = await getCoupleId();

  // Busca o registro para saber se tem arquivo no Storage
  const { data: row } = await supabase
    .from("references")
    .select("image_url")
    .eq("id", id)
    .eq("couple_id", coupleId)
    .single();

  // Remove o arquivo do Storage se for um upload (caminho contém o couple_id)
  if (row?.image_url) {
    const url = row.image_url as string;
    // URLs do Storage seguem o padrão: .../storage/v1/object/public/references/{couple_id}/...
    const match = url.match(/\/references\/(.+)$/);
    if (match) {
      const storagePath = match[1];
      // Só deleta se o path começa com o couple_id (segurança extra)
      if (storagePath.startsWith(coupleId)) {
        await supabase.storage.from("references").remove([storagePath]);
      }
    }
  }

  const { error } = await supabase
    .from("references")
    .delete()
    .eq("id", id)
    .eq("couple_id", coupleId);

  if (error) return { error: error.message };

  revalidatePath("/referencias");
  return {};
}

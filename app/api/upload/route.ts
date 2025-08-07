// app/api/upload/route.ts
"use server";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import { tmpdir } from "os";
import { writeFile, unlink, readFile } from "fs/promises";
import path from "path";
import crypto from "crypto";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json({ error: "Content-Type inválido" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Arquivo ausente" }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const extension = file.name.split(".").pop();
    const mimetype = file.type;

    const tmpOriginalPath = path.join(tmpdir(), crypto.randomUUID() + `.${extension}`);
    const tmpFinalPath = tmpOriginalPath + "-compressed";

    await writeFile(tmpOriginalPath, fileBuffer);

    let finalPath = tmpOriginalPath;

    // Comprimir imagem
    if (mimetype.startsWith("image/")) {
      finalPath = tmpFinalPath + ".jpg";
      await sharp(tmpOriginalPath)
        .jpeg({ quality: 70 })
        .toFile(finalPath);
    }

    // Comprimir vídeo
    let videoDuration = null;

    if (mimetype.startsWith("video/")) {
        // 📏 Extrai duração com ffprobe
        videoDuration = await new Promise<number>((resolve, reject) => {
            ffmpeg.ffprobe(tmpOriginalPath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration || 0);
            });
        });

        // 🎬 Comprime o vídeo
        finalPath = tmpFinalPath + ".mp4";
        await new Promise((resolve, reject) => {
            ffmpeg(tmpOriginalPath)
            .outputOptions(["-vcodec libx264", "-crf 28"])
            .save(finalPath)
            .on("end", resolve)
            .on("error", reject);
        });
    }


    // Se não é imagem nem vídeo, mantemos o original
    const fileToUpload = await readFile(finalPath);
    const filename = `uploads/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("befit")
      .upload(filename, fileToUpload, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      return NextResponse.json({ error: "Erro ao subir para o Supabase" }, { status: 500 });
    }

    const { data } = supabase.storage.from("befit").getPublicUrl(filename);

    // Limpeza
    await unlink(tmpOriginalPath).catch(() => {});
    if (finalPath !== tmpOriginalPath) await unlink(finalPath).catch(() => {});

    return NextResponse.json({ url: data.publicUrl, duration: videoDuration });

  } catch (e) {
    console.error("Erro no upload:", e);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

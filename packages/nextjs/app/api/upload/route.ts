import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { keccak256 } from "viem";

/**
 * Guarda a imagem da obra e devolve a impressão digital do arquivo.
 *
 * Numa versão de produção isso iria para IPFS/Arweave; aqui grava em `public/uploads` para a
 * demo rodar sem depender de rede. O que importa juridicamente é o hash: é ele que vai para a
 * chain e permite provar, depois, que o arquivo registrado é exatamente este.
 */

const TIPOS_ACEITOS = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const TAMANHO_MAXIMO = 8 * 1024 * 1024;

const EXTENSOES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("arquivo");

    if (!(file instanceof File)) {
      return NextResponse.json({ erro: "Envie a imagem da obra." }, { status: 400 });
    }
    if (!TIPOS_ACEITOS.includes(file.type)) {
      return NextResponse.json({ erro: "Formato não aceito. Use JPG, PNG, WEBP ou SVG." }, { status: 400 });
    }
    if (file.size > TAMANHO_MAXIMO) {
      return NextResponse.json({ erro: "A imagem passa de 8 MB." }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const hash = keccak256(bytes);

    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });

    const nome = `${randomBytes(8).toString("hex")}.${EXTENSOES[file.type]}`;
    await fs.writeFile(path.join(dir, nome), bytes);

    return NextResponse.json({ url: `/uploads/${nome}`, hash, tamanho: file.size });
  } catch (error) {
    console.error("Erro ao guardar a imagem:", error);
    return NextResponse.json({ erro: "Não foi possível guardar a imagem." }, { status: 500 });
  }
}

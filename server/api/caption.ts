/**
 * POST /api/caption
 *
 * Recibe una foto (JPEG en base64, ya reducida en el móvil) y devuelve
 * 3 frases (positiva, graciosa, poética) y 2-3 canciones que encajen.
 *
 * La clave de la API de Claude solo vive aquí, en el servidor (variable
 * de entorno ANTHROPIC_API_KEY), nunca dentro de la app.
 */
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-opus-5-5";
// ~1,5 MB de base64 ≈ 1,1 MB de JPEG. La app envía fotos de 768 px (~100-200 KB).
const MAX_BASE64_LENGTH = 1_500_000;

const CaptionResult = z.object({
  frases: z
    .array(
      z.object({
        tono: z.enum(["positiva", "graciosa", "poetica"]),
        texto: z.string(),
      }),
    )
    .describe("Exactamente 3 frases: una positiva, una graciosa y una poética."),
  canciones: z
    .array(
      z.object({
        titulo: z.string(),
        artista: z.string(),
        motivo: z.string().describe("Por qué encaja con la foto, en pocas palabras."),
      }),
    )
    .describe("Entre 2 y 3 canciones reales y conocidas."),
});

export type CaptionResponse = z.infer<typeof CaptionResult>;

const RequestBody = z.object({
  imageBase64: z.string().min(100).max(MAX_BASE64_LENGTH),
  idea: z.string().max(200).optional(),
  idioma: z.string().max(20).optional(),
});

const SYSTEM_PROMPT = `Eres el asistente de una app que ayuda a la gente a hacer y publicar una foto bonita en Instagram.
El usuario te enseña la foto que acaba de hacer. Propón:
- 3 frases cortas para acompañarla (máximo ~15 palabras cada una): una positiva, una graciosa y una poética. Que suenen naturales, como las escribiría una persona joven en Instagram; sin hashtags y con 0-1 emojis.
- 2 o 3 canciones reales y conocidas (título y artista exactos) que el usuario pueda buscar en el sticker de música de Instagram. Mezcla algo actual con algún clásico.
Basa todo en lo que se ve en la foto (lugar, luz, ambiente, objetos). Si la foto no es clara, propón frases generales sobre el momento.`;

const client = new Anthropic();

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function POST(request: Request): Promise<Response> {
  const sharedSecret = process.env.APP_SHARED_SECRET;
  if (sharedSecret && request.headers.get("x-app-key") !== sharedSecret) {
    return json({ error: "No autorizado" }, 401);
  }

  let body: z.infer<typeof RequestBody>;
  try {
    body = RequestBody.parse(await request.json());
  } catch {
    return json({ error: "Petición no válida" }, 400);
  }

  const idioma = body.idioma ?? "es";
  const contexto = body.idea ? `La idea de foto que le sugerimos era: "${body.idea}".\n` : "";

  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: betaZodOutputFormat(CaptionResult),
      },
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: "image/jpeg", data: body.imageBase64 },
            },
            {
              type: "text",
              text: `${contexto}Escribe las frases en este idioma: ${idioma}.`,
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal" || !response.parsed_output) {
      return json({ error: "No se pudieron generar sugerencias para esta foto" }, 422);
    }
    return json(response.parsed_output);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return json({ error: "Demasiadas peticiones, prueba en un momento" }, 429);
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Claude API error", err.status, err.message);
      return json({ error: "Error del servicio de IA" }, 502);
    }
    console.error(err);
    return json({ error: "Error interno" }, 500);
  }
}

# FotosIG — prototipo fase 1

Complemento de Instagram que te anima a salir y hacer **la** foto: te sugiere qué foto hacer,
te guía al encuadrar, propone versiones mejoradas, frases y canciones, y la compartes en
Instagram, WhatsApp o TikTok. La idea completa está en [`docs/idea.md`](docs/idea.md).

## Qué hay en este prototipo

Flujo: **sugerencia → cámara con guía → 3 versiones mejoradas → 3 frases + canciones → compartir**.

| Pieza | Dónde | Cómo |
|---|---|---|
| Sugerencias según hora, tiempo y hora dorada | `app/src/lib/suggestions.ts`, `conditions.ts` | Hora dorada con `suncalc` (en el móvil); tiempo con Open-Meteo (gratis, sin clave) |
| Avisos suaves (mañana y tarde, máx. 2/día) | `app/src/lib/notifications.ts`, pantalla Ajustes | Notificaciones locales diarias; horas configurables o desactivables |
| Dos modos | Inicio | "Solo foto" o "Foto con frase y canción" |
| Guía de encuadre en directo | `app/src/components/FramingGuide.tsx` | Cuadrícula de tercios, nivel del horizonte (acelerómetro) y consejos de la idea ("acércate", "centra la taza"…) |
| Versiones mejoradas | `app/src/lib/filters.ts` | Recorte 4:5 (publicación) o 9:16 (historia) + 3 estilos (Luz limpia, Dorado, Película) con Skia, todo en el móvil |
| Marca de agua sutil | Ajustes | Logo pequeño semitransparente, esquina a elegir, se puede quitar |
| Frases y canciones con IA | `server/api/caption.ts` | La app envía la foto reducida (768 px) al servidor, que llama a Claude con visión y devuelve JSON validado |
| Compartir | Pantalla "Tu foto" | Hoja de compartir del sistema (Instagram, WhatsApp, TikTok…). La frase se copia al portapapeles y la canción se añade con el sticker de música de Instagram |
| Galería privada | `app/src/lib/gallery.ts` | Las fotos se guardan solo dentro de la app |

Sin puntos, retos ni logros (eso es la fase 2). Tampoco hay todavía pagos/premium.

## Estructura

```
app/     App Expo (React Native + Expo Router), Android e iPhone con un solo código
server/  Función serverless (Vercel) que guarda la clave de la API de Claude
docs/    Documento de la idea
```

## Probar la app en tu móvil

Requisitos: Node 20+.

```bash
cd app
npm install
cp .env.example .env.local   # pon la URL de tu servidor (ver abajo)
npx expo start
```

Escanea el QR con **Expo Go** (Android/iPhone); todas las librerías usadas vienen incluidas en Expo Go.
Si algo nativo (por ejemplo las notificaciones en Android) no funciona en Expo Go, crea una
*development build* con `npx expo run:android` o `npx eas-cli build --profile development`.

Sin servidor configurado la app funciona igual; solo el modo "foto con frase y canción"
mostrará un aviso en lugar de las frases.

## Servidor de frases y canciones

```bash
cd server
npm install
npx vercel            # la primera vez te pedirá iniciar sesión (plan gratuito)
npx vercel env add ANTHROPIC_API_KEY
npx vercel env add APP_SHARED_SECRET   # opcional, recomendable
npx vercel --prod
```

La URL queda como `https://<tu-proyecto>.vercel.app/api/caption`. Ponla en
`app/.env.local` como `EXPO_PUBLIC_CAPTION_API_URL` y, si definiste `APP_SHARED_SECRET`,
el mismo valor en `EXPO_PUBLIC_CAPTION_API_KEY`.

- Modelo por defecto: `claude-opus-5-5` con esfuerzo bajo. Se puede cambiar con la variable
  `CLAUDE_MODEL` (por ejemplo `claude-haiku-5-5` para abaratar).
- Coste aproximado con el modelo por defecto: ~1-2 céntimos por foto (imagen de 768 px + respuesta corta).
- Tiene activado el *fallback* del lado del servidor: si el modelo rechaza una petición, la API la reintenta con otro modelo.

## Comprobaciones

```bash
cd app && npm run typecheck && npm test
cd server && npm run typecheck
```

## Pendiente / siguientes pasos

- Probar en dispositivos reales y ajustar el nivel del horizonte (signo del acelerómetro en Android) y los estilos de color.
- Compartir directamente a Historias de Instagram (necesita un módulo nativo como `react-native-share` y una development build).
- Premium con RevenueCat: galería ilimitada, sin marca de agua, todos los estilos, frases ilimitadas.
- Límite de 7 días en la galería gratuita y de 3 frases al día.

# Proyecto: App complemento de Instagram que anima a moverse y hacer la foto

## Idea
Herramienta (NO red social) que ayuda a quien no sabe qué foto subir y le anima a moverse para hacerla. Prepara la foto (encuadre, estilo aesthetic, frase, canción) y se publica en Instagram, WhatsApp o TikTok. Es un complemento de Instagram, no un competidor.

Mensaje: "Sal, mira a tu alrededor y llévate la foto perfecta para Instagram."

## FASE 1 (ahora): solo herramienta

### Sugerencias y notificaciones suaves
- **Mañana:** "☀️ ¿Qué tal una foto de tu desayuno / de buenos días?"
- **Tarde:** "🌇 Hay buena luz: una foto de un edificio, un parque o el atardecer quedaría genial."
- Ideas de qué foto subir para usuarios indecisos, según el momento del día, el tiempo (sol, lluvia) y la hora dorada de su ubicación.
- Máximo 1-2 notificaciones al día; el usuario elige las horas o las desactiva.
- Sin puntos, retos ni logros en esta fase.

### Dos modos
1. **Solo foto:** guía para hacerla más aesthetic y mejorarla.
2. **Foto con texto:** además, propone frases y canciones que encajen con la foto.

### Flujo
1. Notificación o sugerencia de foto.
2. Cámara con guía de encuadre en directo: cuadrícula de tercios, horizonte recto, consejos ("acércate", "busca más luz", "centra la taza").
3. La app propone 2-3 versiones mejoradas (recorte, luz, color, estilos aesthetic).
4. Modo "foto con texto": la IA ve la foto y sugiere 3 frases (positiva, graciosa, poética) y 2-3 canciones (título y artista).
5. Botón para compartir en historias o publicaciones de Instagram, WhatsApp o TikTok. La canción la añade el usuario con el sticker de música de Instagram (así no hay que pagar licencias de música).
6. Galería privada con las fotos de cada día.

### Diferencia con Instagram, VSCO, Lightroom, CapCut
Sugerencia de qué foto hacer + ánimo para salir + guía de encuadre en directo + frase y canción en un toque, todo muy simple. La app no pide más tiempo de pantalla: usas el móvil 1 minuto y el resto del tiempo estás fuera.

## FASE 2 (futuro): retos con patrocinadores
- Marcas o negocios pagan por retos: "📸 Foto de tu café en [cafetería]", "🌳 Tu mejor foto en el parque con [marca]".
- El usuario recibe algo a cambio: descuento, producto gratis o participación en un sorteo.
- La marca gana visibilidad con las fotos publicadas en Instagram con su etiqueta.
- Se añadirían también: retos variados ("busca algo amarillo", "un reflejo", "una puerta bonita"), mini paseos ("camina 10 minutos y haz 3 fotos"), rachas, logros, mapa personal de fotos y pasos caminados (Apple Salud / Google Health Connect).
- Requisitos: tener antes una base de usuarios; bases legales para sorteos y concursos en España; cumplir las normas de promociones de Instagram.

## Modelo de negocio: freemium con suscripción
- **Premium: 1,99 €/mes** o **14,99 €/año**. 7 días de prueba gratis.
- Cuentas por suscriptor: 1,99 € − 15 % de Apple/Google ≈ 1,69 €; coste de IA ~0,60 €/mes en usuarios intensivos (2 fotos/día) → margen ≈ 1,10 €/mes. Ejemplo: 1.000 suscriptores ≈ 1.100 €/mes de margen.
- La fase 2 (retos con patrocinadores) sería una segunda fuente de ingresos.

| Gratis | Premium |
|---|---|
| Sugerencias de foto mañana y tarde | Sugerencias personalizadas según el estilo del usuario |
| Guía de encuadre básica (cuadrícula) | Guía avanzada en directo con consejos |
| 2-3 filtros aesthetic | Todos los estilos + packs nuevos cada mes |
| 3 frases al día | Frases y canciones ilimitadas, con tonos a elegir |
| Compartir con marca de agua muy sutil | Sin marca de agua |
| Galería de 7 días | Galería ilimitada + "resumen del mes" en vídeo |
| — | Avisos de hora dorada y según el tiempo |

- Marca de agua de la versión gratis: MUY sutil (logo pequeño y semitransparente en una esquina, que no estropee la foto). El usuario puede elegir la esquina. Premium la quita.
- Pagos dentro de la app con el sistema de Apple y Google (obligatorio en las tiendas); con Expo se puede usar RevenueCat, gratis hasta cierto nivel de ingresos.
- Las funciones exactas de premium se ajustarán tras probar la app.

## Técnica
- App nativa con Expo (React Native), por las notificaciones, la cámara y la ubicación. Un solo código para Android e iPhone.
- Durante el desarrollo se instala gratis en el móvil propio, sin pagar las tiendas.
- Guía de encuadre y filtros: se calculan en el móvil (gratis).
- Hora dorada y atardecer: se calculan con la ubicación (librería gratuita, sin API).
- Tiempo: API gratuita (por ejemplo Open-Meteo).
- Frases y canciones: IA con visión (por ejemplo API de Claude), ~1 céntimo por foto, a través de un pequeño servidor que guarda la clave de la API (plan gratuito de Vercel/Cloudflare).
- Compartir a Instagram: función oficial de compartir a historias/publicaciones.

## Costes
- Para probarla (uso personal): menos de 5 €/mes (solo la IA). Lo demás, gratis.
- Para publicarla: Google Play 25 $ (pago único), Apple App Store 99 $/año.

## Primer paso
Prototipo de la fase 1: sugerencia de foto → cámara con guía de encuadre → 2-3 versiones mejoradas → 3 frases + 2 canciones → compartir en Instagram.

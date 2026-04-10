
export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Falta url" });

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 ViajesTroncal/1.0" }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: "No se pudo leer la promo" });
    }
    const html = await response.text();

    const findMeta = (keys) => {
      for (const key of keys) {
        const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i");
        const match = html.match(regex);
        if (match && match[1]) return match[1];
      }
      return "";
    };

    const titleTag = html.match(/<title[^>]*>(.*?)<\/title>/i);

    res.status(200).json({
      title: findMeta(["og:title", "twitter:title"]) || (titleTag ? titleTag[1].trim() : "Promoción de viaje"),
      description: findMeta(["og:description", "twitter:description", "description"]) || "Descubre esta promoción y cotiza por WhatsApp.",
      image: findMeta(["og:image", "twitter:image"]) || "",
      url
    });
  } catch (error) {
    res.status(500).json({ error: "No se pudo procesar la promo", detail: String(error) });
  }
}

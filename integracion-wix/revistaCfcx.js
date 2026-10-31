/* REVISTA CFCX · backend/revistaCfcx.js
 * Copiar al backend de www.scad.mx (Wix Velo).
 * Solo lectura; exclusivamente posts publicados y públicos de "Revista CFCX".
 * No almacenar claves ni acceder a TV DIGITAL.
 */
import { posts } from '@wix/blog';

const CATEGORY_ID = '3d668a53-3fb1-46f1-a162-3b02e8d23f9d';
const MAX_POSTS = 300;

function mediaUrl(raw) {
  if (!raw) return '';
  const value = typeof raw === 'string' ? raw : (raw.url || raw.id || '');
  if (/^https:\/\/[^\s"'<>]+$/i.test(value)) return value;
  const match = /^wix:image:\/\/v1\/([^#]+)(?:#.*)?$/i.exec(value);
  const id = match ? match[1] : value;
  if (/^[\w~-]+\.(?:jpe?g|png|webp|gif)$/i.test(id)) {
    return 'https://static.wixstatic.com/media/' + id;
  }
  return '';
}

function textFromNodes(nodes) {
  return (Array.isArray(nodes) ? nodes : [])
    .map(n => n.type === 'TEXT' ? String(n.textData?.text || '') : textFromNodes(n.nodes))
    .join('');
}

function safeLink(url) {
  return /^https:\/\/[^\s"'<>]+$/i.test(String(url || '')) ? url : '';
}

function convertRichContent(richContent) {
  const blocks = [];
  let sourceVideo = '';
  for (const node of richContent?.nodes || []) {
    if (!node || !node.type) continue;
    const plain = textFromNodes(node.nodes).trim();
    switch (node.type) {
      case 'PARAGRAPH':
        if (plain) blocks.push({ tipo: 'parrafo', texto: plain });
        break;
      case 'HEADING':
        if (plain) blocks.push({ tipo: 'subtitulo', texto: plain });
        break;
      case 'BLOCKQUOTE':
        if (plain) blocks.push({ tipo: 'cita', texto: plain });
        break;
      case 'IMAGE': {
        const image = node.imageData || {};
        const src = mediaUrl(image.image?.src);
        if (src) blocks.push({ tipo: 'imagen', url: src, alt: image.altText || '', pie: image.caption || '' });
        break;
      }
      case 'BUTTON': {
        const link = safeLink(node.buttonData?.link?.url);
        if (link && /(?:youtube\.com|youtu\.be)/i.test(link)) sourceVideo = link;
        break;
      }
      // No incluir HTML/iframes arbitrarios en el JSON público.
      // El artículo original Wix permanece vinculado para los elementos no soportados.
      default:
        break;
    }
  }
  return { blocks, sourceVideo };
}

function editorialPost(p) {
  if (!p || !p.firstPublishedDate || p.preview || (p.pricingPlanIds || []).length) return null;
  if (!(p.categoryIds || []).includes(CATEGORY_ID)) return null;
  const original = p.url && typeof p.url === 'object'
    ? safeLink(String(p.url.base || '') + String(p.url.path || ''))
    : safeLink(p.url);
  const image = mediaUrl(p.media?.wixMedia?.image) || mediaUrl(p.heroImage);
  const rich = convertRichContent(p.richContent);
  const excerpts = p.excerpt || p.contentText?.slice(0, 200) || '';
  return {
    id: String(p._id || p.id),
    titulo: String(p.title || ''),
    fecha: p.firstPublishedDate,
    tipo: 'ARTÍCULO',
    subtitulo: String(excerpts),
    resumen: String(excerpts),
    portada: image,
    portadaAlt: p.title || '',
    bloques: rich.blocks,
    etiquetas: Array.isArray(p.hashtags) ? p.hashtags : [],
    publicacionUrl: original,
    programaUrl: rich.sourceVideo,
    programa: rich.sourceVideo ? 'Programa original' : '',
    edicion: 'EDICIÓN DIGITAL'
  };
}

export async function consultarRevistaCfcx() {
  const articles = [];
  let offset = 0;
  while (offset < MAX_POSTS) {
    const limit = Math.min(100, MAX_POSTS - offset);
    const response = await posts.listPosts({
      categoryIds: [CATEGORY_ID],
      sort: 'PUBLISHED_DATE_DESC',
      paging: { offset, limit },
      fieldsets: ['URL', 'CONTENT_TEXT', 'RICH_CONTENT']
    });
    const page = Array.isArray(response?.posts) ? response.posts : [];
    for (const p of page) {
      const article = editorialPost(p);
      if (article) articles.push(article);
    }
    if (page.length < limit) break;
    offset += page.length;
  }
  return {
    articulos: articles,
    categoria: 'Revista CFCX',
    generadoEn: new Date().toISOString()
  };
}

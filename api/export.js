// Vercel Serverless Function — ersätter Render-servern helt
// Anropas via POST https://manadsblad.vercel.app/api/export

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, format = 'A4' } = req.body ?? {};
  if (!html) return res.status(400).json({ error: '"html" kr\u00e4vs.' });

  try {
    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = (await import('puppeteer-core')).default;

    const browser = await puppeteer.launch({
      args:            chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath:  await chromium.executablePath(),
      headless:        chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(wrapHTML(html), { waitUntil: 'networkidle0', timeout: 25_000 });

    const FORMAT_MAP = {
      'A4':          { format: 'A4', landscape: false },
      'A4 Liggande': { format: 'A4', landscape: true  },
      'IG Square':   { width: '600px', height: '600px' },
      'IG Story':    { width: '450px', height: '800px' },
    };
    const cfg  = FORMAT_MAP[format] ?? FORMAT_MAP['A4'];
    const opts = { printBackground: true, margin: { top:0,right:0,bottom:0,left:0 } };
    if (cfg.format) { opts.format = cfg.format; opts.landscape = cfg.landscape; }
    else            { opts.width  = cfg.width;  opts.height    = cfg.height; }

    const pdf = await page.pdf(opts);
    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="manadsblad.pdf"');
    res.send(Buffer.from(pdf));
  } catch (err) {
    console.error('[export]', err);
    res.status(500).json({ error: err.message });
  }
}

function wrapHTML(body) {
  return `<!DOCTYPE html><html lang="sv"><head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Poppins:wght@400;600;700;800&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>*,*::before,*::after{box-sizing:border-box}html,body{margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}</style>
</head><body>${body}</body></html>`;
}

/* Back-redirect / exit intent — oferta VOLTA43 (43% por cor) integrada ao PIX SpeedPag. */
(function () {
  if (window.__lvBackRedirect) return;
  window.__lvBackRedirect = true;

  var CUPOM = 'VOLTA43';
  var BASE_PRICE = 89.90;
  var COLOR_PRICES = { preto: 89.90, branco: 94.90, vermelho: 99.90 };
  var DELAY_MS = 12000;
  var armed = false;
  var shown = false;
  var selectedColor = 'preto';
  var selectedVoltage = '127V';
  try {
    var currentParams = new URLSearchParams(window.location.search);
    var currentColor = (currentParams.get('cor') || localStorage.getItem('corSelecionada') || '').toLowerCase();
    if (currentColor.indexOf('branc') > -1) selectedColor = 'branco';
    else if (currentColor.indexOf('vermelh') > -1) selectedColor = 'vermelho';
    else if (currentColor.indexOf('pret') > -1) selectedColor = 'preto';
    var currentVoltage = currentParams.get('voltagem') || localStorage.getItem('voltagemSelecionada') || '';
    if (/110/.test(currentVoltage)) selectedVoltage = '110V';
    else if (/220/.test(currentVoltage)) selectedVoltage = '220V';
    else if (/127/.test(currentVoltage)) selectedVoltage = '127V';
    var checkoutPrice = Number(currentParams.get('preco'));
    if (checkoutPrice > 0) BASE_PRICE = checkoutPrice;
  } catch (e) {}

  function basePrice() { return COLOR_PRICES[selectedColor] || BASE_PRICE; }
  function discountPrice() { return Math.round(basePrice() * 0.57 * 100) / 100; }

  // Base da pasta /airfryer/ descoberta pelo próprio <script src>, para funcionar
  // tanto em /airfryer/site.html quanto em /telinha/pages/produto-104.html.
  var BASE = (function () {
    try {
      var s = document.currentScript || (function () {
        var all = document.getElementsByTagName('script');
        for (var i = all.length - 1; i >= 0; i--) {
          if ((all[i].src || '').indexOf('backredirect.js') > -1) return all[i];
        }
        return null;
      })();
      if (s && s.src) return new URL('../', s.src).href;
    } catch (e) {}
    return 'airfryer/';
  })();

  function paymentUrl() {
    try {
      var pathname = window.location.pathname || '';
      var telinhaAt = pathname.indexOf('/telinha/');
      var root = telinhaAt >= 0 ? pathname.slice(0, telinhaAt) : '';
      return new URL(root + '/telinha/airfryer/pagamento.html', window.location.origin).href;
    } catch (e) {
      return BASE + 'pagamento.html';
    }
  }

  var IMGS = {
    preto: BASE + 'assets/airfryer-bi-1.jpg',
    branco: BASE + 'assets/airfryer-cor-branco.jpg',
    vermelho: BASE + 'assets/airfryer-1.jpg'
  };

  function fmt(n) { return 'R$ ' + Number(n).toFixed(2).replace('.', ','); }
  function safeJson(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; }
  }

  var cached = safeJson('lvOfferCache');
  if (cached) {
    var cachedGroup = cached.variantGroups && cached.variantGroups.leve2;
    var cachedPrice = Number(cachedGroup && cachedGroup.price > 0 ? cachedGroup.price : cached.price);
    if (cachedPrice > 0) BASE_PRICE = cachedPrice;
  }

  var css = document.createElement('style');
  css.textContent = [
    '@keyframes lvbrIn{from{opacity:0;transform:translateY(30px) scale(.98)}to{opacity:1;transform:none}}',
    '@keyframes lvbrPulse{0%,100%{box-shadow:0 8px 22px rgba(254,44,85,.25)}50%{box-shadow:0 10px 30px rgba(254,44,85,.42)}}',
    '#lv-br{position:fixed;inset:0;z-index:2147483000;display:none;align-items:flex-end;justify-content:center;background:rgba(0,0,0,.64);backdrop-filter:blur(4px);padding:0;font-family:Arial,Helvetica,sans-serif}',
    '#lv-br.open{display:flex}',
    '#lv-br .bx{background:#fff;border-radius:18px 18px 0 0;max-width:430px;width:100%;position:relative;text-align:left;box-shadow:0 -14px 50px rgba(0,0,0,.28);max-height:96vh;overflow:auto;animation:lvbrIn .3s ease-out}',
    '#lv-br .grab{width:38px;height:4px;border-radius:9px;background:#d7d7d7;margin:9px auto 7px}',
    '#lv-br .hd{padding:7px 18px 13px;border-bottom:1px solid #ededed;position:relative;text-align:center}',
    '#lv-br .cl{position:absolute;top:3px;right:12px;border:0;background:#f3f3f3;width:30px;height:30px;border-radius:50%;font-size:20px;line-height:1;color:#555;cursor:pointer}',
    '#lv-br .brand{font-size:12px;font-weight:800;color:#111;display:flex;align-items:center;justify-content:center;gap:5px;margin-bottom:5px}',
    '#lv-br .brand i{width:18px;height:18px;background:#111;color:#fff;border-radius:5px;font-style:normal;display:inline-flex;align-items:center;justify-content:center;font-size:11px}',
    '#lv-br .tag{display:inline-flex;align-items:center;background:#fff0f3;color:#FE2C55;border-radius:4px;padding:3px 7px;font-size:10px;font-weight:800}',
    '#lv-br h3{font-size:21px;font-weight:900;margin:7px 34px 2px;color:#161616;line-height:1.2}',
    '#lv-br .sb{font-size:12px;margin:0;color:#666}',
    '#lv-br .bd{padding:13px 15px 17px}',
    '#lv-br .product{display:flex;align-items:center;gap:11px;border-bottom:1px solid #eee;padding-bottom:12px;margin-bottom:11px}',
    '#lv-br .main-img{width:74px;height:74px;object-fit:contain;border-radius:8px;background:#f7f7f7;flex:none}',
    '#lv-br .prod-info{min-width:0;flex:1}',
    '#lv-br .prod-name{font-size:13px;font-weight:700;color:#222;line-height:1.35;margin:0 0 5px}',
    '#lv-br .pr{display:flex;align-items:baseline;gap:7px;margin:0}',
    '#lv-br .pr .old{font-size:12px;color:#999;text-decoration:line-through}',
    '#lv-br .pr .new{font-size:24px;font-weight:900;color:#FE2C55}',
    '#lv-br .save{display:inline-block;background:#eaf9ef;color:#087c3d;font-size:10px;font-weight:800;border-radius:3px;padding:3px 6px;margin-top:4px}',
    '#lv-br .voucher{display:flex;align-items:center;background:#fff4f6;border:1px solid #ffccd6;border-left:4px solid #FE2C55;border-radius:7px;padding:9px 10px;margin-bottom:12px}',
    '#lv-br .voucher .vtext{flex:1}',
    '#lv-br .voucher .lb{font-size:10px;color:#777;font-weight:700}',
    '#lv-br .voucher .cd{font-size:15px;font-weight:900;color:#111;margin-top:1px}',
    '#lv-br .voucher .tm{font-size:11px;color:#FE2C55;font-weight:800;text-align:right}',
    '#lv-br .hint{font-size:12px;font-weight:700;color:#333;margin:0 0 6px}',
    '#lv-br .options{display:grid;grid-template-columns:1fr 1fr 1fr;gap:7px;margin-bottom:10px}',
    '#lv-br .op{border:1px solid #ddd;border-radius:6px;padding:6px;background:#fff;cursor:pointer;color:#333;font:700 12px Arial,Helvetica,sans-serif;position:relative}',
    '#lv-br .op.on{border:2px solid #FE2C55;padding:5px;background:#fff8f9;color:#FE2C55}',
    '#lv-br .op.on:after{content:"✓";position:absolute;right:2px;bottom:1px;font-size:9px;color:#FE2C55}',
    '#lv-br .op img{width:100%;height:52px;object-fit:contain;display:block;margin-bottom:3px}',
    '#lv-br .volts .op{padding:9px 7px}',
    '#lv-br .volts .op.on{padding:8px 6px}',
    '#lv-br .go{width:100%;border:0;border-radius:6px;padding:15px;background:#FE2C55;color:#fff;font-size:15px;font-weight:900;cursor:pointer;animation:lvbrPulse 1.8s ease-in-out infinite}',
    '#lv-br .no{width:100%;border:0;background:transparent;color:#777;font-size:12px;margin-top:8px;cursor:pointer}',
    '#lv-br .fn{display:flex;align-items:center;justify-content:center;gap:5px;font-size:10.5px;color:#777;margin-top:8px}',
    '@media(min-width:600px){#lv-br{align-items:center;padding:16px}#lv-br .bx{border-radius:18px}.lvbr-desktop-hide{display:none}}'
  ].join('');
  document.head.appendChild(css);

  var el = document.createElement('div');
  el.id = 'lv-br';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML =
    '<div class="bx" role="dialog" aria-modal="true" aria-labelledby="lv-br-title"><div class="grab"></div>' +
    '<div class="hd">' +
    '<button class="cl" aria-label="Fechar">&times;</button>' +
    '<div class="brand"><i>♪</i> TikTok Shop</div>' +
    '<span class="tag">OFERTA EXCLUSIVA NO PIX</span>' +
    '<h3 id="lv-br-title">Antes de sair, resgate seu desconto</h3>' +
    '<p class="sb">Uma condição especial foi liberada para concluir seu pedido.</p>' +
    '</div>' +
    '<div class="bd">' +
    '<div class="product"><img class="main-img" src="' + IMGS.preto + '" alt="Air Fryer Forno 12L"><div class="prod-info"><p class="prod-name">Air Fryer Forno Mondial 12L com 10 funções</p><div class="pr"><span class="new" id="lv-br-new"></span><span class="old" id="lv-br-old"></span></div><div class="save" id="lv-br-save">43% DE DESCONTO</div></div></div>' +
    '<div class="voucher"><div class="vtext"><div class="lb">CUPOM APLICADO</div><div class="cd">' + CUPOM + '</div></div><div class="tm">Expira em<br><span id="lv-br-t">05:00</span></div></div>' +
    '<p class="hint">Escolha a cor:</p>' +
    '<div class="options colors">' +
    '<button type="button" class="op on" data-color="preto"><img src="' + IMGS.preto + '" data-src="' + IMGS.preto + '" alt="Air fryer preto/inox" loading="eager" decoding="sync">Preto</button>' +
    '<button type="button" class="op" data-color="branco"><img src="' + IMGS.branco + '" data-src="' + IMGS.branco + '" alt="Air fryer branco/inox" loading="eager" decoding="sync">Branco</button>' +
    '<button type="button" class="op" data-color="vermelho"><img src="' + IMGS.vermelho + '" data-src="' + IMGS.vermelho + '" alt="Air fryer vermelho/inox" loading="eager" decoding="sync">Vermelho</button></div>' +
    '<p class="hint">Escolha a voltagem:</p>' +
    '<div class="options volts"><button type="button" class="op" data-voltage="110V">110V</button><button type="button" class="op on" data-voltage="127V">127V</button><button type="button" class="op" data-voltage="220V">220V</button></div>' +
    '<button type="button" class="go">RESGATAR OFERTA</button>' +
    '<button type="button" class="no">Continuar saindo</button>' +
    '<div class="fn">&#128274; Compra protegida · PIX com aprovação imediata</div>' +
    '</div></div>';
  document.body.appendChild(el);

  function paint() {
    var original = basePrice();
    var promotional = discountPrice();
    el.querySelector('#lv-br-old').textContent = fmt(original);
    el.querySelector('#lv-br-new').textContent = fmt(promotional);
    el.querySelector('#lv-br-save').textContent = '43% DE DESCONTO · ECONOMIZE ' + fmt(original - promotional);
    el.querySelector('.go').textContent = 'RESGATAR OFERTA POR ' + fmt(promotional);
  }
  function select(group, active) {
    el.querySelectorAll(group + ' .op').forEach(function (button) { button.classList.remove('on'); });
    active.classList.add('on');
  }
  el.querySelectorAll('[data-color]').forEach(function (button) {
    if (button.getAttribute('data-color') === selectedColor) select('.colors', button);
    button.addEventListener('click', function () {
      selectedColor = button.getAttribute('data-color');
      select('.colors', button);
      var main = el.querySelector('.main-img');
      if (main) main.src = IMGS[selectedColor];
      paint();
    });
  });
  el.querySelectorAll('[data-voltage]').forEach(function (button) {
    if (button.getAttribute('data-voltage') === selectedVoltage) select('.volts', button);
    button.addEventListener('click', function () { selectedVoltage = button.getAttribute('data-voltage'); select('.volts', button); });
  });
  var initialMain = el.querySelector('.main-img');
  if (initialMain) initialMain.src = IMGS[selectedColor];
  paint();

  // Garante que as fotos das três cores apareçam sempre.
  el.querySelectorAll('.colors img').forEach(function (img) {
    var src = img.getAttribute('data-src');
    var tries = 0;
    function retry() {
      if (tries >= 3) return;
      tries++;
      window.setTimeout(function () { img.src = src; }, 300 * tries);
    }
    img.addEventListener('error', retry);
    if (img.complete && img.naturalWidth === 0) retry();
  });

  window.setTimeout(function () { armed = true; }, DELAY_MS);

  var timer = null;
  function open(force) {
    if (!force && (!armed || shown)) return;
    if (shown && !force) return;
    if (el.classList.contains('open')) return;
    shown = true;
    try { sessionStorage.setItem('lvBackRedirectShown', '1'); } catch (e) {}
    el.classList.add('open');
    el.setAttribute('aria-hidden', 'false');
    var left = 300;
    var t = el.querySelector('#lv-br-t');
    clearInterval(timer);
    timer = setInterval(function () {
      if (left <= 0) { clearInterval(timer); return; }
      left--;
      var m = Math.floor(left / 60), s = left % 60;
      t.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
    }, 1000);
  }
  function close() { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); clearInterval(timer); }
  try { shown = sessionStorage.getItem('lvBackRedirectShown') === '1'; } catch (e) {}
  el.querySelector('.cl').addEventListener('click', close);
  el.querySelector('.no').addEventListener('click', close);
  el.addEventListener('click', function (e) { if (e.target === el) close(); });

  // CTA → checkout PIX (SpeedPag) com o preço promocional.
  el.querySelector('.go').addEventListener('click', function () {
    var price = discountPrice();
    var corLabel = selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1);
    try {
      localStorage.setItem('corSelecionada', selectedColor);
      localStorage.setItem('voltagemSelecionada', selectedVoltage);
      localStorage.setItem('lvUnitPrice', String(price));
      localStorage.setItem('cupomAplicado', CUPOM);
    } catch (e) {}
    var url = paymentUrl() + '?produto=airfryer' +
      '&cor=' + encodeURIComponent('Air Fryer Forno 12L Mondial (' + corLabel + ', ' + selectedVoltage + ')') +
      '&voltagem=' + encodeURIComponent(selectedVoltage) +
      '&qtd=1&preco=' + price.toFixed(2) + '&cupom=' + CUPOM;
    window.location.assign(url);
  });

  var targets = [];
  try { if (window.top && window.top !== window) targets.push(window.top); } catch (e) {}
  targets.push(window);

  targets.forEach(function (w) {
    try {
      var lastHash = w.location.hash;
      var lastPath = w.location.pathname + w.location.search;
      w.history.pushState({ lvbr: 1 }, '', w.location.href);
      w.history.pushState({ lvbr: 2 }, '', w.location.href);
      w.addEventListener('popstate', function () {
        var path = w.location.pathname + w.location.search;
        var hash = w.location.hash;
        var onlyHash = path === lastPath && hash !== lastHash;
        lastPath = path;
        lastHash = hash;
        if (onlyHash) return;
        open(true);
        try { w.history.pushState({ lvbr: 1 }, '', w.location.href); } catch (e2) {}
      });
    } catch (e) {}
  });

  document.addEventListener('mouseout', function (e) {
    if (!e.relatedTarget && e.clientY <= 0) open();
  });
})();

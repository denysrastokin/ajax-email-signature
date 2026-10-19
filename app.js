(function () {
  'use strict';

  // Публічна адреса папки з зображеннями підпису (банер, іконка YouTube).
  // Порожньо = зображення беруться з того ж сервера, де розміщено цей застосунок.
  // Приклад: 'https://cdn.ajax.systems/email-signature/'
  var ASSET_BASE_URL = '';

  var COMPANY = 'Ajax Systems';
  var SITE_URL = 'https://ajax.systems/';

  // Варіанти посилання під контактами (випадаючий список «Featured link»).
  // Щоб додати новий: id, назва в списку (en/uk), текст посилання в підписі, URL та іконка 20×14 @2x (40×28) у assets/.
  var PROMO_LINKS = [
    {
      id: 'youtube-pro',
      label: { en: 'Ajax PRO YouTube channel', uk: 'YouTube-канал Ajax PRO' },
      text: 'Subscribe to the Ajax PRO YouTube channel',
      url: 'https://www.youtube.com/@AjaxSystemsPRO?sub_confirmation=1',
      icon: { src: 'youtube.png', width: 20, height: 14, alt: 'YouTube' }
    }
  ];
  var DEFAULT_PROMO = 'youtube-pro';

  var GMAIL_LIMIT = 10000;
  var STORAGE_KEY = 'ajax-signature-v2';
  var FONT = "Roboto, Arial, Helvetica, sans-serif";
  var INK = '#222222';
  // Ім'я трохи більше за решту тексту (14px / 21px).
  var NAME = { fontSize: 17, lineHeight: 25 };
  // Фото ліворуч від контактів: висота = рядок імені (25px) + 3 рядки тексту по 21px = 88px.
  var PHOTO = { size: 88, radius: 16, gap: 10, minSource: 176 };
  // Іконки соцмереж і месенджерів під контактами: круглі, 20px (файли 40×40 для Retina).
  var SOCIAL = { size: 20, gap: 8 };

  var I18N = {
    uk: {
      appTitle: 'Email-підпис',
      formTitle: 'Ваші дані',
      formLead: 'Заповніть поля латиницею — підпис оновлюється одразу.',
      fName: "Ім'я та прізвище",
      fTitle: 'Посада',
      fPromo: 'Додаткове посилання',
      promoNone: '— Без посилання —',
      fMobile: 'Мобільний',
      fEmail: 'Email',
      emailError: 'Перевірте формат email',
      fPhoto: "Посилання на фото (необов'язково)",
      photoHint: 'Квадратне зображення від 176×176 px, публічне https-посилання.',
      photoNotHttps: 'Потрібне посилання, що починається з https:// — інакше фото не додається в підпис.',
      photoLoadError: 'Не вдалося завантажити зображення. Перевірте, що посилання публічне і веде прямо на картинку.',
      photoNotSquare: 'Фото не квадратне — у підписі воно буде розтягнуте. Обріжте його до квадрата.',
      photoSmall: 'Фото менше 176×176 px — на екранах Retina воно може бути нечітким.',
      photoDrive: 'Це посилання на сторінку перегляду (Google Drive / OneDrive / SharePoint), а не на саму картинку. Використайте пряме посилання на файл зображення.',
      socialTitle: 'Додати соцмережі та месенджери',
      waSame: 'Такий самий, як мобільний',
      linkedinInvalid: 'Потрібне посилання на профіль LinkedIn, напр. linkedin.com/in/john-smith.',
      telegramInvalid: 'Вкажіть нікнейм Telegram (@username, 5–32 символи: латиниця, цифри, _) або посилання t.me/username.',
      whatsappInvalid: 'Вкажіть номер у міжнародному форматі з «+» і кодом країни, напр. +380 50 123 4567.',
      blocks: 'Блоки підпису',
      tBanner: 'Банер Ajax з нагородами',
      previewTitle: "Прев'ю",
      desktop: "Комп'ютер",
      mobile: 'Телефон',
      noticeTitle: 'Зображення поки локальні.',
      noticeText: 'Розмістіть застосунок на публічному сервері (або вкажіть ASSET_BASE_URL в app.js), інакше банер та іконка не відобразяться в листах.',
      copy: 'Скопіювати підпис',
      copyHtml: 'Скопіювати HTML-код',
      download: 'Завантажити .htm',
      copied: 'Скопійовано!',
      copiedHint: 'Підпис у буфері обміну — вставте його в налаштуваннях пошти за інструкцією нижче.',
      copiedHtmlHint: 'HTML-код скопійовано.',
      copyFail: 'Не вдалося скопіювати автоматично. Виділіть підпис у прев\'ю мишею та натисніть Ctrl+C.',
      required: "Заповніть обов'язкові поля: ім'я, посаду та коректний email.",
      tooLong: 'Підпис довший за ліміт Gmail (10 000 символів).',
      howTitle: 'Як встановити підпис',
      gmailSteps:
        '<li>Натисніть <b>«Скопіювати підпис»</b>.</li>' +
        '<li>У Gmail на комп\'ютері відкрийте ⚙ <b>Налаштування → Переглянути всі налаштування</b>.</li>' +
        '<li>На вкладці <b>Загальні</b> знайдіть розділ <b>Підпис</b> і натисніть <b>+ Створити</b>, введіть будь-яку назву.</li>' +
        '<li>Клікніть у поле підпису та вставте: <kbd>Ctrl</kbd> + <kbd>V</kbd> (Mac: <kbd>⌘</kbd> + <kbd>V</kbd>).</li>' +
        '<li>У блоці <b>Налаштування підпису за замовчуванням</b> оберіть його для нових листів і для відповідей/пересилань.</li>' +
        '<li>Прокрутіть сторінку донизу й натисніть <b>Зберегти зміни</b>.</li>',
      outlookSteps:
        '<li>Натисніть <b>«Скопіювати підпис»</b>.</li>' +
        '<li>У новому Outlook або Outlook в браузері відкрийте ⚙ <b>Налаштування → Облікові записи → Підписи</b>.</li>' +
        '<li>Натисніть <b>+ Новий підпис</b> і введіть назву.</li>' +
        '<li>Клікніть у поле редактора та вставте: <kbd>Ctrl</kbd> + <kbd>V</kbd> (Mac: <kbd>⌘</kbd> + <kbd>V</kbd>).</li>' +
        '<li>Нижче оберіть підпис за замовчуванням для нових повідомлень і для відповідей/пересилань.</li>' +
        '<li>Натисніть <b>Зберегти</b>.</li>',
      classicSteps:
        '<li>Натисніть <b>«Скопіювати підпис»</b>.</li>' +
        '<li>В Outlook відкрийте <b>Файл → Параметри → Пошта → Підписи…</b></li>' +
        '<li>Натисніть <b>Створити</b> та введіть назву.</li>' +
        '<li>Клікніть у поле <b>Редагування підпису</b> та вставте: <kbd>Ctrl</kbd> + <kbd>V</kbd>.</li>' +
        '<li>Праворуч оберіть цей підпис для <b>Нових повідомлень</b> і <b>Відповідей/пересилань</b>, натисніть <b>OK</b>.</li>' +
        '<li>Альтернатива: збережіть файл кнопкою <b>«Завантажити .htm»</b> і покладіть його в папку <kbd>%APPDATA%\\Microsoft\\Signatures</kbd> — підпис з\'явиться у списку.</li>',
      mobileNote: 'Мобільні застосунки Gmail та Outlook мають окремий, лише текстовий підпис — його налаштовують в самому застосунку. Листи, надіслані з комп\'ютера, на телефонах отримувачів виглядають коректно: банер підлаштовується під ширину екрана.'
    },
    en: {
      appTitle: 'Email signature',
      formTitle: 'Your details',
      formLead: 'Fill in the fields in Latin characters — the signature updates instantly.',
      fName: 'Full name',
      fTitle: 'Job title',
      fPromo: 'Featured link',
      promoNone: '— No link —',
      fMobile: 'Mobile',
      fEmail: 'Email',
      emailError: 'Please check the email format',
      fPhoto: 'Photo URL (optional)',
      photoHint: 'Square image, at least 176×176 px, public https link.',
      photoNotHttps: 'The link must start with https:// — otherwise the photo is not added to the signature.',
      photoLoadError: 'Could not load the image. Make sure the link is public and points directly to the image.',
      photoNotSquare: 'The photo is not square — it will be stretched in the signature. Crop it to a square.',
      photoSmall: 'The photo is smaller than 176×176 px — it may look blurry on Retina screens.',
      photoDrive: 'This is a viewer page link (Google Drive / OneDrive / SharePoint), not the image itself. Use a direct link to the image file.',
      socialTitle: 'Add social networks & messengers',
      waSame: 'Same as mobile',
      linkedinInvalid: 'Use a link to a LinkedIn profile, e.g. linkedin.com/in/john-smith.',
      telegramInvalid: 'Enter a Telegram username (@username, 5–32 characters: Latin letters, digits, _) or a t.me/username link.',
      whatsappInvalid: 'Enter the number in international format with “+” and country code, e.g. +380 50 123 4567.',
      blocks: 'Signature blocks',
      tBanner: 'Ajax banner with awards',
      previewTitle: 'Preview',
      desktop: 'Desktop',
      mobile: 'Mobile',
      noticeTitle: 'Images are local for now.',
      noticeText: 'Host the app on a public server (or set ASSET_BASE_URL in app.js), otherwise the banner and icon will not show up in emails.',
      copy: 'Copy signature',
      copyHtml: 'Copy HTML code',
      download: 'Download .htm',
      copied: 'Copied!',
      copiedHint: 'The signature is on your clipboard — paste it in your mail settings as described below.',
      copiedHtmlHint: 'HTML code copied.',
      copyFail: 'Automatic copy failed. Select the signature in the preview with your mouse and press Ctrl+C.',
      required: 'Please fill in the required fields: name, job title and a valid email.',
      tooLong: 'The signature exceeds the Gmail limit (10,000 characters).',
      howTitle: 'How to install the signature',
      gmailSteps:
        '<li>Click <b>“Copy signature”</b>.</li>' +
        '<li>In Gmail on desktop open ⚙ <b>Settings → See all settings</b>.</li>' +
        '<li>On the <b>General</b> tab find <b>Signature</b>, click <b>+ Create new</b> and enter any name.</li>' +
        '<li>Click into the signature box and paste: <kbd>Ctrl</kbd> + <kbd>V</kbd> (Mac: <kbd>⌘</kbd> + <kbd>V</kbd>).</li>' +
        '<li>Under <b>Signature defaults</b> select it for new emails and for replies/forwards.</li>' +
        '<li>Scroll to the bottom and click <b>Save Changes</b>.</li>',
      outlookSteps:
        '<li>Click <b>“Copy signature”</b>.</li>' +
        '<li>In new Outlook or Outlook on the web open ⚙ <b>Settings → Accounts → Signatures</b>.</li>' +
        '<li>Click <b>+ New signature</b> and enter a name.</li>' +
        '<li>Click into the editor and paste: <kbd>Ctrl</kbd> + <kbd>V</kbd> (Mac: <kbd>⌘</kbd> + <kbd>V</kbd>).</li>' +
        '<li>Below, choose it as default for new messages and for replies/forwards.</li>' +
        '<li>Click <b>Save</b>.</li>',
      classicSteps:
        '<li>Click <b>“Copy signature”</b>.</li>' +
        '<li>In Outlook open <b>File → Options → Mail → Signatures…</b></li>' +
        '<li>Click <b>New</b> and enter a name.</li>' +
        '<li>Click into the <b>Edit signature</b> box and paste: <kbd>Ctrl</kbd> + <kbd>V</kbd>.</li>' +
        '<li>On the right, pick it for <b>New messages</b> and <b>Replies/forwards</b>, then click <b>OK</b>.</li>' +
        '<li>Alternative: save the file with <b>“Download .htm”</b> and put it into <kbd>%APPDATA%\\Microsoft\\Signatures</kbd> — it will appear in the list.</li>',
      mobileNote: 'The Gmail and Outlook mobile apps use a separate, text-only signature configured inside the app. Emails sent from desktop look right on recipients’ phones: the banner scales to the screen width.'
    }
  };

  var $ = function (id) { return document.getElementById(id); };
  var form = $('form');
  var frame = $('preview');
  var fields = ['name', 'title', 'mobile', 'email', 'photo', 'linkedin', 'telegram', 'whatsapp'];
  var lang = 'en';

  // ---------- helpers ----------
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function telHref(s) {
    // «(0)» у міжнародному форматі (+44 (0) 7749…) при наборі не використовується.
    var t = s.trim().replace(/\(\s*0\s*\)/g, '');
    var digits = t.replace(/[^\d]/g, '');
    return 'tel:' + (t.charAt(0) === '+' ? '+' : '') + digits;
  }
  function isHttpsUrl(s) { return /^https:\/\/[^\s"'<>]+$/i.test(s || ''); }
  function isViewerLink(s) { return /(drive\.google\.com|docs\.google\.com|1drv\.ms|onedrive\.live\.com|sharepoint\.com)/i.test(s); }
  // Соцмережі: повертають готовий URL, '' для порожнього поля або null, якщо значення не розпізнано.
  function linkedinUrl(s) {
    if (!s) return '';
    var v = /^https?:\/\//i.test(s) ? s : 'https://' + s.replace(/^\/+/, '');
    try {
      var u = new URL(v);
      if (!/(^|\.)linkedin\.com$/i.test(u.hostname) || u.pathname.length < 2) return null;
      return 'https://www.linkedin.com' + u.pathname.replace(/\/+$/, '');
    } catch (e) { return null; }
  }
  function telegramUrl(s) {
    if (!s) return '';
    var u = s.replace(/^(https?:\/\/)?(www\.)?(t\.me|telegram\.me)\//i, '').replace(/^@/, '').replace(/\/+$/, '');
    return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(u) ? 'https://t.me/' + u : null;
  }
  function whatsappUrl(s) {
    if (!s) return '';
    var t = s.trim().replace(/\(\s*0\s*\)/g, '');
    var digits = t.replace(/[^\d]/g, '');
    return t.charAt(0) === '+' && digits.length >= 8 && digits.length <= 15 ? 'https://wa.me/' + digits : null;
  }
  function socialLinks(d) {
    var wa = d.waSame ? d.mobile : d.whatsapp;
    return [
      { url: linkedinUrl(d.linkedin), icon: 'linkedin.png', alt: 'LinkedIn' },
      { url: telegramUrl(d.telegram), icon: 'telegram.png', alt: 'Telegram' },
      { url: whatsappUrl(wa), icon: 'whatsapp.png', alt: 'WhatsApp' }
    ].filter(function (x) { return x.url; });
  }
  function isEmail(s) { return /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(s); }
  function t(key) { return I18N[lang][key] || I18N.en[key] || ''; }

  function assetBase() {
    if (ASSET_BASE_URL) return ASSET_BASE_URL.replace(/\/?$/, '/');
    return new URL('assets/', location.href).href;
  }
  function assetsArePublic() {
    if (ASSET_BASE_URL) return true;
    var h = location.hostname;
    return /^https?:$/.test(location.protocol) && !/^(localhost|127\.0\.0\.1|\[::1\]|.*\.local|.*\.test)$/.test(h);
  }

  function data() {
    var d = {};
    fields.forEach(function (f) { d[f] = $(f).value.trim(); });
    d.promo = $('promo').value;
    d.showBanner = $('showBanner').checked;
    d.waSame = $('waSame').checked;
    return d;
  }

  function findPromo(id) {
    for (var i = 0; i < PROMO_LINKS.length; i++) if (PROMO_LINKS[i].id === id) return PROMO_LINKS[i];
    return null;
  }

  function renderPromoOptions() {
    var select = $('promo');
    var value = select.value;
    select.innerHTML = '';
    select.appendChild(new Option(t('promoNone'), ''));
    PROMO_LINKS.forEach(function (p) { select.appendChild(new Option(p.label[lang] || p.label.en, p.id)); });
    select.value = value;
  }

  // ---------- signature markup ----------
  // Таблична верстка + inline-стилі: Gmail вирізає <style>, Outlook (Word) не знає flex/grid/max-width.
  // Ширина банера задана атрибутом width (для Outlook) та width:100%/max-width (для адаптиву в решті клієнтів).
  function buildSignature(d) {
    var base = assetBase();
    var name = d.name || 'John Smith';
    var title = d.title || 'Marketing Manager';
    var text = 'font-family:' + FONT + ';font-size:14px;line-height:21px;mso-line-height-rule:exactly;color:' + INK + ';';
    var link = 'color:' + INK + ';text-decoration:none;';

    // Ім'я окремим блоком: Outlook застосовує line-height до всього абзацу, тож різні висоти рядків мають бути в різних блоках.
    var nameBlock = '<div style="font-size:' + NAME.fontSize + 'px;line-height:' + NAME.lineHeight + 'px;mso-line-height-rule:exactly;font-weight:700;">' + esc(name) + '</div>';
    var lines = [esc(title) + ' | ' + COMPANY];
    // Поки форма порожня, у прев'ю показуємо приклад повністю, разом з телефоном.
    var pristine = !d.name && !d.title && !d.mobile && !d.email;
    var mobile = d.mobile || (pristine ? '+380 50 123 4567' : '');
    if (mobile) {
      lines.push('<b style="font-weight:700;">Mobile:</b> <a href="' + esc(telHref(mobile)) + '" style="' + link + '">' + esc(mobile) + '</a>');
    }
    var email = d.email || 'smith.j@ajax.systems';
    lines.push('<b style="font-weight:700;">Email:</b> <a href="mailto:' + esc(email) + '" style="' + link + '">' + esc(email) + '</a>');

    var rows = [];
    var socials = socialLinks(d);
    var socialRow = '';
    if (socials.length) {
      socialRow =
        '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>' +
        socials.map(function (sl, i) {
          var pad = i === socials.length - 1 ? 0 : SOCIAL.gap;
          return '<td style="padding:8px ' + pad + 'px 0 0;line-height:0;">' +
            '<a href="' + esc(sl.url) + '" target="_blank" style="text-decoration:none;">' +
              '<img src="' + base + sl.icon + '" width="' + SOCIAL.size + '" height="' + SOCIAL.size + '" alt="' + sl.alt + '" ' +
              'style="display:block;width:' + SOCIAL.size + 'px;height:' + SOCIAL.size + 'px;border:0;outline:none;">' +
            '</a></td>';
        }).join('') +
        '</tr></table>';
    }
    var contacts = '<td style="' + text + 'padding:0;vertical-align:top;">' + nameBlock + '<div>' + lines.join('<br>') + '</div>' + socialRow + '</td>';
    if (isHttpsUrl(d.photo)) {
      // Вкладена таблиця: фото ліворуч, контакти праворуч. border-radius ігнорує лише класичний Outlook (кути будуть прямі).
      contacts =
        '<td style="padding:0;">' +
          '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>' +
            '<td width="' + (PHOTO.size + PHOTO.gap) + '" valign="top" style="width:' + (PHOTO.size + PHOTO.gap) + 'px;padding:0;vertical-align:top;line-height:0;">' +
              '<img src="' + esc(d.photo) + '" width="' + PHOTO.size + '" height="' + PHOTO.size + '" alt="' + esc(name) + '" ' +
              'style="display:block;width:' + PHOTO.size + 'px;height:' + PHOTO.size + 'px;border:0;outline:none;border-radius:' + PHOTO.radius + 'px;">' +
            '</td>' +
            contacts +
          '</tr></table>' +
        '</td>';
    }
    rows.push('<tr>' + contacts + '</tr>');

    var promo = findPromo(d.promo);
    if (promo) {
      var iconCell = '';
      if (promo.icon) {
        var ic = promo.icon;
        iconCell =
          '<td style="padding:0 8px 0 0;vertical-align:middle;line-height:0;">' +
            '<a href="' + esc(promo.url) + '" target="_blank" style="text-decoration:none;">' +
              '<img src="' + base + ic.src + '" width="' + ic.width + '" height="' + ic.height + '" alt="' + esc(ic.alt) + '" ' +
              'style="display:block;width:' + ic.width + 'px;height:' + ic.height + 'px;border:0;outline:none;">' +
            '</a></td>';
      }
      rows.push(
        '<tr><td style="padding:18px 0 0 0;">' +
          '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;"><tr>' +
            iconCell +
            '<td style="' + text + 'vertical-align:middle;padding:0;">' +
              '<a href="' + esc(promo.url) + '" target="_blank" style="color:' + INK + ';text-decoration:underline;">' + esc(promo.text) + '</a>' +
            '</td>' +
          '</tr></table>' +
        '</td></tr>'
      );
    }

    if (d.showBanner) {
      rows.push(
        '<tr><td style="padding:18px 0 0 0;line-height:0;font-size:0;">' +
          '<a href="' + SITE_URL + '" target="_blank" style="text-decoration:none;">' +
            '<img src="' + base + 'ajax-banner.jpg" width="420" alt="Ajax Systems — award-winning security systems" ' +
            'style="display:block;width:100%;max-width:420px;height:auto;border:0;outline:none;' + 'font-family:' + FONT + ';font-size:14px;line-height:21px;color:' + INK + ';">' +
          '</a>' +
        '</td></tr>'
      );
    }

    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="420" ' +
      'style="border-collapse:collapse;width:100%;max-width:420px;mso-table-lspace:0pt;mso-table-rspace:0pt;">' +
      rows.join('') + '</table>';
  }

  function buildPlain(d) {
    var out = [d.name || 'John Smith', (d.title || 'Marketing Manager') + ' | ' + COMPANY];
    if (d.mobile) out.push('Mobile: ' + d.mobile);
    out.push('Email: ' + (d.email || 'smith.j@ajax.systems'));
    var promo = findPromo(d.promo);
    if (promo) out.push('', promo.text + ': ' + promo.url);
    socialLinks(d).forEach(function (sl) { out.push(sl.alt + ': ' + sl.url); });
    if (d.showBanner) out.push('', SITE_URL);
    return out.join('\n');
  }

  function fullDocument(sig, d) {
    return '<!DOCTYPE html>\n<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(d.name || 'Signature') + '</title></head>' +
      '<body style="margin:0;padding:0;">' + sig + '</body></html>';
  }

  // ---------- preview ----------
  var current = { html: '', plain: '' };

  function render() {
    var d = data();
    current.html = buildSignature(d);
    current.plain = buildPlain(d);

    var doc = frame.contentDocument;
    doc.open();
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff;}</style></head><body>' + current.html + '</body></html>');
    doc.close();
    fitFrame();
    var imgs = doc.images;
    for (var i = 0; i < imgs.length; i++) imgs[i].addEventListener('load', fitFrame);

    save(d);
  }

  function fitFrame() {
    var doc = frame.contentDocument;
    if (!doc || !doc.body) return;
    frame.style.height = '0px';
    var pad = parseFloat(getComputedStyle(frame).paddingBottom) || 0;
    frame.style.height = (doc.documentElement.scrollHeight + pad) + 'px';
  }

  // ---------- storage ----------
  function save(d) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ d: d, lang: lang })); } catch (e) { /* noop */ }
  }
  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!s) return;
      if (s.d) {
        fields.forEach(function (f) { if (typeof s.d[f] === 'string') $(f).value = s.d[f]; });
        if (typeof s.d.promo === 'string') $('promo').value = findPromo(s.d.promo) ? s.d.promo : '';
        if (typeof s.d.showBanner === 'boolean') $('showBanner').checked = s.d.showBanner;
        if (typeof s.d.waSame === 'boolean') $('waSame').checked = s.d.waSame;
      }
      if (s.lang && I18N[s.lang]) lang = s.lang;
    } catch (e) { /* noop */ }
  }

  // ---------- i18n ----------
  function applyLang() {
    document.documentElement.lang = lang === 'uk' ? 'uk' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    renderPromoOptions();
    ['photo-warning', 'linkedin-warning', 'telegram-warning', 'whatsapp-warning'].forEach(function (id) {
      var w = $(id);
      if (w.dataset.key) w.textContent = t(w.dataset.key);
    });
    document.querySelectorAll('.lang__btn').forEach(function (b) { b.classList.toggle('is-active', b.dataset.lang === lang); });
    setStatus('');
  }

  // ---------- validation ----------
  function validate(showErrors) {
    var ok = true;
    ['name', 'title'].forEach(function (f) {
      var bad = !$(f).value.trim();
      if (bad) ok = false;
      if (showErrors) $(f).classList.toggle('is-invalid', bad);
    });
    var e = $('email').value.trim();
    var badEmail = !isEmail(e);
    if (badEmail) ok = false;
    if (showErrors || (e && badEmail === false)) $('email').classList.toggle('is-invalid', badEmail);
    return ok;
  }

  // ---------- copy ----------
  function setStatus(msg, isError) {
    var s = $('status');
    s.textContent = msg;
    s.classList.toggle('is-error', !!isError);
  }

  // Після анімації повертаємо підпис кнопки з перекладів, а не з тексту на момент кліку:
  // інакше повторний клік під час анімації назавжди залишить «Copied!».
  function flash(btn) {
    var label = btn.querySelector('[data-i18n]') || btn;
    clearTimeout(btn._flashTimer);
    btn.classList.add('btn--done');
    label.textContent = t('copied');
    btn._flashTimer = setTimeout(function () {
      btn.classList.remove('btn--done');
      label.textContent = t(label.getAttribute('data-i18n'));
    }, 1800);
  }

  function copyRich() {
    var html = '<meta charset="utf-8">' + current.html;
    if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
      return navigator.clipboard.write([new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([current.plain], { type: 'text/plain' })
      })]).then(function () { return true; }, copyBySelection);
    }
    return Promise.resolve(copyBySelection());
  }

  // Запасний варіант: виділяємо відрендерений підпис у прев'ю й копіюємо як у звичайному браузері.
  function copyBySelection() {
    try {
      var doc = frame.contentDocument;
      var win = frame.contentWindow;
      var range = doc.createRange();
      range.selectNodeContents(doc.body);
      var sel = win.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      var ok = doc.execCommand('copy');
      sel.removeAllRanges();
      return ok;
    } catch (e) { return false; }
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyText(text); });
    }
    return Promise.resolve(legacyText(text));
  }
  function legacyText(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { /* noop */ }
    document.body.removeChild(ta);
    return ok;
  }

  function guard() {
    if (!validate(true)) { setStatus(t('required'), true); return false; }
    if (current.html.length > GMAIL_LIMIT) { setStatus(t('tooLong'), true); }
    return true;
  }

  $('copyBtn').addEventListener('click', function () {
    if (!guard()) return;
    var btn = this;
    copyRich().then(function (ok) {
      if (ok) { flash(btn); setStatus(t('copiedHint')); } else { setStatus(t('copyFail'), true); }
    });
  });

  $('copyHtmlBtn').addEventListener('click', function () {
    if (!guard()) return;
    var btn = this;
    copyText(current.html).then(function (ok) {
      if (ok) { flash(btn); setStatus(t('copiedHtmlHint')); } else { setStatus(t('copyFail'), true); }
    });
  });

  $('downloadBtn').addEventListener('click', function () {
    if (!guard()) return;
    var d = data();
    var blob = new Blob([fullDocument(current.html, d)], { type: 'text/html;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'Ajax - ' + (d.name || 'signature').replace(/[\\/:*?"<>|]+/g, '') + '.htm';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });

  // ---------- UI wiring ----------
  // ---------- photo check ----------
  var photoTimer = null;
  var photoToken = 0;
  function showPhotoWarning(key) {
    var w = $('photo-warning');
    w.dataset.key = key || '';
    w.textContent = key ? t(key) : '';
    w.hidden = !key;
  }
  function checkPhoto() {
    var url = $('photo').value.trim();
    var token = ++photoToken;
    if (!url) return showPhotoWarning('');
    if (!isHttpsUrl(url)) return showPhotoWarning('photoNotHttps');
    if (isViewerLink(url)) return showPhotoWarning('photoDrive');
    var img = new Image();
    img.onload = function () {
      if (token !== photoToken) return;
      var w = img.naturalWidth, h = img.naturalHeight;
      if (Math.abs(w - h) / Math.max(w, h) > 0.02) showPhotoWarning('photoNotSquare');
      else if (Math.min(w, h) < PHOTO.minSource) showPhotoWarning('photoSmall');
      else showPhotoWarning('');
    };
    img.onerror = function () { if (token === photoToken) showPhotoWarning('photoLoadError'); };
    img.src = url;
  }
  $('photo').addEventListener('input', function () {
    clearTimeout(photoTimer);
    photoTimer = setTimeout(checkPhoto, 400);
  });

  form.addEventListener('input', function (e) {
    if (e.target.classList.contains('is-invalid')) validate(true);
    render();
  });
  form.addEventListener('change', render);
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  // ---------- social fields ----------
  var SOCIAL_FIELDS = { linkedin: linkedinUrl, telegram: telegramUrl, whatsapp: whatsappUrl };
  // Під час набору лише ховаємо попередження, коли значення стало правильним; показуємо його на blur.
  function checkSocial(id, strict) {
    var input = $(id);
    var warn = $(id + '-warning');
    var bad = !input.disabled && SOCIAL_FIELDS[id](input.value.trim()) === null;
    if (!bad) { warn.hidden = true; warn.dataset.key = ''; return; }
    if (!strict && warn.hidden) return;
    warn.dataset.key = id + 'Invalid';
    warn.textContent = t(warn.dataset.key);
    warn.hidden = false;
  }
  function syncWaSame() {
    var same = $('waSame').checked;
    var wa = $('whatsapp');
    wa.disabled = same;
    if (same) wa.value = $('mobile').value;
    checkSocial('whatsapp', true);
  }
  Object.keys(SOCIAL_FIELDS).forEach(function (id) {
    $(id).addEventListener('input', function () { checkSocial(id, false); });
    $(id).addEventListener('blur', function () { checkSocial(id, true); });
  });
  $('waSame').addEventListener('change', syncWaSame);
  $('mobile').addEventListener('input', function () { if ($('waSame').checked) syncWaSame(); });

  $('email').addEventListener('blur', function () {
    var v = this.value.trim();
    this.classList.toggle('is-invalid', !!v && !isEmail(v));
  });

  document.querySelectorAll('.seg__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.seg__btn').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      $('mail').classList.toggle('is-mobile', b.dataset.width === 'mobile');
      setTimeout(fitFrame, 320);
    });
  });

  document.querySelectorAll('.tabs__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.tabs__btn').forEach(function (x) {
        var on = x === b;
        x.classList.toggle('is-active', on);
        x.setAttribute('aria-selected', on ? 'true' : 'false');
      });
      document.querySelectorAll('.steps').forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.tab; });
    });
  });

  document.querySelectorAll('.lang__btn').forEach(function (b) {
    b.addEventListener('click', function () { lang = b.dataset.lang; applyLang(); save(data()); });
  });

  window.addEventListener('resize', fitFrame);

  // ---------- init ----------
  renderPromoOptions();
  $('promo').value = DEFAULT_PROMO;
  load();
  applyLang();
  $('hostingNotice').hidden = assetsArePublic();
  syncWaSame();
  // Блок соцмереж згорнутий, але відкривається сам, якщо щось уже заповнено.
  if ($('linkedin').value || $('telegram').value || $('whatsapp').value || $('waSame').checked) {
    $('socialBlock').open = true;
  }
  render();
  checkPhoto();
})();

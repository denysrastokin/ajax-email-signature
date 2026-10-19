(function () {
  'use strict';

  // Адреса цього скрипта: основна сторінка (/) і варіант C (/c/) підключають один app.js з кореня,
  // тож папку assets/ шукаємо поруч зі скриптом, а не з поточною сторінкою.
  var SCRIPT_URL = (document.currentScript && document.currentScript.src) || location.href;

  // Публічна адреса папки з зображеннями підпису (банер, іконка YouTube).
  // Порожньо = зображення беруться з того ж сервера, де розміщено цей застосунок.
  // Приклад: 'https://cdn.ajax.systems/email-signature/'
  var ASSET_BASE_URL = '';

  var COMPANY = 'Ajax Systems';
  // Домен пошти зафіксований: користувач вводить лише частину до «@».
  var EMAIL_DOMAIN = 'ajax.systems';
  var SITE_URL = 'https://ajax.systems/';

  // Варіанти промо-блоку внизу підпису (випадаючий список «Promo block»); у підписі показується один вибраний.
  // type 'link'   — текстове посилання з іконкою: text, url, icon (файл у assets/ подвійного розміру).
  // type 'banner' — картинка на всю ширину підпису: url, image (файл у assets/ шириною 2× від width).
  // type 'logo'   — лише логотип фіксованого розміру: url, image (width, height; файл у assets/ подвійного розміру).
  var PROMO_LINKS = [
    {
      id: 'youtube-pro',
      type: 'link',
      label: { en: 'Ajax PRO YouTube channel', uk: 'YouTube-канал Ajax PRO' },
      text: 'Subscribe to the Ajax PRO YouTube channel',
      url: 'https://www.youtube.com/@AjaxSystemsPRO?sub_confirmation=1',
      icon: { src: 'youtube.png', width: 20, height: 14, alt: 'YouTube' }
    },
    {
      id: 'ajax-banner',
      type: 'banner',
      label: { en: 'Ajax banner with awards', uk: 'Банер Ajax з нагородами' },
      url: SITE_URL,
      image: { src: 'ajax-banner.jpg', width: 420, alt: 'Ajax Systems — award-winning security systems' }
    },
    {
      id: 'ajax-logo',
      type: 'logo',
      label: { en: 'Ajax logo', uk: 'Логотип Ajax' },
      url: SITE_URL,
      image: { src: 'ajax-logo.png', width: 98, height: 22, alt: 'Ajax Systems' }
    }
  ];
  var DEFAULT_PROMO = 'youtube-pro';

  var GMAIL_LIMIT = 10000;
  var STORAGE_KEY = 'ajax-signature-v2';
  var FONT = "Roboto, Arial, Helvetica, sans-serif";
  var INK = '#222222';
  // Роздільна лінія над підписом: відділяє його від тексту листа.
  var DIVIDER = { color: '#DDDDDD', gap: 16 };
  // Ім'я трохи більше за решту тексту (14px / 21px).
  var NAME = { fontSize: 19, lineHeight: 27 };
  // Фото ліворуч від контактів: висота = рядок імені (27px) + 3 рядки тексту по 21px = 90px.
  var PHOTO = { size: 90, radius: 16, gap: 10, minSource: 180 };
  // Іконки соцмереж і месенджерів під контактами: круглі, 22px (файли 44×44 для Retina).
  var SOCIAL = { size: 22, gap: 8 };
  // Кнопка «Book a meeting» у рядку з іконками: та сама висота, що й іконки; без картинок, тож видно і з вимкненими зображеннями.
  // Дизайн Modern: кругле фото поруч з іменем, контакти колонками з підписами, сіра плашка з іконками й кнопкою.
  var MODERN = {
    photo: 56, photoGap: 14, section: 16, colGap: 32, colGapY: 6,
    muted: '#6B6B6B', label: '#8A8A8A',
    barBg: '#F2F2F2', barRadius: 12, barPadY: 8, barPadX: 10, buttonHeight: 26
  };
  var DESIGNS = ['classic', 'modern'];
  var DEFAULT_DESIGN = 'classic';
  var MEETING = { text: 'Book a meeting', height: 22, padX: 12, gapAfter: 12, bg: '#222222', color: '#FFFFFF' };

  var I18N = {
    uk: {
      appTitle: 'Email-підпис',
      formTitle: 'Ваші дані',
      fDesign: 'Дизайн підпису',
      formLead: 'Заповніть поля латиницею — підпис оновлюється одразу.',
      fName: "Ім'я та прізвище",
      fTitle: 'Посада',
      fPromo: 'Промо-блок',
      promoNone: '— Без промо —',
      fMobile: 'Мобільний',
      fEmail: 'Email',
      emailError: 'Лише частина до «@»: латинські літери, цифри, крапка, дефіс або підкреслення.',
      fPhoto: "Посилання на фото (необов'язково)",
      photoHint: 'Квадратне зображення від 180×180 px, публічне https-посилання.',
      photoNotHttps: 'Потрібне посилання, що починається з https:// — інакше фото не додається в підпис.',
      photoLoadError: 'Не вдалося завантажити зображення. Перевірте, що посилання публічне і веде прямо на картинку.',
      photoNotSquare: 'Фото не квадратне — у підписі воно буде розтягнуте. Обріжте його до квадрата.',
      photoSmall: 'Фото менше 180×180 px — на екранах Retina воно може бути нечітким.',
      photoDrive: 'Це посилання на сторінку перегляду (Google Drive / OneDrive / SharePoint), а не на саму картинку. Використайте пряме посилання на файл зображення.',
      socialTitle: 'Додати соцмережі та месенджери',
      waSame: 'Такий самий, як мобільний',
      linkedinInvalid: 'Потрібне посилання на профіль LinkedIn, напр. linkedin.com/in/john-smith.',
      telegramInvalid: 'Вкажіть нікнейм Telegram (@username, 5–32 символи: латиниця, цифри, _) або посилання t.me/username.',
      whatsappInvalid: 'Вкажіть номер у міжнародному форматі з «+» і кодом країни, напр. +380 50 123 4567.',
      fMeeting: 'Посилання для запису на зустріч (Calendly, Google Calendar)',
      msButton: 'Кнопка «Book a meeting»',
      msIcon: 'Іконка календаря',
      meetingInvalid: 'Потрібне посилання https:// на сторінку запису, напр. calendly.com/john-smith.',
      meetingUnknown: 'Не схоже на Calendly чи Google Calendar — перевірте, що посилання відкриває сторінку запису на зустріч.',
      previewTitle: "Прев'ю",
      desktop: "Комп'ютер",
      mobile: 'Телефон',
      copy: 'Скопіювати підпис',
      copyHtml: 'Скопіювати HTML-код',
      download: 'Завантажити .htm',
      copied: 'Скопійовано!',
      copiedHint: 'Підпис у буфері обміну — вставте його в налаштуваннях пошти за інструкцією нижче.',
      copiedHtmlHint: 'HTML-код скопійовано.',
      copyLink: 'Скопіювати посилання на підпис',
      copiedLinkHint: 'Посилання скопійовано. Хто його відкриє, побачить форму, заповнену цими даними.',
      prefillTitle: 'Форму заповнено з посилання.',
      prefillText: 'Перевірте всі дані, особливо фото й посилання, перш ніж копіювати підпис.',
      copyFail: 'Не вдалося скопіювати автоматично. Виділіть підпис у прев\'ю мишею та натисніть Ctrl+C.',
      required: "Заповніть обов'язкові поля: ім'я, посаду та коректний email.",
      tooLong: 'Підпис довший за ліміт Gmail (10 000 символів).',
      secDesign: 'Дизайн',
      secContacts: 'Контакти',
      secPhoto: 'Фото',
      secSocial: 'Соцмережі та зустрічі',
      optional: "(необов'язково)",
      fPhotoUrl: 'Посилання на фото',
      socialChipsHint: "Додайте потрібні мережі — іконки з'являться під контактами.",
      chipMeeting: 'Запис на зустріч',
      socialEmpty: "Заповніть — і іконка з'явиться в підписі.",
      meetingEmpty: "Заповніть — і посилання з'явиться в підписі.",
      removeSocial: 'Прибрати',
      reqCount: "Заповнено {n} з 3 обов'язкових",
      moreOptions: 'Інші варіанти',
      themeLight: 'Світла пошта',
      themeDark: 'Темна пошта',
      darkNote: 'Приблизний вигляд: кожна поштова програма по-своєму перефарбовує листи в темній темі.',
      copyThen: 'Потім вставте його в налаштуваннях пошти.',
      sumComplete: 'Заповнено',
      sumOptional: "Необов'язково",
      sumPhotoEmpty: "Необов'язково · квадрат від 180 px",
      sumPhotoSet: 'Додано',
      cLead: 'Заповнюйте латиницею. Поля зберігаються в цьому браузері, щоб не вводити їх щоразу.',
      otherVersions: 'Інші версії:',
      verMain: 'основний дизайн',
      verLight: 'світлий дизайн (бета)',
      verArchive: 'попередній дизайн',
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
      fDesign: 'Signature design',
      formLead: 'Fill in the fields in Latin characters — the signature updates instantly.',
      fName: 'Full name',
      fTitle: 'Job title',
      fPromo: 'Promo block',
      promoNone: '— No promo —',
      fMobile: 'Mobile',
      fEmail: 'Email',
      emailError: 'Only the part before “@”: Latin letters, digits, dot, hyphen or underscore.',
      fPhoto: 'Photo URL (optional)',
      photoHint: 'Square image, at least 180×180 px, public https link.',
      photoNotHttps: 'The link must start with https:// — otherwise the photo is not added to the signature.',
      photoLoadError: 'Could not load the image. Make sure the link is public and points directly to the image.',
      photoNotSquare: 'The photo is not square — it will be stretched in the signature. Crop it to a square.',
      photoSmall: 'The photo is smaller than 180×180 px — it may look blurry on Retina screens.',
      photoDrive: 'This is a viewer page link (Google Drive / OneDrive / SharePoint), not the image itself. Use a direct link to the image file.',
      socialTitle: 'Add social networks & messengers',
      waSame: 'Same as mobile',
      linkedinInvalid: 'Use a link to a LinkedIn profile, e.g. linkedin.com/in/john-smith.',
      telegramInvalid: 'Enter a Telegram username (@username, 5–32 characters: Latin letters, digits, _) or a t.me/username link.',
      whatsappInvalid: 'Enter the number in international format with “+” and country code, e.g. +380 50 123 4567.',
      fMeeting: 'Meeting booking link (Calendly, Google Calendar)',
      msButton: '“Book a meeting” button',
      msIcon: 'Calendar icon',
      meetingInvalid: 'Use an https:// link to a booking page, e.g. calendly.com/john-smith.',
      meetingUnknown: 'This doesn’t look like Calendly or Google Calendar — make sure the link opens a booking page.',
      previewTitle: 'Preview',
      desktop: 'Desktop',
      mobile: 'Mobile',
      copy: 'Copy signature',
      copyHtml: 'Copy HTML code',
      download: 'Download .htm',
      copied: 'Copied!',
      copiedHint: 'The signature is on your clipboard — paste it in your mail settings as described below.',
      copiedHtmlHint: 'HTML code copied.',
      copyLink: 'Copy signature link',
      copiedLinkHint: 'Link copied. Anyone who opens it will see the form prefilled with these details.',
      prefillTitle: 'This form was filled from a link.',
      prefillText: 'Check all details, especially the photo and links, before copying the signature.',
      copyFail: 'Automatic copy failed. Select the signature in the preview with your mouse and press Ctrl+C.',
      required: 'Please fill in the required fields: name, job title and a valid email.',
      tooLong: 'The signature exceeds the Gmail limit (10,000 characters).',
      secDesign: 'Design',
      secContacts: 'Contacts',
      secPhoto: 'Photo',
      secSocial: 'Socials & meeting',
      optional: '(optional)',
      fPhotoUrl: 'Photo URL',
      socialChipsHint: 'Add the networks you need — icons appear under your contacts.',
      chipMeeting: 'Meeting link',
      socialEmpty: 'Fill this in — the icon will appear in the signature.',
      meetingEmpty: 'Fill this in — the link will appear in the signature.',
      removeSocial: 'Remove',
      reqCount: '{n} of 3 required filled',
      moreOptions: 'More options',
      themeLight: 'Light mail',
      themeDark: 'Dark mail',
      darkNote: 'Approximate view: every mail app recolors emails in dark mode in its own way.',
      copyThen: 'Then paste it into your mail settings.',
      sumComplete: 'Complete',
      sumOptional: 'Optional',
      sumPhotoEmpty: 'Optional · square, 180 px+',
      sumPhotoSet: 'Added',
      cLead: 'Fill in Latin characters. Fields are saved in this browser so you don’t have to retype them.',
      otherVersions: 'Other versions:',
      verMain: 'main design',
      verLight: 'light design (beta)',
      verArchive: 'previous design',
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
  var fields = ['name', 'title', 'mobile', 'email', 'photo', 'linkedin', 'telegram', 'whatsapp', 'meeting'];
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
      var m = u.pathname.match(/^\/in\/([A-Za-z0-9\-_.%]+)/i);
      if (!/(^|\.)linkedin\.com$/i.test(u.hostname) || !m) return null;
      return 'https://www.linkedin.com/in/' + m[1];
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
  // Будь-яке https-посилання на сторінку запису; http:// і посилання без схеми доводимо до https://.
  function meetingUrl(s) {
    if (!s) return '';
    var v = s.replace(/^http:\/\//i, 'https://');
    if (!/^https:\/\//i.test(v)) v = 'https://' + v.replace(/^\/+/, '');
    try {
      var u = new URL(v);
      if (u.protocol !== 'https:' || u.hostname.indexOf('.') === -1 || u.username || u.password) return null;
      return isHttpsUrl(u.href) ? u.href : null;
    } catch (e) { return null; }
  }
  // Відомі сервіси запису; для решти показуємо м'яке попередження, але посилання все одно додаємо.
  function isKnownMeeting(url) {
    try {
      var u = new URL(url), h = u.hostname.toLowerCase();
      return /(^|\.)calendly\.com$/.test(h) || h === 'calendar.app.google' ||
        (h === 'calendar.google.com' && /^\/calendar\/(u\/\d+\/)?appointments/.test(u.pathname)) ||
        (/^outlook\.office(365)?\.com$/.test(h) && /^\/(bookwithme|book|owa\/calendar)/i.test(u.pathname)) ||
        h === 'meetings.hubspot.com' || h === 'cal.com';
    } catch (e) { return false; }
  }
  function socialLinks(d) {
    var wa = d.waSame ? d.mobile : d.whatsapp;
    return [
      { url: linkedinUrl(d.linkedin), icon: 'linkedin.png', alt: 'LinkedIn' },
      { url: telegramUrl(d.telegram), icon: 'telegram.png', alt: 'Telegram' },
      { url: whatsappUrl(wa), icon: 'whatsapp.png', alt: 'WhatsApp' },
      // Іконка календаря — лише коли обрано вигляд «іконка»; інакше це кнопка на початку рядка.
      { url: d.meetingStyle === 'icon' ? meetingUrl(d.meeting) : '', icon: 'calendar.png', alt: 'Book a meeting' }
    ].filter(function (x) { return x.url; });
  }
  // Локальна частина адреси (до «@»): без пробілів, крапка не на початку/в кінці й не двічі поспіль.
  function isEmailLocal(s) { return /^[A-Za-z0-9_+-]+(\.[A-Za-z0-9_+-]+)*$/.test(s); }
  // Повна адреса з автозаповнення чи вставки → лише частина до «@».
  function emailLocal(s) { return String(s || '').trim().split('@')[0]; }
  function hasLang(l) { return typeof l === 'string' && Object.prototype.hasOwnProperty.call(I18N, l); }
  function t(key) { return I18N[lang][key] || I18N.en[key] || ''; }

  function assetBase() {
    if (ASSET_BASE_URL) return ASSET_BASE_URL.replace(/\/?$/, '/');
    return new URL('assets/', SCRIPT_URL).href;
  }

  function data() {
    var d = {};
    fields.forEach(function (f) { d[f] = $(f).value.trim(); });
    d.email = d.email ? d.email + '@' + EMAIL_DOMAIN : '';
    d.promo = promoValue();
    d.waSame = $('waSame').checked;
    d.meetingStyle = meetingStyle();
    d.design = design();
    return d;
  }

  function design() {
    var r = document.querySelector('input[name="design"]:checked');
    return r && DESIGNS.indexOf(r.value) !== -1 ? r.value : DEFAULT_DESIGN;
  }
  function setDesign(v) {
    var value = DESIGNS.indexOf(v) !== -1 ? v : DEFAULT_DESIGN;
    document.querySelectorAll('input[name="design"]').forEach(function (r) { r.checked = r.value === value; });
  }
  function meetingStyle() {
    var r = document.querySelector('input[name="meetingStyle"]:checked');
    return r && r.value === 'icon' ? 'icon' : 'button';
  }
  function setMeetingStyle(v) {
    document.querySelectorAll('input[name="meetingStyle"]').forEach(function (r) { r.checked = r.value === (v === 'icon' ? 'icon' : 'button'); });
  }

  function findPromo(id) {
    for (var i = 0; i < PROMO_LINKS.length; i++) if (PROMO_LINKS[i].id === id) return PROMO_LINKS[i];
    return null;
  }

  // Промо-блок — або випадаючий список (<select id="promo">), або картки-перемикачі в контейнері #promo.
  function promoIsSelect() { return $('promo').tagName === 'SELECT'; }
  function promoValue() {
    if (promoIsSelect()) return $('promo').value;
    var r = $('promo').querySelector('input[name="promo"]:checked');
    return r ? r.value : '';
  }
  function setPromo(v) {
    var value = v && findPromo(v) ? v : '';
    if (promoIsSelect()) { $('promo').value = value; return; }
    $('promo').querySelectorAll('input[name="promo"]').forEach(function (r) { r.checked = r.value === value; });
  }

  // Мініатюра картки промо: логотип, банер або іконка з рядком тексту.
  function promoThumb(p) {
    var thumb = document.createElement('span');
    thumb.className = 'promo-card__thumb promo-card__thumb--' + (p ? p.type : 'none');
    thumb.setAttribute('aria-hidden', 'true');
    if (!p) return thumb;
    var img = document.createElement('img');
    img.alt = '';
    if (p.type === 'link') {
      img.src = assetBase() + p.icon.src;
      img.width = p.icon.width; img.height = p.icon.height;
      thumb.appendChild(img);
      thumb.appendChild(document.createElement('b'));
    } else {
      img.src = assetBase() + p.image.src;
      thumb.appendChild(img);
    }
    return thumb;
  }

  function renderPromoOptions() {
    var value = promoValue();
    var box = $('promo');
    box.innerHTML = '';
    if (promoIsSelect()) {
      box.appendChild(new Option(t('promoNone'), ''));
      PROMO_LINKS.forEach(function (p) { box.appendChild(new Option(p.label[lang] || p.label.en, p.id)); });
      box.value = value;
      return;
    }
    PROMO_LINKS.concat([null]).forEach(function (p) {
      var label = document.createElement('label');
      label.className = 'promo-card';
      var input = document.createElement('input');
      input.type = 'radio'; input.name = 'promo'; input.value = p ? p.id : '';
      input.checked = input.value === value;
      var name = document.createElement('span');
      name.className = 'promo-card__name';
      name.textContent = p ? (p.label[lang] || p.label.en) : t('promoNone').replace(/^—\s*|\s*—$/g, '');
      label.appendChild(input);
      label.appendChild(promoThumb(p));
      label.appendChild(name);
      box.appendChild(label);
    });
  }

  // ---------- signature markup ----------
  // Таблична верстка + inline-стилі: Gmail вирізає <style>, Outlook (Word) не знає flex/grid/max-width.
  // Два дизайни (Classic, Modern) збираються зі спільних частин: лінія, іконки, кнопка зустрічі, промо-блок.
  var TABLE = '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">';

  function fontStyle(size, lineHeight, color, extra) {
    return 'font-family:' + FONT + ';font-size:' + size + 'px;line-height:' + lineHeight + 'px;mso-line-height-rule:exactly;color:' + color + ';' + (extra || '');
  }

  // Лінія через border-top на комірці: так її однаково малюють Gmail, Apple Mail і Outlook (Word).
  function dividerRow() {
    return '<tr><td height="' + DIVIDER.gap + '" style="border-top:1px solid ' + DIVIDER.color + ';height:' + DIVIDER.gap + 'px;' +
      'line-height:' + DIVIDER.gap + 'px;font-size:1px;mso-line-height-rule:exactly;padding:0;">&nbsp;</td></tr>';
  }

  function photoImg(src, size, radius, alt) {
    return '<img src="' + esc(src) + '" width="' + size + '" height="' + size + '" alt="' + esc(alt) + '" ' +
      'style="display:block;width:' + size + 'px;height:' + size + 'px;border:0;outline:none;border-radius:' + radius + ';">';
  }

  // Комірки з іконками соцмереж; padTop — відступ зверху (у Classic рядок іде одразу після тексту).
  function iconCells(socials, base, padTop) {
    return socials.map(function (sl, i) {
      var pad = i === socials.length - 1 ? 0 : SOCIAL.gap;
      return '<td style="padding:' + padTop + 'px ' + pad + 'px 0 0;line-height:0;vertical-align:middle;">' +
        '<a href="' + esc(sl.url) + '" target="_blank" style="text-decoration:none;">' +
          '<img src="' + base + sl.icon + '" width="' + SOCIAL.size + '" height="' + SOCIAL.size + '" alt="' + sl.alt + '" ' +
          'style="display:block;width:' + SOCIAL.size + 'px;height:' + SOCIAL.size + 'px;border:0;outline:none;">' +
        '</a></td>';
    }).join('');
  }

  // Кнопка «Book a meeting»: комірка з bgcolor (Outlook) + border-radius (решта клієнтів; у класичному Outlook кути прямі).
  function meetingButton(url, height, fontSize, align) {
    var r = height / 2;
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0"' + (align ? ' align="' + align + '"' : '') + ' style="border-collapse:separate;"><tr>' +
      '<td bgcolor="' + MEETING.bg + '" style="background:' + MEETING.bg + ';border-radius:' + r + 'px;mso-padding-alt:0 ' + MEETING.padX + 'px;">' +
        '<a href="' + esc(url) + '" target="_blank" style="display:inline-block;padding:0 ' + MEETING.padX + 'px;' +
        fontStyle(fontSize, height, MEETING.color, 'font-weight:700;text-decoration:none;white-space:nowrap;border-radius:' + r + 'px;') + '">' + MEETING.text + '</a>' +
      '</td>' +
    '</tr></table>';
  }

  // Промо-блок унизу: банер на всю ширину або текстове посилання з іконкою.
  function promoRow(promo, base, gapTop) {
    if (!promo) return '';
    if (promo.type === 'banner') {
      // Атрибут width для Outlook + width:100%/max-width для адаптиву на телефонах; кути як у фото (Outlook — прямі).
      var im = promo.image;
      return '<tr><td style="padding:' + gapTop + 'px 0 0 0;line-height:0;font-size:0;">' +
        '<a href="' + esc(promo.url) + '" target="_blank" style="text-decoration:none;">' +
          '<img src="' + base + im.src + '" width="' + im.width + '" alt="' + esc(im.alt) + '" ' +
          'style="display:block;width:100%;max-width:' + im.width + 'px;height:auto;border:0;outline:none;border-radius:' + PHOTO.radius + 'px;' +
          fontStyle(14, 21, INK) + '">' +
        '</a>' +
      '</td></tr>';
    }
    if (promo.type === 'logo') {
      var lg = promo.image;
      return '<tr><td style="padding:' + gapTop + 'px 0 0 0;line-height:0;font-size:0;">' +
        '<a href="' + esc(promo.url) + '" target="_blank" style="text-decoration:none;">' +
          '<img src="' + base + lg.src + '" width="' + lg.width + '" height="' + lg.height + '" alt="' + esc(lg.alt) + '" ' +
          'style="display:block;width:' + lg.width + 'px;height:' + lg.height + 'px;border:0;outline:none;' + fontStyle(14, 21, INK) + '">' +
        '</a>' +
      '</td></tr>';
    }
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
    return '<tr><td style="padding:' + gapTop + 'px 0 0 0;">' + TABLE + '<tr>' + iconCell +
      '<td style="' + fontStyle(14, 21, INK) + 'vertical-align:middle;padding:0;">' +
        '<a href="' + esc(promo.url) + '" target="_blank" style="color:' + INK + ';text-decoration:underline;">' + esc(promo.text) + '</a>' +
      '</td></tr></table></td></tr>';
  }

  function wrapSignature(rows) {
    return '<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="420" ' +
      'style="border-collapse:collapse;width:100%;max-width:420px;mso-table-lspace:0pt;mso-table-rspace:0pt;">' +
      rows.join('') + '</table>';
  }

  // Спільні дані для обох дизайнів (з прикладом у прев'ю, поки форма порожня).
  function signatureContext(d) {
    var pristine = !d.name && !d.title && !d.mobile && !d.email;
    return {
      base: assetBase(),
      name: d.name || 'John Smith',
      title: d.title || 'Marketing Manager',
      mobile: d.mobile || (pristine ? '+380 50 123 4567' : ''),
      email: d.email || 'smith.j@ajax.systems',
      photo: isHttpsUrl(d.photo) ? d.photo : '',
      socials: socialLinks(d),
      meeting: d.meetingStyle === 'icon' ? '' : meetingUrl(d.meeting),
      promo: findPromo(d.promo)
    };
  }

  function buildSignature(d) {
    var c = signatureContext(d);
    return d.design === 'modern' ? buildModern(c) : buildClassic(c);
  }

  // ---------- Classic: фото ліворуч, текстові рядки, іконки під контактами ----------
  function buildClassic(c) {
    var text = fontStyle(14, 21, INK);
    var link = 'color:' + INK + ';text-decoration:none;';

    // Ім'я окремим блоком: Outlook застосовує line-height до всього абзацу, тож різні висоти рядків мають бути в різних блоках.
    var nameBlock = '<div style="font-size:' + NAME.fontSize + 'px;line-height:' + NAME.lineHeight + 'px;mso-line-height-rule:exactly;font-weight:700;">' + esc(c.name) + '</div>';
    var lines = [esc(c.title) + ' | ' + COMPANY];
    if (c.mobile) {
      lines.push('<b style="font-weight:700;">Mobile:</b> <a href="' + esc(telHref(c.mobile)) + '" style="' + link + '">' + esc(c.mobile) + '</a>');
    }
    lines.push('<b style="font-weight:700;">Email:</b> <a href="mailto:' + esc(c.email) + '" style="' + link + '">' + esc(c.email) + '</a>');

    var socialRow = '';
    if (c.socials.length || c.meeting) {
      var button = !c.meeting ? '' :
        '<td style="padding:8px ' + (c.socials.length ? MEETING.gapAfter : 0) + 'px 0 0;vertical-align:top;">' + meetingButton(c.meeting, MEETING.height, 12) + '</td>';
      socialRow = TABLE + '<tr>' + button + iconCells(c.socials, c.base, 8) + '</tr></table>';
    }
    var contacts = '<td style="' + text + 'padding:0;vertical-align:top;">' + nameBlock + '<div>' + lines.join('<br>') + '</div>' + socialRow + '</td>';
    if (c.photo) {
      // Вкладена таблиця: фото ліворуч, контакти праворуч. border-radius ігнорує лише класичний Outlook (кути будуть прямі).
      contacts =
        '<td style="padding:0;">' + TABLE + '<tr>' +
          '<td width="' + (PHOTO.size + PHOTO.gap) + '" valign="top" style="width:' + (PHOTO.size + PHOTO.gap) + 'px;padding:0;vertical-align:top;line-height:0;">' +
            photoImg(c.photo, PHOTO.size, PHOTO.radius + 'px', c.name) +
          '</td>' + contacts +
        '</tr></table></td>';
    }
    return wrapSignature([dividerRow(), '<tr>' + contacts + '</tr>', promoRow(c.promo, c.base, 18)]);
  }

  // ---------- Modern: кругле фото + ім'я, контакти колонками з підписами, сіра плашка з іконками й кнопкою ----------
  function buildModern(c) {
    var M = MODERN;
    var rows = [dividerRow()];

    var heading =
      '<div style="' + fontStyle(NAME.fontSize, NAME.lineHeight, INK, 'font-weight:700;') + '">' + esc(c.name) + '</div>' +
      '<div style="' + fontStyle(14, 20, M.muted) + '">' + esc(c.title) + '</div>';
    if (c.photo) {
      heading = TABLE + '<tr>' +
        '<td width="' + (M.photo + M.photoGap) + '" style="width:' + (M.photo + M.photoGap) + 'px;padding:0;vertical-align:middle;line-height:0;">' +
          photoImg(c.photo, M.photo, '50%', c.name) +
        '</td>' +
        '<td style="padding:0;vertical-align:middle;">' + heading + '</td>' +
      '</tr></table>';
    }
    rows.push('<tr><td style="padding:0;">' + heading + '</td></tr>');

    // Колонки контактів — «плаваючі» таблиці align="left": на вузькому екрані друга колонка переноситься під першу.
    var link = 'color:' + INK + ';text-decoration:none;';
    var cols = [];
    if (c.mobile) cols.push({ label: 'MOBILE', value: '<a href="' + esc(telHref(c.mobile)) + '" style="' + link + '">' + esc(c.mobile) + '</a>' });
    cols.push({ label: 'EMAIL', value: '<a href="mailto:' + esc(c.email) + '" style="' + link + '">' + esc(c.email) + '</a>' });
    rows.push('<tr><td style="padding:' + M.section + 'px 0 0 0;">' + cols.map(function (col, i) {
      return '<table role="presentation" align="left" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">' +
        '<tr><td style="padding:0 ' + (i === cols.length - 1 ? 0 : M.colGap) + 'px ' + M.colGapY + 'px 0;">' +
          '<div style="' + fontStyle(11, 16, M.label, 'letter-spacing:0.06em;') + '">' + col.label + '</div>' +
          '<div style="' + fontStyle(14, 20, INK, 'white-space:nowrap;') + '">' + col.value + '</div>' +
        '</td></tr></table>';
    }).join('') + '</td></tr>');

    if (c.socials.length || c.meeting) {
      var icons = c.socials.length ? '<td style="padding:0;vertical-align:middle;">' + TABLE + '<tr>' + iconCells(c.socials, c.base, 0) + '</tr></table></td>' : '';
      var button = c.meeting ? '<td align="' + (icons ? 'right' : 'left') + '" style="padding:0;vertical-align:middle;">' +
        meetingButton(c.meeting, M.buttonHeight, 13, icons ? 'right' : '') + '</td>' : '';
      rows.push('<tr><td style="padding:' + (M.section - M.colGapY) + 'px 0 0 0;">' +
        '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:separate;width:100%;"><tr>' +
          '<td bgcolor="' + M.barBg + '" style="background:' + M.barBg + ';border-radius:' + M.barRadius + 'px;padding:' + M.barPadY + 'px ' + M.barPadX + 'px;">' +
            '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:100%;"><tr>' + icons + button + '</tr></table>' +
          '</td>' +
        '</tr></table></td></tr>');
    }

    rows.push(promoRow(c.promo, c.base, c.socials.length || c.meeting ? M.section : M.section - M.colGapY));
    return wrapSignature(rows);
  }

  function buildPlain(d) {
    var head = (d.title || 'Marketing Manager') + (d.design === 'modern' ? '' : ' | ' + COMPANY);
    var out = [d.name || 'John Smith', head];
    if (d.mobile) out.push('Mobile: ' + d.mobile);
    out.push('Email: ' + (d.email || 'smith.j@ajax.systems'));
    if (d.meetingStyle !== 'icon' && meetingUrl(d.meeting)) out.push(MEETING.text + ': ' + meetingUrl(d.meeting));
    socialLinks(d).forEach(function (sl) { out.push(sl.alt + ': ' + sl.url); });
    var promo = findPromo(d.promo);
    if (promo) out.push('', promo.text ? promo.text + ': ' + promo.url : promo.url);
    return out.join('\n');
  }

  function fullDocument(sig, d) {
    return '<!DOCTYPE html>\n<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1"><title>' + esc(d.name || 'Signature') + '</title></head>' +
      '<body style="margin:0;padding:0;">' + sig + '</body></html>';
  }

  // ---------- preview ----------
  var current = { html: '', plain: '' };
  // «Темна пошта» — приблизна імітація: як Outlook, інвертуємо кольори тексту й фону, а картинки лишаємо як є.
  // Лише для прев'ю: у скопійований підпис це не потрапляє.
  var previewTheme = 'light';
  var DARK_PREVIEW_CSS = 'html{background:#1f1f1f;}body{background:#e0e0e0;filter:invert(1) hue-rotate(180deg);}img{filter:invert(1) hue-rotate(180deg);}';

  function render() {
    var d = data();
    current.html = buildSignature(d);
    current.plain = buildPlain(d);

    var doc = frame.contentDocument;
    doc.open();
    doc.write('<!DOCTYPE html><html><head><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff;}' +
      (previewTheme === 'dark' ? DARK_PREVIEW_CSS : '') + '</style></head><body>' + current.html + '</body></html>');
    doc.close();
    fitFrame();
    var imgs = doc.images;
    for (var i = 0; i < imgs.length; i++) imgs[i].addEventListener('load', fitFrame);

    save(d);
    updateProgress();
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
  // ---------- shareable link ----------
  // Посилання на сторінку з усіма полями в параметрах URL. Порожні поля й значення за замовчуванням не додаються.
  function buildShareUrl() {
    var p = new URLSearchParams();
    fields.forEach(function (f) {
      var v = $(f).value.trim();
      if (f === 'whatsapp' && $('waSame').checked) return;
      if (v) p.set(f, v);
    });
    if ($('waSame').checked) p.set('wa', 'mobile');
    if ($('meeting').value.trim() && meetingStyle() === 'icon') p.set('ms', 'icon');
    if (design() !== DEFAULT_DESIGN) p.set('design', design());
    if (promoValue() !== DEFAULT_PROMO) p.set('promo', promoValue() || 'none');
    if (lang !== 'en') p.set('lang', lang);
    var qs = p.toString();
    return location.origin + location.pathname + (qs ? '?' + qs : '');
  }

  // Параметри з посилання мають пріоритет над збереженими даними. Після застосування прибираємо їх з адресного рядка,
  // щоб перезавантаження сторінки не затирало подальші правки.
  function applyUrlParams() {
    var p = new URLSearchParams(location.search);
    var known = fields.concat(['design', 'wa', 'ms', 'promo', 'lang']);
    var has = known.some(function (k) { return p.has(k); });
    if (!has) return;
    fields.forEach(function (f) { $(f).value = ''; });
    fields.forEach(function (f) {
      if (!p.has(f)) return;
      var v = p.get(f).trim().slice(0, $(f).maxLength > 0 ? $(f).maxLength : 500);
      $(f).value = f === 'email' ? emailLocal(v) : v;
    });
    $('waSame').checked = p.get('wa') === 'mobile';
    setMeetingStyle(p.get('ms'));
    setDesign(p.get('design'));
    if (p.has('promo')) {
      var promo = p.get('promo');
      setPromo(promo === 'none' ? '' : (findPromo(promo) ? promo : DEFAULT_PROMO));
    } else {
      setPromo(DEFAULT_PROMO);
    }
    if (p.has('lang') && hasLang(p.get('lang'))) lang = p.get('lang');
    $('prefillNotice').hidden = false;
    try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* noop */ }
  }

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      if (!s) return;
      if (s.d) {
        fields.forEach(function (f) {
          if (typeof s.d[f] === 'string') $(f).value = f === 'email' ? emailLocal(s.d[f]) : s.d[f];
        });
        if (typeof s.d.promo === 'string') setPromo(s.d.promo);
        if (typeof s.d.waSame === 'boolean') $('waSame').checked = s.d.waSame;
        if (typeof s.d.meetingStyle === 'string') setMeetingStyle(s.d.meetingStyle);
        if (typeof s.d.design === 'string') setDesign(s.d.design);
      }
      if (hasLang(s.lang)) lang = s.lang;
    } catch (e) { /* noop */ }
  }

  // ---------- i18n ----------
  function applyLang() {
    document.documentElement.lang = lang === 'uk' ? 'uk' : 'en';
    document.querySelectorAll('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    renderPromoOptions();
    ['photo-warning', 'linkedin-warning', 'telegram-warning', 'whatsapp-warning', 'meeting-warning'].forEach(function (id) {
      var w = $(id);
      if (w.dataset.key) w.textContent = t(w.dataset.key);
    });
    document.querySelectorAll('.lang__btn').forEach(function (b) { b.classList.toggle('is-active', b.dataset.lang === lang); });
    setStatus('');
    updateProgress();
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
    var badEmail = !isEmailLocal(e);
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
    // data-fixed-width (варіант C): кнопка тримає свою ширину, поки показує «Copied!».
    if (btn.hasAttribute('data-fixed-width') && !btn.classList.contains('btn--done')) {
      btn.style.width = btn.getBoundingClientRect().width + 'px';
    }
    btn.classList.add('btn--done');
    label.textContent = t('copied');
    btn._flashTimer = setTimeout(function () {
      btn.classList.remove('btn--done');
      label.textContent = t(label.getAttribute('data-i18n'));
      btn.style.width = '';
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
      if (ok) { flash(btn); setStatus(t('copiedHint')); onCopied(); } else { setStatus(t('copyFail'), true); }
    });
  });

  $('copyHtmlBtn').addEventListener('click', function () {
    if (!guard()) return;
    var btn = this;
    copyText(current.html).then(function (ok) {
      if (ok) { flash(btn); setStatus(t('copiedHtmlHint')); } else { setStatus(t('copyFail'), true); }
    });
  });

  $('copyLinkBtn').addEventListener('click', function () {
    var btn = this;
    copyText(buildShareUrl()).then(function (ok) {
      if (ok) { flash(btn); setStatus(t('copiedLinkHint')); } else { setStatus(t('copyFail'), true); }
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
    setPhotoThumb('');
    if (!url) return showPhotoWarning('');
    if (!isHttpsUrl(url)) return showPhotoWarning('photoNotHttps');
    if (isViewerLink(url)) return showPhotoWarning('photoDrive');
    var img = new Image();
    img.onload = function () {
      if (token !== photoToken) return;
      setPhotoThumb(url);
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
  var SOCIAL_FIELDS = { linkedin: linkedinUrl, telegram: telegramUrl, whatsapp: whatsappUrl, meeting: meetingUrl };
  // Під час набору лише ховаємо попередження, коли значення стало правильним; показуємо його на blur.
  function checkSocial(id, strict) {
    var input = $(id);
    var warn = $(id + '-warning');
    var url = input.disabled ? '' : SOCIAL_FIELDS[id](input.value.trim());
    var key = url === null ? id + 'Invalid' : (id === 'meeting' && url && !isKnownMeeting(url) ? 'meetingUnknown' : '');
    if (!key) { warn.hidden = true; warn.dataset.key = ''; return; }
    // Під час набору не показуємо нових попереджень; лише прибираємо те, що вже не актуальне.
    if (!strict) { if (warn.dataset.key !== key) { warn.hidden = true; warn.dataset.key = ''; } return; }
    warn.dataset.key = key;
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

  $('email').addEventListener('input', function () {
    if (this.value.indexOf('@') !== -1) this.value = emailLocal(this.value);
  });
  $('email').addEventListener('blur', function () {
    var v = this.value.trim();
    this.classList.toggle('is-invalid', !!v && !isEmailLocal(v));
  });

  // Перемикачі прев'ю: ширина (data-width) і тема пошти (data-theme) — кожна група незалежна.
  function pressInGroup(attr, btn) {
    document.querySelectorAll('[' + attr + ']').forEach(function (x) {
      var on = x.getAttribute(attr) === btn.getAttribute(attr);
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  document.querySelectorAll('[data-width]').forEach(function (b) {
    b.addEventListener('click', function () {
      pressInGroup('data-width', b);
      $('mail').classList.toggle('is-mobile', b.dataset.width === 'mobile');
      setTimeout(fitFrame, 320);
    });
  });
  document.querySelectorAll('[data-theme]').forEach(function (b) {
    b.addEventListener('click', function () {
      pressInGroup('data-theme', b);
      previewTheme = b.dataset.theme === 'dark' ? 'dark' : 'light';
      $('mail').classList.toggle('is-dark', previewTheme === 'dark');
      if ($('darkNote')) $('darkNote').hidden = previewTheme !== 'dark';
      render();
    });
  });

  // Інструкції: обрана вкладка запам'ятовується в браузері.
  var TAB_KEY = 'ajax-signature-tab';
  function selectTab(name) {
    var tabs = document.querySelectorAll('.tabs__btn');
    var found = false;
    tabs.forEach(function (x) { if (x.dataset.tab === name) found = true; });
    if (!found) return;
    tabs.forEach(function (x) {
      var on = x.dataset.tab === name;
      x.classList.toggle('is-active', on);
      x.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    document.querySelectorAll('.steps').forEach(function (p) { p.hidden = p.dataset.panel !== name; });
  }
  document.querySelectorAll('.tabs__btn').forEach(function (b) {
    b.addEventListener('click', function () {
      selectTab(b.dataset.tab);
      try { localStorage.setItem(TAB_KEY, b.dataset.tab); } catch (e) { /* noop */ }
    });
  });

  document.querySelectorAll('.lang__btn').forEach(function (b) {
    b.addEventListener('click', function () { lang = b.dataset.lang; applyLang(); save(data()); });
  });

  // ---------- progress: лічильник обов'язкових полів, галочки, підсумки секцій ----------
  function requiredFilled() {
    return [!!$('name').value.trim(), !!$('title').value.trim(), isEmailLocal($('email').value.trim())]
      .filter(Boolean).length;
  }
  function setSummary(key, text, done) {
    document.querySelectorAll('[data-summary="' + key + '"]').forEach(function (el) {
      el.textContent = text;
      el.classList.toggle('is-done', !!done);
    });
  }
  function updateProgress() {
    var n = requiredFilled();
    var countText = t('reqCount').replace('{n}', n);
    if ($('reqCount')) $('reqCount').textContent = countText;
    if ($('reqBar')) $('reqBar').style.width = Math.round(n / 3 * 100) + '%';
    $('name').classList.toggle('is-valid', !!$('name').value.trim());
    $('title').classList.toggle('is-valid', !!$('title').value.trim());
    $('email').classList.toggle('is-valid', isEmailLocal($('email').value.trim()));

    updateEmptyHints();
    setSummary('contacts', n === 3 ? t('sumComplete') : countText, n === 3);
    var photo = isHttpsUrl($('photo').value.trim());
    setSummary('photo', photo ? t('sumPhotoSet') : t('sumPhotoEmpty'), photo);
    var d = data();
    var social = socialLinks(d).map(function (s) { return s.alt; });
    if (d.meetingStyle !== 'icon' && meetingUrl(d.meeting)) social.push(MEETING.text);
    setSummary('social', social.length ? social.join(', ') : t('sumOptional'), social.length > 0);
    var promo = findPromo(d.promo);
    setSummary('promo', promo ? (promo.label[lang] || promo.label.en) : t('promoNone').replace(/^—\s*|\s*—$/g, ''), !!promo);
  }

  // Мініатюра фото біля поля: показуємо картинку, лише коли вона завантажилась.
  function setPhotoThumb(url) {
    var box = $('photoThumb');
    if (!box) return;
    var img = box.querySelector('img');
    if (url) { img.src = url; box.classList.add('has-photo'); }
    else { img.removeAttribute('src'); box.classList.remove('has-photo'); }
  }

  // ---------- соцмережі: кнопки «+ Додати» (основний дизайн) ----------
  // «+ LinkedIn» відкриває поле й ховає саму кнопку; «×» біля поля прибирає мережу разом з даними.
  // У підпис мережа потрапляє лише тоді, коли поле заповнене, — поки воно порожнє, під ним підказка.
  function socialFilled(id) {
    return !!$(id).value.trim() || (id === 'whatsapp' && $('waSame').checked);
  }
  function showSocial(id, on, focus) {
    var add = document.querySelector('.chip[data-social="' + id + '"]');
    var box = document.querySelector('[data-social-field="' + id + '"]');
    if (!add || !box) return;
    add.hidden = on;
    box.hidden = !on;
    if (!on) {
      $(id).value = '';
      if (id === 'whatsapp') { $('waSame').checked = false; syncWaSame(); }
      checkSocial(id, false);
    }
    var chips = document.querySelector('.chips');
    if (chips) chips.hidden = !chips.querySelector('.chip:not([hidden])');
    // Фокус: на поле після «+ …», на кнопку «+ …» після «×».
    if (focus) (on ? $(id) : add).focus();
  }
  function updateEmptyHints() {
    // Дивимось на саме значення поля: «Same as mobile» з порожнім мобільним теж нічого не додає в підпис.
    document.querySelectorAll('[data-empty-hint]').forEach(function (el) {
      el.hidden = !!$(el.getAttribute('data-empty-hint')).value.trim();
    });
  }
  document.querySelectorAll('.chip[data-social]').forEach(function (add) {
    add.addEventListener('click', function () { showSocial(add.dataset.social, true, true); render(); });
  });
  document.querySelectorAll('[data-social-remove]').forEach(function (btn) {
    btn.addEventListener('click', function () { showSocial(btn.getAttribute('data-social-remove'), false, true); render(); });
  });

  // ---------- меню «Інші варіанти» ----------
  function setMenu(open) {
    if (!$('moreMenu')) return;
    $('moreMenu').hidden = !open;
    $('moreBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  if ($('moreBtn')) {
    $('moreBtn').addEventListener('click', function (e) {
      e.stopPropagation();
      setMenu($('moreMenu').hidden);
    });
    document.addEventListener('click', function (e) {
      if (!$('moreMenu').hidden && !$('moreMenu').contains(e.target)) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !$('moreMenu').hidden) { setMenu(false); $('moreBtn').focus(); }
    });
  }

  // Після копіювання — плавний перехід до інструкції, якщо її не видно.
  function onCopied() {
    var guide = $('install');
    if (guide && guide.getBoundingClientRect().top > window.innerHeight - 80) {
      guide.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  window.addEventListener('resize', fitFrame);

  // ---------- init ----------
  renderPromoOptions();
  setPromo(DEFAULT_PROMO);
  load();
  applyUrlParams();
  applyLang();
  syncWaSame();
  // Блок соцмереж згорнутий, але відкривається сам, якщо щось уже заповнено.
  if ($('socialBlock') && ($('linkedin').value || $('telegram').value || $('whatsapp').value || $('waSame').checked || $('meeting').value)) {
    $('socialBlock').open = true;
  }
  ['linkedin', 'telegram', 'whatsapp', 'meeting'].forEach(function (id) {
    showSocial(id, socialFilled(id), false);
  });
  try { selectTab(localStorage.getItem(TAB_KEY)); } catch (e) { /* noop */ }
  render();
  checkPhoto();
})();

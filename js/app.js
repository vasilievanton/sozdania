/* ============================================================
   Прототип СоздАния — общий клиентский JS.
   Один режим. Один пользователь — ребёнок.
   Контент для родителей — отдельные разделы в общем меню.
   ============================================================ */

(function () {
  const params = new URLSearchParams(window.location.search);
  const isTour = params.get('mode') === 'tour';

  // --- баннер прототипа ---
  const banner = document.createElement('div');
  banner.className = 'proto-banner';
  if (isTour) {
    banner.innerHTML = 'UX-тур: вы проходите сайт за Машу 9 лет и её родителя. ' +
                       '<a href="../index.html">Выйти из тура</a>';
  } else {
    banner.innerHTML = 'Кликабельный прототип СоздАния. Данные демонстрационные. ' +
                       '<a href="../index.html">К выбору режима</a>';
  }
  document.body.prepend(banner);

  // --- шапка ---
  const mode = document.body.dataset.mode || 'guest';
  const header = document.createElement('header');
  header.className = 'app-header';

  const brand = document.createElement('div');
  brand.className = 'app-header__brand';
  brand.innerHTML = '<a href="../index.html">СоздАния</a>';
  header.appendChild(brand);

  // Единая навигация для ребёнка (родителю в этом же меню доступны его разделы)
  const nav = document.createElement('nav');
  nav.className = 'app-header__nav';

  const navItems = isTour ? {
    guest: [],
    user:  [],
    admin: [],
  } : {
    guest: [
      { href: 'index.html',    text: 'Главная' },
      { href: 'register.html', text: 'Регистрация' },
      { href: 'login.html',    text: 'Войти' },
    ],
    user: [
      { href: 'map.html',            text: 'Карта' },
      { href: 'prize-rules.html',    text: 'Правила акции' },
      { href: 'leaderboard.html',    text: 'Турнирная таблица' },
      { href: 'parent-hub.html',     text: 'Для родителей' },
    ],
    admin: [
      { href: 'admin-dashboard.html', text: 'Дашборд' },
      { href: 'admin-import.html',    text: 'JSON-импорт' },
      { href: 'admin-users.html',     text: 'Пользователи' },
      { href: 'admin-sessions.html',  text: 'Сессии' },
      { href: 'admin-export.html',    text: 'Экспорт' },
      { href: 'admin-support.html',   text: 'Support' },
    ],
  };
  (navItems[mode] || navItems.guest).forEach((item) => {
    const a = document.createElement('a');
    a.href = item.href;
    a.textContent = item.text;
    nav.appendChild(a);
  });
  header.appendChild(nav);

  const userBlock = document.createElement('div');
  userBlock.className = 'app-header__user';
  if (mode === 'user') {
    userBlock.innerHTML = `
      <a href="cabinet.html" style="color:inherit;text-decoration:none;">Маша, 9 лет</a>
    `;
  } else if (mode === 'admin') {
    userBlock.innerHTML = `
      <span class="mode-badge mode-badge--admin">Админка</span>
      <span>admin@mts.ru</span>
    `;
  } else {
    userBlock.innerHTML = isTour
      ? '<span class="muted">не авторизован</span>'
      : '<a class="btn btn--sm" href="login.html">Войти</a>';
  }
  header.appendChild(userBlock);

  document.body.insertBefore(header, document.querySelector('main'));

  // --- подвал ---
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  footer.innerHTML = `
    Прототип • <a href="../index.html">К выбору режима</a>
  `;
  document.body.appendChild(footer);

  // --- заглушки кнопок ---
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-stub]');
    if (!t) return;
    e.preventDefault();
    const label = t.getAttribute('data-stub') || 'действие';
    alert(
      'Прототип: «' + label + '» — заглушка.\n' +
      'В реальной системе здесь произойдёт соответствующая логика.'
    );
  });

  // --- ПАНЕЛЬ ТУРА ---
  if (isTour && window.SOZDANIA_TOUR) {
    renderTourPanel();
  }

  function renderTourPanel() {
    const tour = window.SOZDANIA_TOUR;
    const panel = document.createElement('div');
    panel.className = 'tour-panel';
    const total = tour.total || (window.TOUR_TOTAL_STEPS_OVERRIDE || 12);
    const cur = tour.step;
    panel.innerHTML = `
      <div class="tour-panel__head">
        <span class="tour-panel__step">Шаг ${cur} из ${total}</span>
        <a href="../index.html" class="tour-panel__close" title="Выйти из тура">×</a>
      </div>
      <div class="tour-panel__title">${escapeHtml(tour.title)}</div>
      <div class="tour-panel__hint">${tour.hint}</div>
      <div class="tour-panel__progress">
        <div class="tour-panel__progress-fill" style="width:${(cur / total * 100).toFixed(0)}%"></div>
      </div>
      <div class="tour-panel__nav">
        ${tour.prev
          ? `<a class="btn btn--sm" href="${tour.prev}">← Назад</a>`
          : `<span></span>`}
        ${tour.next
          ? `<a class="btn btn--sm btn--primary" href="${tour.next}">Дальше →</a>`
          : `<a class="btn btn--sm btn--primary" href="../index.html">Закончить тур</a>`}
      </div>
      <div class="tour-panel__skip">
        <a href="${location.pathname.split('/').pop() || 'index.html'}">Пропустить тур</a>
      </div>
    `;
    document.body.appendChild(panel);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }
})();

/* ============================================================
   UX-тур (режим 2) — единый интерфейс, один пользователь.
   ============================================================ */

(function () {
  if (new URLSearchParams(location.search).get('mode') !== 'tour') return;

  const STEPS = [
    {
      n: 1,
      path: 'index.html',
      title: 'Стартовый экран',
      hint: 'Так выглядит сайт для нового (или неавторизованного) пользователя. Корпоративная почта — единственный способ зарегистрироваться/залогиниться. Нажмите <strong>«Создать аккаунт»</strong>.',
      rewire: [['register.html', 'register.html']],
    },
    {
      n: 2,
      path: 'register.html',
      title: 'Регистрация — корпоративная почта',
      hint: 'Заполняем форму: корпоративная почта, имя, пароль, согласия. Нажмите <strong>«Создать аккаунт»</strong>.',
      autofill() {
        const inp = document.querySelectorAll('.form-field__input');
        if (inp[0]) inp[0].value = 'ivanov@mts.ru';
        if (inp[1]) inp[1].value = 'Иван Иванов';
        if (inp[2]) inp[2].value = '••••••••';
        if (inp[3]) inp[3].value = '••••••••';
        document.querySelectorAll('.form-field__checkbox input').forEach(cb => cb.checked = true);
      },
      rewire: [['add-child.html', 'add-child.html']],
    },
    {
      n: 3,
      path: 'add-child.html',
      title: 'Добавление ребёнка',
      hint: 'Указываем никнейм (виден в турнирной таблице), реальное имя (только в админке для призов) и возраст. Маша 9 лет — это группа <strong>6–9</strong>.',
      autofill() {
        const inp = document.querySelectorAll('.form-field__input');
        if (inp[0]) inp[0].value = 'КосмоМаша';
        if (inp[1]) inp[1].value = 'Мария';
        if (inp[2]) inp[2].value = '9';
      },
      rewire: [['profile-switch.html', 'map.html']], // сразу на карту, без селектора режимов
    },
    {
      n: 4,
      path: 'map.html',
      title: 'Карта СоздАнии — главный экран',
      hint: 'Четыре района, прогресс по каждому — всё открыто. Перейдите в <strong>Технодром</strong>.',
      rewire: [
        ['district-tehnodrom.html', 'district-tehnodrom.html'],
        ['character.html', null],
        ['leaderboard.html', null],
      ],
    },
    {
      n: 5,
      path: 'district-tehnodrom.html',
      title: 'Технодром',
      hint: 'Роботы ждут помощи. Нажмите <strong>«Помоги роботу»</strong> у Доставщика.',
      rewire: [
        ['game-tehnodrom.html', 'game-tehnodrom.html'],
        ['map.html', null],
      ],
    },
    {
      n: 6,
      path: 'game-tehnodrom.html',
      title: 'Игра — версия для 6–9 лет',
      hint: 'Маша 9 лет видит механику группы 6–9: цепочка из 3–4 блоков. Нажмите <strong>«Запустить»</strong>.',
      rewire: [
        ['game-result.html', 'game-result.html'],
        ['district-tehnodrom.html', null],
      ],
    },
    {
      n: 7,
      path: 'game-result.html',
      title: 'Результат',
      hint: 'Маша получила баллы, на карте обновился её прогресс. Дальше посмотрим, что доступно для родителя в этом же интерфейсе. Нажмите <strong>«На карту»</strong>.',
      rewire: [
        ['map.html', 'parent-content.html'],
        ['game-pridumkino.html', null],
        ['game-tehnodrom.html', null],
        ['leaderboard.html', null],
        ['parent-joint-task.html', null],
      ],
      autofill() {
        const a = document.querySelector('a.btn--primary[href="map.html"]');
        if (a) a.textContent = 'Дальше — раздел для родителей →';
      },
    },
    {
      n: 8,
      path: 'parent-content.html',
      title: 'Материалы для родителей',
      hint: 'Никакого отдельного «родительского режима» — это просто разделы в общем меню: статьи, видео, аудио, чек-листы.',
      rewire: [['parent-sessions.html', 'parent-test.html']],
    },
    {
      n: 9,
      path: 'parent-test.html',
      title: 'Квиз «Какой ты мем?»',
      hint: 'Ребёнок и родитель проходят независимо, система сравнивает ответы и выдаёт мем-дуэт.',
      rewire: [['leaderboard.html', 'leaderboard.html']],
      autofill() {
        const links = document.querySelectorAll('a.btn');
        links.forEach(a => {
          if (a.textContent.includes('← К прогрессу')) {
            a.textContent = '→ Турнирная таблица';
          }
        });
      },
    },
    {
      n: 10,
      path: 'leaderboard.html',
      title: 'Турнирная таблица — финал тура',
      hint: 'Маша на 4 месте в своей возрастной группе. Тур закончен — теперь можете свободно ходить по остальным экранам.',
      isFinal: true,
    },
  ];

  window.TOUR_TOTAL_STEPS_OVERRIDE = STEPS.length;

  const params = new URLSearchParams(location.search);
  const wantStep = parseInt(params.get('step') || '0', 10);
  const pageName = location.pathname.split('/').pop() || 'index.html';

  let cur = STEPS.find(s => s.n === wantStep && s.path === pageName);
  if (!cur) cur = STEPS.find(s => s.path === pageName);
  if (!cur) return;

  const prev = STEPS[cur.n - 2] || null;
  const next = STEPS[cur.n] || null;

  window.SOZDANIA_TOUR = {
    step: cur.n,
    total: STEPS.length,
    title: cur.title,
    hint: cur.hint,
    prev: prev ? `${prev.path}?mode=tour&step=${prev.n}` : null,
    next: cur.isFinal ? null : (next ? `${next.path}?mode=tour&step=${next.n}` : null),
  };

  document.addEventListener('DOMContentLoaded', () => {
    if (typeof cur.autofill === 'function') {
      try { cur.autofill(); } catch (e) { console.warn('autofill failed', e); }
    }

    if (Array.isArray(cur.rewire)) {
      cur.rewire.forEach(([from, to]) => {
        document.querySelectorAll(`a[href="${from}"]`).forEach(a => {
          if (to === null) {
            a.style.opacity = '0.4';
            a.style.pointerEvents = 'none';
            a.title = 'В туре эта ссылка отключена — следуйте подсказке';
          } else {
            const stepRef = STEPS.find(s => s.path === to && s.n > cur.n);
            if (stepRef) {
              a.href = `${to}?mode=tour&step=${stepRef.n}`;
            } else {
              a.href = `${to}?mode=tour&step=${cur.n}`;
            }
          }
        });
      });
    }
  });
})();

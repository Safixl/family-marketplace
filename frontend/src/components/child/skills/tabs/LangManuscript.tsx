import { useState } from 'react';

/**
 * Манускрипт — встроенный учебник иностранного языка для свободного
 * самостоятельного обучения: уровни A1, A2, B1, B2 (CEFR).
 */
export default function LangManuscript() {
  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');

  return (
    <div className="rpg-panel p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">📜</span>
        <div>
          <div className="font-bold text-amber-100">Манускрипт — учебник путешественника</div>
          <div className="text-xs text-stone-400">Все знания по уровням: от первых слов до свободной речи</div>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {(['A1', 'A2', 'B1', 'B2'] as const).map((l) => (
          <button key={l} onClick={() => setLevel(l)} className={`rpg-tab ${level === l ? 'rpg-tab-active' : ''}`}>
            {LEVEL_META[l].emoji} {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <div className="rounded-xl bg-stone-900/60 p-3">
          <div className="text-sm font-bold text-amber-200">{LEVEL_META[level].title}</div>
          <div className="mt-1 text-sm text-stone-300">{LEVEL_META[level].about}</div>
        </div>
        {LEVEL_META[level].sections.map((s) => (
          <div key={s.title} className="rounded-xl border border-stone-700/50 bg-stone-900/40 p-3">
            <div className="text-sm font-bold text-stone-200">{s.title}</div>
            <ul className="mt-1.5 space-y-1 text-sm text-stone-300">
              {s.items.map((it, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-amber-400/70">•</span>
                  <span className="min-w-0 flex-1" dangerouslySetInnerHTML={{ __html: it }} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

const LEVEL_META: Record<'A1' | 'A2' | 'B1' | 'B2', { emoji: string; title: string; about: string; sections: Array<{ title: string; items: string[] }> }> = {
  A1: {
    emoji: '🌱',
    title: 'A1 — Первые шаги',
    about: 'Начальный уровень. Ты умеешь представиться, рассказать о себе простыми фразами и понять медленную чёткую речь.',
    sections: [
      {
        title: '🔤 Буквы и звуки',
        items: [
          'Английский алфавит: 26 букв. Гласные: <b>A, E, I, O, U</b> (и иногда <b>Y</b>).',
          'Открытый слог — гласная читается как в алфавите: <b>name</b> [нейм], <b>fine</b> [файн].',
          'Закрытый слог — краткий звук: <b>cat</b> [кэт], <b>dog</b> [дог].',
          'Буквосочетания: <b>th</b> [θ], <b>sh</b> [ʃ], <b>ch</b> [tʃ], <b>ph</b> [f].',
        ],
      },
      {
        title: '🗣️ Представление и знакомство',
        items: [
          '<b>Hello! My name is…</b> — Привет! Меня зовут…',
          '<b>I am … years old.</b> — Мне … лет.',
          '<b>Nice to meet you!</b> — Приятно познакомиться!',
          '<b>Where are you from?</b> — Откуда ты?',
        ],
      },
      {
        title: '📖 Грамматика',
        items: [
          'Глагол <b>to be</b>: I <b>am</b>, you/we/they <b>are</b>, he/she/it <b>is</b>.',
          'Порядок слов: подлежащее → сказуемое → дополнение. <b>I read books.</b>',
          'Множественное число: +<b>-s</b> (cats), после s/x/ch/sh → <b>-es</b> (boxes).',
          'Артикли: <b>a/an</b> — один из многих, <b>the</b> — конкретный предмет.',
          'Отрицание и вопрос с to be: <b>I am not…</b>, <b>Are you…?</b>',
        ],
      },
      {
        title: '💬 Полезные фразы',
        items: [
          '<b>Thank you.</b> — Спасибо. &nbsp; <b>Please.</b> — Пожалуйста.',
          '<b>What is this?</b> — Что это? &nbsp; <b>How are you?</b> — Как дела?',
          'Числа 1–20, цвета, дни недели, члены семьи — вся база есть в твоём словаре!',
        ],
      },
    ],
  },
  A2: {
    emoji: '🌿',
    title: 'A2 — Базовый уровень',
    about: 'Ты уже говоришь простыми предложениями о повседневных вещах: семья, покупки, распорядок дня.',
    sections: [
      {
        title: '⏰ Настоящее время',
        items: [
          '<b>Present Simple</b> — регулярные действия: <b>I play</b>, he/she <b>plays</b> (+-s!).',
          'Вопросы и отрицания через <b>do/does</b>: <b>Do you play? He doesn\'t play.</b>',
          'Наречия частотности: <b>always, often, sometimes, never</b> — перед глаголом.',
          '<b>Present Continuous</b> — сейчас: <b>I am reading now.</b>',
        ],
      },
      {
        title: '⏳ Прошедшее время',
        items: [
          '<b>Past Simple</b>: правильные глаголы +<b>-ed</b> (played), неправильные — 2-я форма (went, saw, ate).',
          'Отрицание/вопрос: <b>did</b> + инфинитив: <b>Did you go? I didn\'t go.</b>',
          'Маркеры времени: <b>yesterday, last week, two days ago</b>.',
        ],
      },
      {
        title: '🔮 Будущее время',
        items: [
          '<b>will</b> + инфинитив — решение/обещание: <b>I will help you.</b>',
          '<b>to be going to</b> — план: <b>I am going to visit grandma.</b>',
        ],
      },
      {
        title: '🛒 Повседневные ситуации',
        items: [
          'В магазине: <b>How much is it?</b> — Сколько стоит? <b>I would like…</b> — Я бы хотел…',
          'Вежливые просьбы: <b>Can you help me, please?</b>',
          'Часы и время: <b>It\'s half past three.</b> — Половина четвёртого.',
        ],
      },
    ],
  },
  B1: {
    emoji: '🌳',
    title: 'B1 — Средний уровень',
    about: 'Ты можешь связно рассказывать о впечатлениях, событиях, мечтах и объяснять своё мнение.',
    sections: [
      {
        title: '🧩 Завершённость и длительность',
        items: [
          '<b>Present Perfect</b> — результат к настоящему: <b>I have already done it.</b>',
          'Маркеры: <b>just, already, yet, ever, never, since, for</b>.',
          '<b>Present Perfect vs Past Simple</b>: have done (важен результат) / did (когда именно).',
          '<b>Present Perfect Continuous</b> — длится до сих пор: <b>I have been learning English for 2 years.</b>',
        ],
      },
      {
        title: '🔗 Сложные предложения',
        items: [
          'Условные: <b>If it rains, I will stay home.</b> (1 тип — реальное условие).',
          '<b>Zero conditional</b> — законы природы: <b>If you heat ice, it melts.</b>',
          'Придаточные времени: <b>when, while, before, after</b> + настоящее время в значении будущего.',
          'Модальные глаголы: <b>should</b> (совет), <b>must</b> (долг), <b>can/could</b> (возможность).',
        ],
      },
      {
        title: '💭 Мнение и аргументы',
        items: [
          '<b>In my opinion…</b> — По моему мнению…',
          '<b>I think / I believe / I agree / I disagree</b> — Я думаю / верю / согласен / не согласен.',
          '<b>That\'s why… / because…</b> — Поэтому… / потому что…',
        ],
      },
      {
        title: '📚 Словарный запас',
        items: [
          'Фразовые глаголы: <b>get up</b> (вставать), <b>give up</b> (сдаваться), <b>look for</b> (искать).',
          'Словообразование: <b>-er/-or</b> (teacher), <b>-ment</b> (development), <b>-tion</b> (education).',
          'Прилагательные с <b>-ing/-ed</b>: boring (скучный) / bored (скучающий).',
        ],
      },
    ],
  },
  B2: {
    emoji: '🏔️',
    title: 'B2 — Продвинутый уровень',
    about: 'Свободная речь на большинство тем, гибкая грамматика, понимание сложных текстов и фильмов.',
    sections: [
      {
        title: '🎯 Сложные конструкции',
        items: [
          'Условные 2 и 3 типа: <b>If I were you, I would…</b> / <b>If I had known, I would have…</b>',
          'Косвенная речь: <b>He said he was tired.</b> (сдвиг времени на шаг назад).',
          'Пассивный залог: <b>The book was written in 2020.</b>',
          '<b>I wish + Past Simple</b> — сожаление о настоящем: <b>I wish I knew.</b>',
        ],
      },
      {
        title: '🎨 Стилистика',
        items: [
          'Инверсия для акцента: <b>Never have I seen such a thing.</b>',
          'Связки для эссе: <b>however, therefore, moreover, although, despite, in spite of</b>.',
          'Разговорные сокращения: <b>wanna = want to, gonna = going to, gotta = have got to</b>.',
        ],
      },
      {
        title: '🗣️ Свободная речь',
        items: [
          'Дискуссия: <b>Let me put it another way…</b> — Позволь выразиться иначе…',
          '<b>As far as I know…</b> — Насколько я знаю… <b>It depends on…</b> — Это зависит от…',
          'Переспрос вежливо: <b>Sorry, could you repeat that, please?</b>',
        ],
      },
      {
        title: '📈 Как расти дальше',
        items: [
          'Читайте книги в оригинале и смотрите сериалы с субтитрами — пополняйте словарь.',
          'Делайте карточки языка каждый день: серия 50 верных ответов закрепляет слово навсегда.',
          'Пишите небольшие сочинения и просите родителя проверить через «Расшифруй послание».',
        ],
      },
    ],
  },
};

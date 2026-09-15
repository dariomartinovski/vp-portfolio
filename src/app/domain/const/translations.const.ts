export type Language = 'en' | 'mk';

export const DEFAULT_LANGUAGE: Language = 'en';

export const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: 'assets/images/languages/en.svg' },
  { code: 'mk', label: 'Македонски', flag: 'assets/images/languages/mk.svg' },
];

/**
 * English strings are the keys, so `en` needs no entries: an untranslated key
 * simply renders itself. Any key missing from `mk` falls back to English.
 */
export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {},
  mk: {
    // Navbar
    Home: 'Почетна',
    Work: 'Проекти',
    About: 'За мене',
    Services: 'Услуги',
    Contact: 'Контакт',
    'Robert Martinovski': 'Роберт Мартиновски',
    'Robert Martinovski - Illustrator': 'Роберт Мартиновски - Илустратор',
    'All Work': 'Сите проекти',
    "Let's Talk": 'Ајде да поразговораме',

    // Hero
    '✦ Available for projects': '✦ Достапен за проекти',
    'Digital Illustrator': 'Дигитален илустратор',
    'Visual Designer': 'Визуелен дизајнер',
    'I create illustrations and visual identities that feel human - crafted with care in a world full of generated noise.':
      'Создавам илустрации и визуелни идентитети кои делуваат човечки - изработени со грижа во свет полн со генерирана бучава.',
    'See My Work': 'Погледни ги проектите',
    scroll: 'скролај',

    // Featured
    'Selected Work': 'Избрани проекти',
    'Recent Projects': 'Неодамнешни проекти',
    'View All Work →': 'Погледни ги сите →',

    // About
    'My Story': 'Мојата приказна',
    'From Sketchbooks': 'Од тетратки за цртање',
    'to Screens': 'до екрани',
    "Hey, I'm Robert - a digital artist and illustrator from Macedonia. Drawing has been part of my life for as long as I can remember, but it was in high school that it truly took over. Sketchbooks, fantasy worlds, characters - I was fully immersed.":
      'Здраво, јас сум Роберт - дигитален уметник и илустратор од Македонија. Цртањето е дел од мојот живот онолку долго колку што памтам, но во средно училиште навистина превзема сè. Скицари, фантазиски светови, ликови - бев целосно потопен.',
    "Five years ago I made the jump to digital art, and it opened up a whole new dimension. I fell in love with 2D illustration - bringing characters and worlds to life with a digital brush, exploring the kind of detail and colour that's hard to achieve any other way.":
      'Пред пет години го направив скокот кон дигиталната уметност и таа ми отвори сосема нова димензија. Се заљубив во 2D илустрацијата - оживувам ликови и светови со дигитална четка, истражувајќи детал и боја што тешко се постигнуваат на друг начин.',
    "Alongside illustration I work in graphic design - logos, brand identities, visual content. My path hasn't been a straight line, but every twist brought me back to the same place: creating. That's where I belong.":
      'Покрај илустрација, работам и графички дизајн - лога, бренд идентитети, визуелни содржини. Мојот пат не беше права линија, но секое свртување ме враќаше на исто место: создавањето. Таму припаѓам.',

    // Timeline
    'Pencil meets paper': 'Моливот среќава хартија',
    'Drawing became a constant from an early age - characters, creatures, worlds pulled straight from imagination.':
      'Цртањето стана константа од рана возраст - ликови, суштества, светови извлечени директно од имагинацијата.',
    'High school, full obsession': 'Средно училиште, целосна опсесија',
    "Art took over in high school. Sketchbooks everywhere, fantasy worlds, characters - it was clear this wasn't just a hobby.":
      'Уметноста превзема сè во средно. Тетратки за цртање насекаде, фантазиски светови, ликови - беше јасно дека ова не е само хоби.',
    'First illustration work': 'Прва илустраторска работа',
    'Started producing illustrations for educational and promotional materials at International Slavic University.':
      'Почнав да изработувам илустрации за едукативни и промотивни материјали на Меѓународниот словенски универзитет.',
    'Editor, cartoonist, illustrator': 'Уредник, карикатурист, илустратор',
    'Creating illustrations and caricatures for publications, collaborating with authors and academic staff on real publishing projects.':
      'Создавам илустрации и карикатури за публикации, соработувам со автори и академски кадар на вистински издавачки проекти.',
    Now: 'Сега',
    'Building something of my own': 'Градам нешто свое',
    "Freelancing, illustrating, and designing - doing what I've always done, but on my own terms.":
      'Фриленс, илустрирање и дизајн - правам што одсекогаш сум го правел, но по свои правила.',

    // Services
    'What I Do': 'Што правам',
    'How I Can Help': 'Како можам да помогнам',
    'Digitalize Your Vision': 'Дигитализирајте ја вашата визија',
    'Bring hand-drawn concepts or rough ideas into polished digital illustrations - from first sketch to final file.':
      'Претворете рачно нацртани концепти или груби идеи во полирани дигитални илустрации - од прва скица до финален фајл.',
    'Sketch → Vector → Delivery': 'Скица → Вектор → Испорака',
    'Human-Made in the Age of AI': 'Човечка изработка во ерата на AI',
    'Stand out with artwork that carries real personality and craft. Not generated - created.':
      'Истакнете се со уметност што носи вистинска личност и занает. Не генерирано - создадено.',
    'Distinctly yours': 'Препознатливо ваше',
    'Brand Identity & Illustration': 'Бренд идентитет и илустрација',
    'Logos, visual systems, and illustration sets that give your brand a consistent, recognizable face.':
      'Логоа, визуелни системи и илустраторски сетови кои на вашиот бренд му даваат конзистентно, препознатливо лице.',
    'From concept to guidelines': 'Од концепт до насоки',

    // Contact
    'Get In Touch': 'Контактирајте',
    "Let's Make": 'Ајде да создадеме',
    'Something.': 'нешто.',
    "Have a project in mind? A brand to build? An illustration you're dreaming of? Let's talk about it.":
      'Имате проект на ум? Бренд за градење? Илустрација за која сонувате? Ајде да поразговораме.',

    // Footer
    'All rights reserved': 'Сите права се задржани',

    // Work page
    '← Back': '← Назад',
    Portfolio: 'Портфолио',
    'A collection of illustrations, branding, and design projects.':
      'Колекција од илустрации, брендирање и дизајн проекти.',
    All: 'Сите',
    Illustration: 'Илустрација',
    Branding: 'Брендирање',
    'UI Design': 'UI дизајн',
    Print: 'Печат',
    'No work in this category yet.': 'Засега нема работи во оваа категорија.',
    work: 'работа',
    works: 'работи',

    // Contact form
    Name: 'Име',
    'Your name': 'Вашето име',
    'Please enter your name': 'Ве молиме внесете име',
    Email: 'Е-пошта',
    'Please enter a valid email': 'Ве молиме внесете валидна е-пошта',
    'Project type': 'Тип на проект',
    '(optional)': '(опционално)',
    'Select a type...': 'Изберете тип...',
    'Brand Identity': 'Визуелен идентитет',
    'Print Design': 'Дизајн за печат',
    Other: 'Друго',
    Message: 'Порака',
    'Tell me about your project...': 'Кажете ми за вашиот проект...',
    'Please enter a message (min 10 characters)': 'Ве молиме внесете порака (мин. 10 знаци)',
    'Send Message': 'Испрати порака',
    'Message sent.': 'Пораката е испратена.',
    "Thank you for reaching out - I'll get back to you soon.":
      'Ви благодарам што ме контактиравте - ќе ви одговорам наскоро.',
    'Something went wrong. Please try again or email me directly.':
      'Нешто тргна наопаку. Обидете се повторно или пишете ми директно.',
    'Try again': 'Обиди се повторно',
  },
};

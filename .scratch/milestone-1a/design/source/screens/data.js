// Fake data for the Workouterr V1 web app — follows the product spec (exercises, routines, plans, sessions).
const TODAY = '2026-10-10';

const MUSCLE_KEYS = ['CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'CORE', 'LEGS'];
const MUSCLES = { CHEST: 'Klatka', BACK: 'Plecy', SHOULDERS: 'Barki', ARMS: 'Ramiona', CORE: 'Korpus', LEGS: 'Nogi' };
const METRICS = { WEIGHT_REPS: 'Ciężar + powtórzenia', REPS: 'Powtórzenia', TIME: 'Czas' };
const METRICS_SHORT = { WEIGHT_REPS: 'Ciężar + powt.', REPS: 'Powtórzenia', TIME: 'Czas' };

const EXERCISES = [
  { id: 'bench', name: 'Wyciskanie sztangi leżąc', desc: 'Sztanga opuszczana do mostka, łopatki ściągnięte.', metric: 'WEIGHT_REPS', step: 2.5, muscles: ['CHEST', 'SHOULDERS', 'ARMS'], used: true },
  { id: 'squat', name: 'Przysiad ze sztangą', desc: 'Sztanga na górnej części pleców, zejście poniżej równoległej.', metric: 'WEIGHT_REPS', step: 2.5, muscles: ['LEGS', 'CORE'], used: true },
  { id: 'deadlift', name: 'Martwy ciąg', desc: 'Klasyczny, sztanga prowadzona blisko nóg.', metric: 'WEIGHT_REPS', step: 2.5, muscles: ['BACK', 'LEGS'], used: true },
  { id: 'ohp', name: 'Wyciskanie żołnierskie', desc: 'Stojąc, sztanga z obojczyków nad głowę.', metric: 'WEIGHT_REPS', step: 1.25, muscles: ['SHOULDERS', 'ARMS'], used: true },
  { id: 'bbrow', name: 'Wiosłowanie sztangą', desc: 'Tułów pochylony, sztanga do pępka.', metric: 'WEIGHT_REPS', step: 2.5, muscles: ['BACK', 'ARMS'], used: true },
  { id: 'pullup', name: 'Podciąganie', desc: 'Nachwyt, pełny zakres ruchu.', metric: 'REPS', step: 1, muscles: ['BACK', 'ARMS'], used: true },
  { id: 'wpullup', name: 'Podciąganie z obciążeniem', desc: 'Ciężar to obciążenie dodatkowe na pasie.', metric: 'WEIGHT_REPS', step: 1.25, added: true, muscles: ['BACK', 'ARMS'], used: true },
  { id: 'dips', name: 'Pompki na poręczach', desc: 'Tułów lekko pochylony, łokcie do 90°.', metric: 'REPS', step: 1, muscles: ['CHEST', 'ARMS'], used: true },
  { id: 'lunge', name: 'Wykroki z hantlami', desc: 'Krok w przód, kolano tylnej nogi tuż nad podłogą.', metric: 'WEIGHT_REPS', step: 1, perSide: true, muscles: ['LEGS'], used: true },
  { id: 'dbrow', name: 'Wiosłowanie hantlem', desc: 'Jednorącz, z podparciem na ławce.', metric: 'WEIGHT_REPS', step: 1, perSide: true, muscles: ['BACK'], used: true },
  { id: 'curl', name: 'Uginanie ramion z hantlami', desc: 'Łokcie przy tułowiu, bez bujania.', metric: 'WEIGHT_REPS', step: 1, muscles: ['ARMS'], used: true },
  { id: 'latraise', name: 'Wznosy hantli bokiem', desc: 'Do wysokości barków, łokcie lekko ugięte.', metric: 'WEIGHT_REPS', step: 1, muscles: ['SHOULDERS'], used: true },
  { id: 'legext', name: 'Prostowanie nóg na maszynie', desc: 'Pełny wyprost, kontrola w fazie opuszczania.', metric: 'WEIGHT_REPS', step: 5, muscles: ['LEGS'], used: true },
  { id: 'legcurl', name: 'Uginanie nóg na maszynie', desc: 'Leżąc, pięty do pośladków.', metric: 'WEIGHT_REPS', step: 5, muscles: ['LEGS'], used: false },
  { id: 'plank', name: 'Deska', desc: 'Podpór na przedramionach, ciało w jednej linii.', metric: 'TIME', step: 5, muscles: ['CORE'], used: true },
  { id: 'sideplank', name: 'Deska bokiem', desc: 'Podpór na przedramieniu, biodra wysoko.', metric: 'TIME', step: 5, perSide: true, muscles: ['CORE'], used: true },
  { id: 'smith', name: 'Wyciskanie na suwnicy Smitha', desc: 'Zastąpione wyciskaniem sztangi.', metric: 'WEIGHT_REPS', step: 2.5, muscles: ['CHEST'], used: true, archived: true },
].map((e) => ({ perSide: false, added: false, archived: false, ...e }));

const ROUTINES = [
  { id: 'push', name: 'Push', desc: 'Klatka, barki, triceps', entries: [
    { id: 'p1', ex: 'bench', sets: 4, rest: 150, ladder: [6, 8, 10] },
    { id: 'p2', ex: 'ohp', sets: 3, rest: 120, ladder: [8, 10, 12] },
    { id: 'p3', ex: 'dips', sets: 3, rest: 90 },
    { id: 'p4', ex: 'plank', sets: 3, rest: 60 },
  ] },
  { id: 'pull', name: 'Pull', desc: 'Plecy i biceps', entries: [
    { id: 'l1', ex: 'deadlift', sets: 3, rest: 180, ladder: [5] },
    { id: 'l2', ex: 'pullup', sets: 4, rest: 120 },
    { id: 'l3', ex: 'dbrow', sets: 3, rest: 90, ladder: [8, 10, 12] },
    { id: 'l4', ex: 'curl', sets: 3, rest: 60, ladder: [10, 12, 15] },
  ] },
  { id: 'legs', name: 'Nogi', desc: 'Ciężki przysiad na start, lekki na koniec', entries: [
    { id: 'n1', ex: 'squat', sets: 4, rest: 180, ladder: [5, 6, 8] },
    { id: 'n2', ex: 'lunge', sets: 3, rest: 90, ladder: [8, 10, 12] },
    { id: 'n3', ex: 'legext', sets: 3, rest: 60, ladder: [12, 15] },
    { id: 'n4', ex: 'squat', sets: 2, rest: 120, ladder: [10, 12] },
    { id: 'n5', ex: 'sideplank', sets: 2, rest: 45 },
  ] },
  { id: 'fbw', name: 'Full body', desc: 'Na wyjazd albo gdy brakuje czasu', entries: [
    { id: 'f1', ex: 'squat', sets: 3, rest: 150, ladder: [6, 8, 10] },
    { id: 'f2', ex: 'bench', sets: 3, rest: 150, ladder: [6, 8, 10] },
    { id: 'f3', ex: 'bbrow', sets: 3, rest: 120, ladder: [8, 10, 12] },
    { id: 'f4', ex: 'wpullup', sets: 3, rest: 120, ladder: [5, 6, 8] },
  ] },
].map((r) => ({ archived: false, ...r }));

const PLANS = [
  { id: 'ppl', name: 'Push / Pull / Nogi', desc: '3–4 treningi w tygodniu', routines: ['push', 'pull', 'legs'] },
  { id: 'ul', name: 'Góra / Dół', desc: 'Nogi co drugi trening', routines: ['push', 'legs', 'pull', 'legs'] },
];

const wr = (w, reps) => reps.map((r) => ({ w, r }));
const rp = (reps) => reps.map((r) => ({ r }));
const tm = (ts) => ts.map((t) => ({ t }));
const X = (exId, entryId, target, sets, mark, note, kind) => ({ exId, entryId, kind: kind || 'routine', target, sets, mark: mark || null, note: note || '' });

// Newest first. planPos = position in the plan the session was done for (rotation is derived from this).
const HISTORY = [
  { id: 's7', date: '2026-10-08', start: '18:04', tz: 'Europe/Warsaw', routine: 'legs', plan: 'ppl', planPos: 2, dur: 66, ex: [
    X('squat', 'n1', { w: 110, r: 6 }, wr(110, [6, 6, 6, 6]), 'up'),
    X('lunge', 'n2', { w: 19, r: 8 }, wr(19, [8, 8, 8]), 'keep'),
    X('legext', 'n3', { w: 55, r: 12 }, [], null, '', 'skipped'),
    X('squat', 'n4', { w: 77.5, r: 10 }, wr(77.5, [10, 10]), 'keep', 'Maszyna zajęta — prostowanie pominięte.'),
    X('sideplank', 'n5', { t: 30 }, tm([30, 30]), 'up'),
  ] },
  { id: 's6', date: '2026-10-06', start: '19:12', tz: 'Europe/Warsaw', routine: 'pull', plan: 'ppl', planPos: 1, dur: 63, ex: [
    X('deadlift', 'l1', { w: 140, r: 5 }, wr(140, [5, 5, 5]), 'up', 'Pas od drugiej serii.'),
    X('pullup', 'l2', { r: 8 }, rp([8, 8, 7, 7]), 'keep'),
    X('dbrow', 'l3', { w: 30, r: 10 }, wr(30, [10, 10, 10]), 'up'),
    X('curl', 'l4', { w: 14, r: 12 }, wr(14, [12, 12, 11]), 'keep'),
    X('latraise', null, { w: 8, r: 15 }, wr(8, [15, 15, 15]), null, '', 'extra'),
  ] },
  { id: 's5', date: '2026-10-04', start: '10:30', tz: 'Europe/Warsaw', routine: 'push', plan: 'ppl', planPos: 0, dur: 57, ex: [
    X('bench', 'p1', { w: 80, r: 8 }, wr(80, [8, 8, 8, 7]), 'keep', 'Ostatnia seria ciężko — łokcie bliżej tułowia.'),
    X('ohp', 'p2', { w: 40, r: 12 }, wr(40, [12, 12, 12]), 'up'),
    X('dips', 'p3', { r: 12 }, rp([12, 12, 10]), 'keep'),
    X('plank', 'p4', { t: 45 }, tm([45, 45, 45]), 'up'),
  ] },
  { id: 's4', date: '2026-10-01', start: '18:20', tz: 'Europe/Warsaw', routine: 'legs', plan: 'ppl', planPos: 2, dur: 70, ex: [
    X('squat', 'n1', { w: 110, r: 5 }, wr(110, [5, 5, 5, 5]), 'up'),
    X('lunge', 'n2', { w: 18, r: 12 }, wr(18, [12, 12, 12]), 'up'),
    X('legext', 'n3', { w: 50, r: 15 }, wr(50, [15, 15, 15]), 'up'),
    X('squat', 'n4', { w: 75, r: 12 }, wr(75, [12, 12]), 'up'),
    X('sideplank', 'n5', { t: 25 }, tm([25, 25]), 'up'),
  ] },
  { id: 's3', date: '2026-09-29', start: '19:05', tz: 'Europe/Warsaw', routine: 'pull', plan: 'ppl', planPos: 1, dur: 61, ex: [
    X('deadlift', 'l1', { w: 135, r: 5 }, wr(135, [5, 5, 5]), 'up'),
    X('pullup', 'l2', { r: 8 }, rp([8, 7, 7, 6]), 'keep'),
    X('dbrow', 'l3', { w: 30, r: 8 }, wr(30, [8, 8, 8]), 'up'),
    X('curl', 'l4', { w: 14, r: 10 }, wr(14, [10, 10, 10]), 'up'),
  ] },
  { id: 's2', date: '2026-09-27', start: '11:00', tz: 'Europe/Warsaw', routine: 'push', plan: 'ppl', planPos: 0, dur: 58, ex: [
    X('bench', 'p1', { w: 80, r: 6 }, wr(80, [6, 6, 6, 6]), 'up'),
    X('ohp', 'p2', { w: 40, r: 10 }, wr(40, [10, 10, 10]), 'up'),
    X('dips', 'p3', { r: 11 }, rp([11, 11, 11]), 'up'),
    X('plank', 'p4', { t: 40 }, tm([40, 40, 40]), 'up'),
  ] },
  { id: 's1', date: '2026-09-25', start: '07:15', tz: 'Europe/Berlin', routine: 'fbw', plan: null, planPos: null, dur: 52, ex: [
    X('squat', 'f1', { w: 95, r: 8 }, wr(95, [8, 8, 8]), 'keep'),
    X('bench', 'f2', { w: 75, r: 8 }, wr(75, [8, 8, 8]), 'up'),
    X('bbrow', 'f3', { w: 60, r: 10 }, wr(60, [10, 10, 10]), 'keep'),
    X('wpullup', 'f4', { w: 10, r: 6 }, wr(10, [6, 6, 5]), 'keep', 'Hotelowa siłownia, Berlin.'),
  ] },
];

// One point per session (from logged values). n = sets, used for volume.
const PROGRESS = {
  bench: [['16.08', 72.5, 10], ['23.08', 75, 8], ['30.08', 75, 10], ['6.09', 77.5, 8], ['13.09', 77.5, 10], ['20.09', 80, 6], ['27.09', 80, 6], ['4.10', 80, 8]].map(([d, w, r]) => ({ d, w, r, n: 4 })),
  squat: [['20.08', 97.5, 8], ['27.08', 100, 6], ['3.09', 100, 8], ['10.09', 102.5, 6], ['17.09', 105, 6], ['24.09', 107.5, 8], ['1.10', 110, 5], ['8.10', 110, 6]].map(([d, w, r]) => ({ d, w, r, n: 4 })),
  deadlift: [['22.08', 120], ['29.08', 125], ['5.09', 127.5], ['12.09', 130], ['19.09', 132.5], ['29.09', 135], ['6.10', 140]].map(([d, w]) => ({ d, w, r: 5, n: 3 })),
  ohp: [['16.08', 35, 12], ['23.08', 36.25, 8], ['30.08', 37.5, 8], ['6.09', 37.5, 10], ['13.09', 38.75, 8], ['20.09', 40, 8], ['27.09', 40, 10], ['4.10', 40, 12]].map(([d, w, r]) => ({ d, w, r, n: 3 })),
  pullup: [['18.08', 6], ['25.08', 6], ['1.09', 7], ['8.09', 7], ['15.09', 7], ['22.09', 8], ['29.09', 8], ['6.10', 8]].map(([d, r]) => ({ d, r })),
  plank: [['16.08', 30], ['23.08', 30], ['30.08', 35], ['6.09', 35], ['13.09', 40], ['20.09', 40], ['27.09', 40], ['4.10', 45]].map(([d, t]) => ({ d, t })),
};

// Best weight for each rep count logged (no estimated 1RM).
const REPMAX = {
  bench: [[6, 80, '27.09'], [8, 80, '4.10'], [10, 77.5, '13.09']],
  squat: [[5, 110, '1.10'], [6, 110, '8.10'], [8, 107.5, '24.09'], [10, 77.5, '8.10'], [12, 75, '1.10']],
  deadlift: [[5, 140, '6.10']],
  ohp: [[8, 40, '20.09'], [10, 40, '27.09'], [12, 40, '4.10']],
};

const RECORDS = [
  { ex: 'bench', v: '80 kg × 8', d: '4.10' },
  { ex: 'squat', v: '110 kg × 6', d: '8.10' },
  { ex: 'deadlift', v: '140 kg × 5', d: '6.10' },
  { ex: 'ohp', v: '40 kg × 12', d: '4.10' },
  { ex: 'pullup', v: '8 powt.', d: '6.10' },
  { ex: 'wpullup', v: '+10 kg × 6', d: '25.09' },
  { ex: 'dbrow', v: '30 kg × 10/stronę', d: '6.10' },
  { ex: 'plank', v: '45 s', d: '4.10' },
  { ex: 'sideplank', v: '30 s/stronę', d: '8.10' },
];

const USER = { name: 'Marek K.', email: 'marek@example.com', initials: 'MK' };

Object.assign(window, { TODAY, MUSCLE_KEYS, MUSCLES, METRICS, METRICS_SHORT, EXERCISES, ROUTINES, PLANS, HISTORY, PROGRESS, REPMAX, RECORDS, USER });

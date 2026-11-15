import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createDemoDashboard } from '../src/data/demo-dashboard.ts';
import { ageFromBirthDate, filterHistory, filterSessionHistory, formatDate, formatDuration, historySummary } from '../src/utils/dashboard.ts';
import { adaptBackendWorkout } from '../src/services/workoutAdapter.ts';
import { profileToDraft, toProfilePayload } from '../src/utils/registration.ts';

test('demonstração tem dados coerentes, sem simular material de exercício disponível', () => {
  const data = createDemoDashboard(new Date(2026, 10, 4));
  assert.equal(data.workout.date, '2026-11-04');
  assert.equal(data.history.length, 5);
  assert.equal(data.week.length, 7);
  assert.equal(data.week[0].date, '2026-10-29');
  assert.equal(data.week[6].date, '2026-11-04');
  assert.ok(data.workout.exercises.every(exercise => data.profile.exerciseCategories.includes(exercise.category)));
  assert.ok(data.workout.exercises.reduce((sum, exercise) => sum + exercise.estimatedSeconds, 0) <= data.profile.availableMinutesPerDay * 60);
  assert.ok(data.workout.exercises.every(exercise => exercise.gifUrl === null));
  assert.ok(data.history.slice(0, 3).every(session => session.status === 'completed'));
});

test('histórico distingue sessões encerradas de concluídas e mantém tempo registrado', () => {
  const data = createDemoDashboard(new Date(2026, 10, 4));
  assert.deepEqual(historySummary(data.history), { completed: 4, ended: 1, totalSeconds: 3300 });
  const ended = filterHistory(data.history, 'ended', null);
  assert.equal(ended.length, 1);
  assert.equal(ended[0].exercises.filter(exercise => exercise.completed).length, 2);
  const completed = filterHistory(data.history, 'completed', null);
  assert.equal(completed.length, 4);
  const date = data.history[0].date;
  assert.equal(filterHistory(data.history, 'all', date).length, 1);
  assert.equal(filterHistory(data.history, 'ended', date).length, 0);
  assert.deepEqual(historySummary([]), { completed: 0, ended: 0, totalSeconds: 0 });
  assert.equal(data.history.length, 5);
});

test('durações longas e datas não dependem de parsing UTC', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3661), '01:01:01');
  assert.equal(formatDate('2026-11-04'), '04/11/2026');
  assert.equal(createDemoDashboard(new Date(2026, 10, 4, 23, 59)).workout.date, '2026-11-04');
  assert.equal(ageFromBirthDate('2000-03-15', new Date(2026, 2, 14)), 25);
  assert.equal(ageFromBirthDate('2000-03-15', new Date(2026, 2, 15)), 26);
});

test('edição de perfil reaproveita normalização sem exigir ou transportar senha', () => {
  const data = createDemoDashboard(new Date(2026, 10, 4));
  const originalHistory = JSON.stringify(data.history);
  const originalWorkout = JSON.stringify(data.workout);
  const draft = profileToDraft(data.profile);
  draft.fullName = '  Alex   Exemplo  ';
  draft.minutes = '30';
  draft.categories.push('Pilates');
  const profile = toProfilePayload(draft);
  assert.equal(profile.fullName, 'Alex Exemplo');
  assert.equal(profile.availableMinutesPerDay, 30);
  assert.equal('password' in profile, false);
  assert.equal('confirmPassword' in profile, false);
  assert.ok(!data.profile.exerciseCategories.includes('Pilates'));
  assert.equal(JSON.stringify(data.history), originalHistory);
  assert.equal(JSON.stringify(data.workout), originalWorkout);
  assert.throws(() => toProfilePayload({ ...draft, accentColor: '#000000' }), /Cor de destaque/);
});

test('resposta do backend preserva ordem, conclusão, GIF e unidade de duração sem alterar a origem', () => {
  const fixture = { dailyWorkoutId: 42, date: '2026-11-15T00:00:00.000Z', totalDurationMinutes: 4,
    exercises: [
      { exerciseOrder: 2, durationEstimate: 2.5, completed: 0, workoutName: 'Flexão', categoryName: 'Calistenia', muscleGroup: 'Braços', gifUrl: 'https://example.com/flexao.gif' },
      { exerciseOrder: 1, durationEstimate: 1.5, completed: true, workoutName: 'Agachamento', categoryName: 'Calistenia', muscleGroup: 'Pernas', gifUrl: null },
    ] };
  const result = adaptBackendWorkout(fixture);
  assert.equal(result.date, '2026-11-15');
  assert.equal(result.id, '42');
  assert.deepEqual(result.exercises.map(item => [item.order, item.estimatedSeconds, item.completed]), [[1, 90, true], [2, 150, false]]);
  assert.equal(result.exercises[1].gifUrl, fixture.exercises[0].gifUrl);
  assert.equal(fixture.exercises[0].exerciseOrder, 2);
  assert.deepEqual(adaptBackendWorkout({ ...fixture, exercises: [] }).exercises, []);
  assert.throws(() => adaptBackendWorkout({ ...fixture, date: null }), /data válida/);
  assert.throws(() => adaptBackendWorkout({ ...fixture, exercises: [null] }), /exercício/);
  assert.throws(() => adaptBackendWorkout({ ...fixture, exercises: [fixture.exercises[0], fixture.exercises[0]] }), /exercício/);
});

test('filtros de histórico combinam situação com intervalo inclusivo e aceitam resultado vazio', () => {
  const history = createDemoDashboard(new Date(2026, 10, 4)).history;
  const ended = history.find(item => item.status === 'ended');
  assert.deepEqual(filterSessionHistory(history, { status: 'ended', from: ended.date, to: ended.date }), [ended]);
  assert.deepEqual(filterSessionHistory(history, { status: 'completed', from: ended.date, to: ended.date }), []);
  assert.deepEqual(filterSessionHistory(history, { status: 'all', from: '', to: '' }), history);
  assert.deepEqual(filterSessionHistory([], { status: 'all', from: '', to: '' }), []);
});

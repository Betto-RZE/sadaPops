import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_REGISTRATION_THEME, resolveRegistrationTheme } from './themes';
import { isStateId, isValidEmail, plantOnce, REGISTRATION_KEYS as keys, restoreRegistration, writeStored, type RegistrationStorage } from './registrationState';

function storage(initial: Record<string, string> = {}): RegistrationStorage {
  const entries = new Map(Object.entries(initial));
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => { entries.set(key, value); },
    removeItem: key => { entries.delete(key); },
  };
}

test('restaura entidad registrada, correo y tema; migra la paleta antigua', () => {
  const saved = storage({ [keys.state]: '14', [keys.color]: 'morado-voxel', [keys.email]: '  prueba@example.com  ' });
  const restored = restoreRegistration(saved);
  assert.equal(restored.plantedStateId, '14');
  assert.equal(restored.email, 'prueba@example.com');
  assert.equal(restored.theme.id, 'lila-claro');
  assert.equal(saved.getItem(keys.color), 'lila-claro');
});

test('los seis IDs antiguos y las preferencias desconocidas tienen una salida válida', () => {
  assert.equal(resolveRegistrationTheme('rosa-dalia').id, 'fucsia');
  assert.equal(resolveRegistrationTheme('carmin').id, 'vino');
  for (const id of ['cempasuchil', 'jade', 'cobalto', 'desconocido', null]) {
    assert.equal(resolveRegistrationTheme(id), DEFAULT_REGISTRATION_THEME);
  }
  assert.equal(resolveRegistrationTheme('rosa-palido').id, 'rosa-palido');
});

test('ignora entidades y correos corruptos al restaurar', () => {
  const restored = restoreRegistration(storage({ [keys.state]: '99', [keys.email]: 'invalido', [keys.color]: 'otro' }));
  assert.equal(restored.plantedStateId, null);
  assert.equal(restored.email, '');
  assert.equal(restored.theme.id, 'fucsia');
  for (const id of ['00', '33', '9', '', '09texto', null]) assert.equal(isStateId(id), false);
});

test('primer envío añade una dalia; los siguientes conservan la entidad y no suman', () => {
  const saved = storage();
  const events: string[] = [];
  const first = plantOnce(saved, null, '09', id => events.push(id));
  const second = plantOnce(saved, first.stateId, '14', id => events.push(id));
  const anotherTab = plantOnce(saved, null, '19', id => events.push(id));
  assert.deepEqual(events, ['09']);
  assert.equal(second.stateId, '09');
  assert.equal(anotherTab.added, false);
  assert.equal(saved.getItem(keys.state), '09');
});

test('almacenamiento bloqueado no impide registrar y el guard de sesión evita duplicados', () => {
  const blocked: RegistrationStorage = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
    removeItem() { throw new Error('SecurityError'); },
  };
  assert.equal(restoreRegistration(blocked).theme.id, 'fucsia');
  const events: string[] = [];
  const result = plantOnce(blocked, null, '32', id => events.push(id));
  plantOnce(blocked, result.stateId, '32', id => events.push(id));
  assert.equal(result.persisted, false);
  assert.deepEqual(events, ['32']);
});

test('sin almacenamiento hay registro de sesión; nunca se emiten IDs inválidos', () => {
  assert.equal(writeStored(null, keys.color, 'vino'), false);
  assert.equal(restoreRegistration(null).plantedStateId, null);
  assert.throws(() => plantOnce(storage(), null, '99', () => assert.fail('Invalid event')));
});

test('la validación depende del correo actual, no de una preferencia anterior', () => {
  assert.equal(isValidEmail('  nuevo@example.com '), true);
  for (const value of ['', ' ', 'sin-arroba', 'a@b', 'a b@ejemplo.com']) assert.equal(isValidEmail(value), false);
});

test('retirar consentimiento elimina el correo y su restauración queda desactivada', () => {
  const saved = storage({ [keys.email]: 'prueba@example.com' });
  assert.equal(writeStored(saved, keys.email, null), true);
  assert.equal(restoreRegistration(saved).email, '');
});

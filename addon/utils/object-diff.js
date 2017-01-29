import Ember from 'ember';

const ARRAY_INDEX_REGEX = /^\[(\d+)\]$/;
const GET_VALUE = 0;
const INDEX_ARRAY = 1;

function isObject(value) {
  return Ember.typeOf(value) === 'object';
}

function isArray(value) {
  return Ember.isArray(value);
}

function generateArrayKeys(prefix, array) {
  Ember.assert(isArray(array), `You must pass an array to 'generateArrayKeys'. You passed '${Ember.typeOf(array)}'`);
  let nestedKeys = Ember.A();
  array.forEach((value, index) => {
    let indexKey = `${prefix}.[${index}]`;
    if (isArray(value)) {
      nestedKeys.pushObjects(generateArrayKeys(indexKey, value));
    } else if (isObject(value)) {
      nestedKeys.pushObjects(generateObjectKeys(indexKey, value));
    } else {
      nestedKeys.pushObject(indexKey);
    }
  });
  return nestedKeys;
}

function generateObjectKeys(prefix, object) {
  Ember.assert(isObject(object), `You must pass an object to 'generateFullKeySet'. You passed '${Ember.typeOf(object)}'`);
  let keys = Ember.keys(object);
  let nestedKeys = Ember.A();
  keys.forEach(key => {
    let value = Ember.get(object, key);
    let prefixedKey = Ember.isPresent(prefix) ? `${prefix}.${key}` : key;
    if (isObject(value)) {
      nestedKeys.pushObjects(generateObjectKeys(prefixedKey, value));
    } else if (isArray(value)) {
      nestedKeys.pushObjects(generateArrayKeys(prefixedKey, value));
    } else {
      nestedKeys.pushObject(prefixedKey);
    }
  });
  return nestedKeys;
}

function generateFullKeySet(object) {
  return generateObjectKeys(null, object);
}

function splitKey(fullObjectKey) {
  let splitKeys = fullObjectKey.split('.');
  return splitKeys.map(key => {
    let arrayIndexMatches = ARRAY_INDEX_REGEX.exec(key);
    if (Ember.isEmpty(arrayIndexMatches)) {
      return { action: GET_VALUE, key: key };
    } else {
      return { action: INDEX_ARRAY, index: arrayIndexMatches[1] };
    }
  });
}

function getValueForKey(object, key) {
  return splitKey(key).reduce((fragment, command) => {
    if (Ember.isNone(fragment)) {
      return null;
    } else if (command.action === GET_VALUE) {
      return Ember.get(fragment, command.key);
    } else if (command.action === INDEX_ARRAY){
      return fragment[command.index];
    }
  }, object);
}

function getDifferences(objectA, objectB) {
  let keys = Ember.A(generateFullKeySet(objectA).concat(generateFullKeySet(objectB))).uniq();
  return Ember.A(keys.map(key => {
    let valueForA = getValueForKey(objectA, key);
    let valueForB = getValueForKey(objectB, key);
    if (!Ember.isEqual(valueForA, valueForB)) {
      return { key: key, difference: Ember.A([valueForA, valueForB]) };
    }
  })).compact();
}

export { generateFullKeySet, getDifferences };
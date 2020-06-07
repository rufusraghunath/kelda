const data = true;

export default function(number, emptyArray, array, emptyObject, object) {
  const argumentTypesAreCorrect =
    number === 1 &&
    Array.isArray(emptyArray) &&
    Array.isArray(array) &&
    typeof emptyObject === 'object' &&
    object.hello === 'world';

  if (argumentTypesAreCorrect) {
    return data;
  }

  throw new Error('Argument types were incorrect');
}

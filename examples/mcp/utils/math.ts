/**
 * Machin's PI algorithm
 * Inspired by https://trans4mind.com/personal_development/JavaScript/longnumPiMachin.htm
 *
 * calc(d) Returns PI, where `d` is the number of desired digits
 * has with the original code and with Machin's formula, it provides a few extra
 * digits, which are not guaranteed to be exact, but are leftovers from the calculations.
 */

/* Local variables ----------------------------------------------------------- */

// Math method cache
const pow = Math.pow;
const floor = Math.floor;
const ceil = Math.ceil;
const abs = Math.abs;

// JS Number bases
const base = pow(10, 11);
const cellSize = floor(Math.log(base) / Math.LN10);

/* Methods ------------------------------------------------------------------- */

function clearArray(aX, iBase) {
  aX.fill(null);
  aX[0] = iBase;
}

function isEmpty(aX) {
  return aX.every(digit => digit <= 0);
}

function add(n, aX, aY) {
  let carry = 0;
  for (let i = n - 1; i >= 0; i--) {
    aX[i] = aX[i] + aY[i] + carry;
    if (aX[i] < base) carry = 0;
    else {
      carry = 1;
      aX[i] = aX[i] - base;
    }
  }
}

function substract(n, aX, aY) {
  for (let i = n - 1; i >= 0; i--) {
    aX[i] = aX[i] - aY[i];
    if (aX[i] < 0 && i > 0) {
      aX[i] = aX[i] + base;
      aX[i - 1] = aX[i - 1] - 1;
    }
  }
}

function multiply(n, aX, imult) {
  let carry = 0;
  for (let i = n - 1; i >= 0; i--) {
    let prod = aX[i] * imult + carry;
    if (prod >= base) {
      carry = floor(prod / base);
      prod = prod - (carry * base);
    }
    else {
      carry = 0;
    }
    aX[i] = prod;
  }
}

function divide(n, aX, iDiv, aY) {
  let carry = 0;
  for (let i = 0; i < n; i++) {
    const currVal = aX[i] + carry * base;
    const theDiv = floor(currVal / iDiv);
    carry = currVal - theDiv * iDiv;
    aY[i] = theDiv;
  }
}

function arctan(iAng, n, aX, aAngle, aDivK) {
  const iAng_squared = iAng * iAng;
  let k = 3;
  let sign = 0;
  clearArray(aX, 0);
  clearArray(aAngle, 1);
  divide(n, aAngle, iAng, aAngle);
  add(n, aX, aAngle);

  while (!isEmpty(aAngle)) {
    divide(n, aAngle, iAng_squared, aAngle);
    divide(n, aAngle, k, aDivK);
    if (sign > 0) add(n, aX, aDivK);
    else substract(n, aX, aDivK);
    k = k + 2;
    sign = 1 - sign;
  }
}

function PICalc(numDec = 10) {
  const iAng = new Array(10);
  const coeff = new Array(10);
  const arrayLength = ceil(1 + numDec / cellSize);
  const aPI = new Array(arrayLength);
  const aArctan = new Array(arrayLength);
  const aAngle = new Array(arrayLength);
  const aDivK = new Array(arrayLength);
  coeff[0] = 4;
  coeff[1] = -1;
  coeff[2] = 0;
  iAng[0] = 5;
  iAng[1] = 239;
  iAng[2] = 0;
  clearArray(aPI, 0);
  clearArray(aAngle, 0);
  clearArray(aDivK, 0);
  for (let i = 0; coeff[i] !== 0; i++) {
    arctan(iAng[i], arrayLength, aArctan, aAngle, aDivK);
    multiply(arrayLength, aArctan, abs(coeff[i]));
    if (coeff[i] > 0) add(arrayLength, aPI, aArctan);
    else substract(arrayLength, aPI, aArctan);
  }

  multiply(arrayLength, aPI, 4);
  return print(aPI);
}

function print(aPI) {
  return aPI.map((block, i) => {
    if (i === 0) return '3.';
    const blockDef = `${block}`;
    return '0'.repeat(cellSize - blockDef.length) + blockDef;
  }).join('');
}

/* Exports ------------------------------------------------------------------- */

export { PICalc };

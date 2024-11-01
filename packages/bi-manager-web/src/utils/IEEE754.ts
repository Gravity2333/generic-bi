interface IEEENumberType {
  /** 64字节长度的存储空间 52bits*/
  binaryBuffer: number[];
  /** 符号位 1bit */
  sign: 0 | 1;
  /** exponent 指数偏移 11bits */
  exponent: number[];
  /** fraction 尾数 52bits */
  fraction: number[];
  /** hide 隐藏位 1bits */
  hide: 0 | 1;
}

export default class IEEENumber implements IEEENumberType {
  static basis = '01111111111';
  static binaryToDecimalism(binCode: string) {
    const [integer, decimal] = binCode.split('.');
    // handle integer
    let integerVal = 0;
    for (let i = 0; i < integer?.length; i++) {
      const currentBit = +integer.charAt(integer.length - 1 - i);
      integerVal += currentBit * Math.pow(2, i);
    }
    // handle decimal
    let decimalVal = 0;
    for (let i = 0; i < decimal?.length; i++) {
      const currentBit = +decimal.charAt(i);
      decimalVal += currentBit * Math.pow(2, -(i + 1));
    }
    return integerVal + decimalVal;
  }
  static _completeDivideAndGetLeft(dividend: number, divisor: number) {
    const res = Math.floor(dividend / divisor);
    const left = dividend - res * divisor;
    return [res, left];
  }
  static DecimalismToBinary(DecimalismCode: number, exact: number = 16) {
    const interger = Math.floor(DecimalismCode);
    const decimal = DecimalismCode % 1;
    console.log(interger, decimal);
    // handle interger
    const integerBinBuf = [];
    let _divideVal = interger;
    while (_divideVal > 0) {
      const [val, left] = IEEENumber._completeDivideAndGetLeft(_divideVal, 2);
      integerBinBuf.unshift(left);
      _divideVal = val;
    }

    // handle decimal
    const decimalBuf = [];
    let canUseExact = exact - integerBinBuf?.length;
    let multVal = decimal;
    while (canUseExact > 0 && multVal > 0) {
      multVal = multVal * 2;
      if (multVal >= 1) {
        multVal -= 1;
        decimalBuf.push(1);
      } else {
        decimalBuf.push(0);
      }
    }
    console.log(integerBinBuf, decimalBuf);
  }

  public binaryBuffer = [];
  public sign: 0 | 1 = 0;
  public exponent = [];
  public fraction = [];
  public hide: 0 | 1 = 1;

  constructor(floatNumber: number){
    
  }
}

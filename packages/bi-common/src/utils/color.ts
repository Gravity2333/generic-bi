export function CodeToRGB(code: string): [number, number, number] {
  let result = [] as any;
  result.push(parseInt(code.substring(1, 3), 16));
  result.push(parseInt(code.substring(3, 5), 16));
  result.push(parseInt(code.substring(5), 16));
  return result as [number, number, number];
}

export function rgb2hex(sRGB: string) {
  return sRGB.replace(
    /^rgb\((\d+)\s*,\s*(\d+)\s*,\s*(\d+)\)$/,
    function ($0, $1, $2, $3) {
      return (
        '#' +
        ('0' + (+$1).toString(16)).slice(-2) +
        ('0' + (+$2).toString(16)).slice(-2) +
        ('0' + (+$3).toString(16)).slice(-2)
      );
    },
  );
}

export function subRGB(
  value1: [number, number, number],
  value2: [number, number, number],
) {
  return [value1[0] - value2[0], value1[1] - value2[1], value1[2] - value2[2]];
}

export function getColorList(
  range: [string, string],
  len: number,
  Disorderly = false,
) {
  let colorList: string[] = [];
  if (range) {
    const distance = subRGB(CodeToRGB(range![1]), CodeToRGB(range![0]));
    colorList = (() => {
      const startColor = CodeToRGB(range![0]);
      // const endColor = CodeToRGB(range![1]);
      const list = [] as any;
      const elemDist = [
        distance[0] / len,
        distance[1] / len,
        distance[2] / len,
      ];
      for (
        let r = startColor[0], g = startColor[1], b = startColor[2], i = 1;
        i <= len;
        r += elemDist[0], g += elemDist[1], b += elemDist[2], i += 1
      ) {
        list.push(
          rgb2hex(
            `rgb(${Math.ceil(Math.abs(r))},${Math.ceil(
              Math.abs(g),
            )},${Math.ceil(Math.abs(b))})`,
          ),
        );
      }
      if (Disorderly) {
        list.sort(() => {
          return Math.random() - 0.5;
        });
        return list;
      } else {
        return list;
      }
    })();
  }
  return colorList;
}

export const getNextColor = (colorList: string[]) => {
  let colorIndex = 0;
  /** 高阶函数调用 */
  return () => {
    const colorLen = colorList?.length;
    const color = colorList ? colorList[colorIndex] : undefined;
    colorIndex = (colorIndex + 1) % colorLen!;
    return color;
  };
};


/** 运行同步的generator */
export function runSyncGenerator(syncGenerator: GeneratorFunction) {
  const syncIteratorFunc = syncGenerator();
  function handleNext(iteratorResult: IteratorResult<any>): Promise<any> {
    if (!iteratorResult.done) {
      if (iteratorResult.value instanceof Promise) {
        return Promise.resolve(iteratorResult.value).then(
          (promiseValue) => {
            return handleNext(syncIteratorFunc.next(promiseValue));
          },
          (reason) => {
            syncIteratorFunc.throw(reason);
          },
        ) as Promise<any>;
      } else {
        return Promise.resolve(handleNext(syncIteratorFunc.next(iteratorResult.value)));
      }
    } else {
      return Promise.resolve(iteratorResult);
    }
  }
  return handleNext(syncIteratorFunc.next()).then((res) => res.value);
}

// function* syncGenerator(): Generator<any> {
//   const a1 = yield queryAllWidgets();
//   const a2 = yield queryAllDashboards({});
//   return [a1, a2];
// }

// (async () => {
//   console.log(await runSyncGenerator(syncGenerator as GeneratorFunction));
// })();
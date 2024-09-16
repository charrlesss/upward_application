export default async function promiseAll(array:Array<Promise<any>>) {
    return await Promise.all(array);
  }
  

  
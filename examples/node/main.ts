// Node 预设回归样例：服务端全局（process.env）不应报 no-undef
const port = Number(process.env.PORT ?? 3000);

export function getPort(): number {
  return port;
}

console.log(`node preset ok: ${getPort()}`);

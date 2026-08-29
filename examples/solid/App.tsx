import { createSignal, type JSX } from 'solid-js';

interface AppProps {
  title: string;
}

// Solid 注意：props 不要解构！解构会丢失响应性（组件只执行一次）
export function App(props: AppProps): JSX.Element {
  const [count, setCount] = createSignal(0);

  return (
    <div class="demo">
      <h1>{props.title}</h1>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        count: {count()}
      </button>
    </div>
  );
}

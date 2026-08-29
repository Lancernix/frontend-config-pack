import { useState } from 'react';

interface AppProps {
  title: string;
}

export function App({ title }: AppProps) {
  const [count, setCount] = useState(0);

  return (
    <div className="demo">
      <h1>{title}</h1>
      <button type="button" onClick={() => setCount((c) => c + 1)}>
        count: {count}
      </button>
    </div>
  );
}

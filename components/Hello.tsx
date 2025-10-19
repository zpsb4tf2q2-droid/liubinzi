import { useState } from 'react';

export default function Hello({ name = 'World' }: { name?: string }) {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h2>Hello, {name}!</h2>
      <button onClick={() => setCount((c) => c + 1)}>Clicked {count} times</button>
    </div>
  );
}

import React from 'react';
import { Button } from "./components/ui/button"

function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hello, World!</h1>
      <p className="mb-4">Welcome to your Tauri + React application!</p>
      <Button onClick={() => alert('Button clicked!')}>Click Me</Button>
    </div>
  );
}

export default App;
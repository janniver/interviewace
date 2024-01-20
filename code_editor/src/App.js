import React, { useState } from 'react';
import './App.css';
import Button from './components/Button';

function App() {

  const [openedEditor, setOpenedEditor] = useState('html');
  const onTabClick = (editorName) => {
    setOpenedEditor(editorName);
  };
  
  return (
    <div className="App">
    </div>
  );
}
export default App;
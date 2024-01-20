import React, { useState,  useEffect } from 'react';
import './App.css';
import Button from './components/Button';
import Editor from 'monaco-editor/react';

function App() {
  const [srcDoc, setSrcDoc] = useState(` `);
  const [openedEditor, setOpenedEditor] = useState('html');
  const onTabClick = (editorName) => {
    setOpenedEditor(editorName);
  };
  const [java, setJava] = useState('');
  const [cpp, setCpp] = useState('');
  const [python, setPython] = useState('');
  useEffect(() => {
    const timeOut = setTimeout(() => {
      setSrcDoc(
        `
          <html>
            <body>${java}</body>
            <style>${cpp}</style>
            <script>${python}</script>
          </html>
        `
      )
    }, 250);
    return () => clearTimeout(timeOut)
  }, [java, cpp, python])
  return (
    <div className="App">
      <p>Welcome to Interview Practice...</p>
      <div className="tab-button-container">
        <Button title="Java" onClick={() => onTabClick('java')}></Button>
        <Button title="C++" onClick={() => onTabClick('cpp')}></Button>
        <Button title="Python" onClick={() => onTabClick('python')}></Button>
      </div>
      <div className="editor-container">
        {
          openedEditor === 'java' ? <Editor language="java" value = {java} setEditorState={setJava}/> 
          : openedEditor === 'cpp' ? <Editor language="cpp" value = {cpp} setEditorState={setCpp}/>
          : <Editor language="python" value = {python} setEditorState={setPython}/>
        }
      </div>
      <div>
        {/* <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts"
          width="100%"
          height="100%"
        /> */}
      </div>
    </div>
  );
}
export default App;
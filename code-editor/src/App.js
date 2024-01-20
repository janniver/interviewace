import React, { useState,  useEffect } from 'react';
import './App.css';
import Button from './components/Button';
import Editor from './components/Editor';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';

function App() {
  const [srcDoc, setSrcDoc] = useState(` `);
  const [openedEditor, setOpenedEditor] = useState('html');
  const onTabClick = (editorName) => {
    setOpenedEditor(editorName);
  };
  const [html, setHtml] = useState('');
  const [css, setCss] = useState('');
  const [js, setJs] = useState('');
  useEffect(() => {
    const timeOut = setTimeout(() => {
      setSrcDoc(
        `
          <html>
            <body>${html}</body>
            <style>${css}</style>
            <script>${js}</script>
          </html>
        `
      )
    }, 250);
    return () => clearTimeout(timeOut)
  }, [html, css, js])
  return (
    <div className="App">
      <p>Welcome to Interview Practice!</p>
      <div className="tab-button-container">
        <Button title="HTML" onClick={() => onTabClick('html')}></Button>
        <Button title="CSS" onClick={() => onTabClick('css')}></Button>
        <Button title="JavaScript" onClick={() => onTabClick('js')}></Button>
      </div>
      <div className="editor-container">
        {
          openedEditor === 'html' ? <Editor language="xml" value = {html} setEditorState={setHtml}/> 
          : openedEditor === 'css' ? <Editor language="css" value = {css} setEditorState={setCss}/>
          : <Editor language="javascript" value = {js} setEditorState={setJs}/>
        }
      </div>
      <div>
        <iframe
          srcDoc={srcDoc}
          title="output"
          sandbox="allow-scripts"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
}
export default App;
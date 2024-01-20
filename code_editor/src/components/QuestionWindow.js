import React from 'react';
import './QuestionWindow.css';
const QuestionWindow = ({ leetcodeQuestion }) => {
  const lines = leetcodeQuestion.split('\n').map((line, index, array) => (
    <React.Fragment key={index}>
      {line}
      {index < array.length - 1 && <span className="line-break"></span>} {/* Add span only between lines */}
    </React.Fragment>
  ));

  return (
    <div className="w-full h-64 rounded-md text-black font-normal text-lg overflow-y-auto p-4 text-justify"
      style={{
        fontFamily: "'Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'",
        border: leetcodeQuestion === "" ? "1px solid #ffffff" : '1px solid #000000', 
      }}>
      {lines}
    </div>
  );
};

export default QuestionWindow;

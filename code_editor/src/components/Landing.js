import React, { useEffect, useState, useCallback, useRef } from "react";
import CodeEditorWindow from "./CodeEditorWindow";
import axios from "axios";
import { classnames } from "../utils/general";
import { languageOptions } from "../constants/languageOptions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/defineTheme";
import useKeyPress from "../hooks/useKeyPress";
import OutputWindow from "./OutputWindow";
import QuestionWindow from "./QuestionWindow";
import ThemeDropdown from "./ThemeDropdown";
import LanguagesDropdown from "./LanguagesDropdown";
import CustomWebcam from "./CustomWebcam";
const javascriptDefault = `//Welcome to Code Editor!`;

const leetcodeQuestion = `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\ 
You may assume that each input would have exactly one solution, and you may not use the same element twice.
You can return the answer in any order.`;

const Landing = () => {

  const Ref = useRef(null);
  const [timer, setTimer] = useState("45:00");
  const getTimeRemaining = (e) => {
    const total =
      Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor(
      (total / 1000 / 60) % 60
    );
    const hours = Math.floor(
      (total / 1000 / 60 / 60) % 24
    );
    return {
      total,
      hours,
      minutes,
      seconds,
    };
  };
  const startTimer = (e) => {
    let { total, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      // Update the timer
      setTimer(
        (minutes > 9 ? minutes : "0" + minutes) +
        ":" +
        (seconds > 9 ? seconds : "0" + seconds)
      );
    }
  };


  const clearTimer = (e) => {
    // Set the timer to 45 minutes in the format MM:SS
    setTimer("45:00");

    if (Ref.current) clearInterval(Ref.current);
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };


  const getDeadTime = () => {
    let deadline = new Date();
    // Set deadline to 45 minutes from now
    deadline.setMinutes(deadline.getMinutes() + 45);
    return deadline;
  };


  // We can use useEffect so that when the component
  // mount the timer will start as soon as possible

  // We put empty array to act as componentDid
  // mount only
  useEffect(() => {
    clearTimer(getDeadTime());
  }, []);

  // Another way to call the clearTimer() to start
  // the countdown is via action event from the
  // button first we create function to be called
  // by the button

  const [code, setCode] = useState(javascriptDefault);
  const codeRef = useRef(code);
  useEffect(() => {
    codeRef.current = code;
  }, [code]);
  const [customInput, setCustomInput] = useState("");
  const [outputDetails, setOutputDetails] = useState(null);
  const [processing, setProcessing] = useState(null);
  const [running, setRunning] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [language, setLanguage] = useState(languageOptions[0]);
  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");

  const onSelectChange = (sl) => {
    console.log("selected Option...", sl);
    setLanguage(sl);
  };

  const showSuccessToast = useCallback((msg) => {
    toast.success(msg || `Compiled Successfully!`, {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []); // No dependencies, so an empty array

  const showErrorToast = useCallback((msg, timer) => {
    toast.error(msg || `Something went wrong! Please try again.`, {
      position: "top-right",
      autoClose: timer ? timer : 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  }, []); // No dependencies, so an empty array


  const checkStatus = useCallback(async (token) => {
    const options = {
      method: 'GET',
      url: `${process.env.REACT_APP_RAPID_API_URL}/${token}`,
      params: { base64_encoded: 'true', fields: '*' },
      headers: {
        'Access-Control-Allow-Origin': "*",
        'Access-Control-Allow-Headers': "*",
        'Access-Control-Allow-Methods': "*",
        'X-RapidAPI-Host': process.env.REACT_APP_RAPID_API_HOST,
        'X-RapidAPI-Key': process.env.REACT_APP_RAPID_API_KEY,
      },
    };

    try {
      let response = await axios.request(options);
      let statusId = response.data.status?.id;

      // Check if the response has a status indicating success
      if (statusId === 3) { // Replace '3' with the actual success status ID
        setProcessing(false);
        setOutputDetails(response.data);
        showSuccessToast(`Compiled Successfully!`);
      } else {
        // If status is not 'success', show an error toast
        setProcessing(false);
        setOutputDetails(response.data.error);
        showErrorToast(response.data.error || `Compilation failed!`);
      }
    } catch (err) {
      setProcessing(false);
      showErrorToast(`Something went wrong! Please try again.`);
    }
  }, [setProcessing, setOutputDetails, showSuccessToast, showErrorToast]);


  const handleCompile = useCallback(() => {
    console.log("handleCompile called...");
    setProcessing(true);
    const formData = {
      language_id: language.id,
      source_code: btoa(code),
      stdin: btoa(customInput),
    };
    const options = {
      method: "POST",
      url: process.env.REACT_APP_RAPID_API_URL,
      params: { base64_encoded: "true", fields: "*" },
      headers: {
        "content-type": "application/json",
        "Content-Type": "application/json",
        "X-RapidAPI-Host": process.env.REACT_APP_RAPID_API_HOST,
        "X-RapidAPI-Key": process.env.REACT_APP_RAPID_API_KEY,
        'Access-Control-Allow-Origin': "*",
        'Access-Control-Allow-Headers': "*",
        'Access-Control-Allow-Methods': "*"
      },
      data: formData,
    };

    axios.request(options)
      .then(function (response) {
        const token = response.data.token;
        checkStatus(token); // Ensure checkStatus is stable or included in dependencies
      })
      .catch((err) => {
        let error = err.response ? err.response.data : err;
        let status = err.response ? err.response.status : null;
        console.log("Error status", status);
        if (status === 429) {
          showErrorToast(`Quota of 100 requests exceeded for the Day!`, 10000);
        }
        setProcessing(false);
        console.log("Error in handleCompile: ", error);
      });
  }, [code, customInput, language, setProcessing, checkStatus, showErrorToast]);

  const [response, setResponse] = useState('');

  const sendPostRequest = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': "*",
          'Access-Control-Allow-Headers': "*",
          'Access-Control-Allow-Methods': "*"
        },
        body: JSON.stringify({ question: leetcodeQuestion }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(JSON.stringify(data));
      console.log("done w post");
      sendListenRequest();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendListenRequest = async () => {
    console.log("in listen...")
    try {
      const res = await fetch('http://127.0.0.1:5000/listen', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': "*",
          'Access-Control-Allow-Headers': "*",
          'Access-Control-Allow-Methods': "*"
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const jsonString = JSON.parse(JSON.stringify(data));
      setResponse(jsonString.input);
      console.log("response", jsonString.input, jsonString)
      console.log("done with listen")
      sendRespondRequest(jsonString.input);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendRespondRequest = async (description) => {
    console.log("entered send respond")
    console.log("code: " + code)
    try {
      const currentCode = codeRef.current;
      console.log("currentCode: " + currentCode)
      const res = await fetch('http://127.0.0.1:5000/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': "*",
          'Access-Control-Allow-Headers': "*",
          'Access-Control-Allow-Methods': "*"
        },
        body: JSON.stringify({ code: currentCode, description: description }),
      });
      console.log("in send respond" + currentCode, description)

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      setResponse(JSON.stringify(data));
      console.log("done with respond " + running)
      sendListenRequest();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendEndRequest = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/end', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': "*",
          'Access-Control-Allow-Headers': "*",
          'Access-Control-Allow-Methods': "*"
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const jsonString = JSON.parse(JSON.stringify(data));
      if (!running) setResponse(jsonString.input);
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const handleStart = async () => {
    setRunning(true);
    startTimer();
    sendPostRequest();
  };

  const handleEnd = async () => {
    setRunning(false);
    clearTimer(getDeadTime());
    console.log(code);
    sendEndRequest();
  };

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
      handleCompile();
    }
  }, [ctrlPress, enterPress, handleCompile]);
  const onChange = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };

  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="h-4 w-full"></div>
      <div className="flex flex-row space-x-4 items-start px-4 py-4">
        <div className="left-container flex w-1/3 flex-col h-screen">
          <div className="h-1/2 mr-5 pt-3">
            {/* Timer Styling */}
            <div className="timer flex justify-center items-center mb-4">
              {running && <div className="text-lg font-semibold text-white bg-[#1e293b] border border-gray-300 px-4 py-2 rounded shadow">
                {timer}
              </div>}
            </div>
            <div className="w-full h-full"><QuestionWindow leetcodeQuestion={running ? leetcodeQuestion : ""} /></div>
          </div>
          <div className="h-1/2 mr-5 mb-2">
            <CustomWebcam />
          </div>
        </div>
        <div className="right-container flex flex-col w-2/3 h-screen">
          <div className="flex flex-row w-full justify-end items-end px-4 py-2 mb-4 space-x-4">
            <button
              onClick={running ? handleEnd : handleStart}
              className={
                `text-white border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-8 py-2.5 hover:shadow transition duration-200 flex-shrink-0 mr-auto ${!code ? "opacity-50" :
                  running ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                }`
              }
            >
              {running ? "Stop" : "Start"}
            </button>
            <LanguagesDropdown onSelectChange={onSelectChange} />
            <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
            <button
              onClick={handleCompile}
              disabled={!code}
              className={classnames(
                "border-2 border-black z-10 rounded-md shadow-[5px_5px_0px_0px_rgba(0,0,0)] px-4 py-2.5 hover:shadow transition duration-200 bg-white flex-shrink-0",
                !code ? "opacity-50" : ""
              )}
            >
              {processing ? "Processing..." : "Compile and Execute"}
            </button>
          </div>
          <div className="h-3/5 mr-5 mb-2">
            <CodeEditorWindow
              code={code}
              onChange={onChange}
              language={language?.value}
              theme={theme.value}
            />
          </div>
          <div className="flex flex-row w-full justify-start items-start px-4">
            <h1 className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 mb-2">
              Output
            </h1>
          </div>
          <div className="h-2/5 mr-5 mb-2">
            <div className="w-full"><OutputWindow outputDetails={outputDetails} /></div>
            {/* <div className="w-1/3">{outputDetails && <OutputDetails outputDetails={outputDetails} />}</div> */}
          </div>
        </div>
      </div>
    </>
  );
};
export default Landing;

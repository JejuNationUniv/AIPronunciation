import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactMic } from "react-mic";
import axios from "axios";
import "./App.css";

function App() {
  const navigate = useNavigate();

  const [record, setRecord] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [readableResult, setReadableResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [originalText, setOriginalText] = useState("");

  useEffect(() => {
    const fetchOriginalText = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:8000/api/speech-to-text/original/");
        if (response.data && response.data.text) {
          setOriginalText(response.data.text);
        }
      } catch (error) {
        console.error("원본 텍스트 가져오기 실패:", error);
      }
    };
    fetchOriginalText();
  }, []);

  const startRecording = () => {
    setRecord(true);
    setTranscript("");
    setReadableResult("");
  };

  const stopRecording = () => {
    setRecord(false);
  };

  const onStop = async (recordedBlob) => {
    const formData = new FormData();
    formData.append("audio_file", recordedBlob.blob, "recording.webm");

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/speech-to-text/",
        formData
      );
      
      if (response.data) {
        setTranscript(response.data.text || "");
        setReadableResult(response.data.readable_result || "");
      }
    } catch (error) {
      console.error("음성 인식 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-[#E7ECF2] font-Pretendard">
      <div className="relative flex w-[500px] justify-center bg-white lg:m-5 lg:w-screen lg:rounded-2xl">
        <div className="flex flex-col items-center px-5">
          <div className="text-25 mt-10 font-bold lg:mt-24 lg:text-4xl">
            APALogo
          </div>

          <div className="mt-25 text-25 mt-10 font-light lg:text-2xl">1/10</div>

          {/* 문장 제시 영역 */}
          <div className="w-408 lg:w-888 mt-6 flex items-center justify-center rounded-2xl bg-[#F2F2F2] p-5 shadow-lg">
            <p className="text-20 break-words text-center font-medium text-black">
              {originalText}
            </p>
          </div>

          <ReactMic
            record={record}
            className="sound-wave lg:w-888 mt-12 grid w-96 grid-cols-1 justify-center gap-4 rounded-2xl shadow-lg"
            onStop={onStop}
            mimeType="audio/webm"
            sampleRate={16000}
            channels={1}
            strokeColor="#000000"
            backgroundColor="#e7ecf2"
          />

          {/* 결과 표시 영역 - 데이터가 있을 때만 표시 */}
          <div className="w-408 lg:w-888 mt-12 grid grid-cols-1 justify-center gap-4 rounded-2xl bg-[#F2F2F2] shadow-lg">
            <div className="text-20 flex items-center justify-center text-center font-medium text-black">
              {isLoading ? (
                <p className="mx-5 mt-5">텍스트 변환 중...</p>
              ) : (
                transcript && <p className="mx-5 mt-5">{transcript}</p>
              )}
            </div>

            {(transcript || readableResult) && (
              <>
                <hr className="mx-3 border-t-2 border-gray-300" />
                <div className="text-20 flex items-center justify-center text-center font-medium text-black">
                  {readableResult && <p className="mx-5 mb-5">{readableResult}</p>}
                </div>
              </>
            )}
          </div>

          <div className="absolute bottom-[87px] mx-14 flex space-x-24">
            <button
              onClick={startRecording}
              disabled={record}
              className={`px-4 py-2 rounded ${
                record ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
              } text-white`}
            >
              녹음 시작
            </button>
            <button
              onClick={stopRecording}
              disabled={!record}
              className={`px-4 py-2 rounded ${
                !record ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
              } text-white`}
            >
              녹음 중지
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
            >
              새로고침
            </button>
          </div>

          <div className="absolute bottom-5 right-5">
            <button 
              className="text-blue-500 hover:text-blue-700 underline"
              onClick={() => navigate("/")}
            >
              나가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
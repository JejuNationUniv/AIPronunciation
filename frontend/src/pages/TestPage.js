import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactMic } from "react-mic";
import axios from "axios";
import "../css/TestPage.css";

function TestPage() {
  const navigate = useNavigate();

  const [record, setRecord] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [readableResult, setReadableResult] = useState(""); // readable_result 사용
  const [isLoading, setIsLoading] = useState(false);
  const [originalText, setOriginalText] = useState("");

  // 원본 텍스트 가져오기
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
      
      console.log("서버 응답:", response.data);
      
      if (response.data) {
        setTranscript(response.data.text || "");
        setReadableResult(response.data.readable_result || ""); // readable_result 사용
      }
    } catch (error) {
      console.error("오류 발생:", error);
      if (error.response?.data?.error) {
        alert(`오류: ${error.response.data.error}`);
      } else {
        alert("오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen justify-center bg-[#E7ECF2] font-Pretendard">
      <div className="relative flex w-[500px] justify-center bg-white lg:m-5 lg:w-screen lg:rounded-2xl">
        <div className="flex flex-col items-center px-5">
          {/* 로고 */}
          <div className="text-25 mt-10 font-bold lg:mt-24 lg:text-4xl">
            APALogo
          </div>

          {/* 메인 영역 */}
          <div className="mt-25 text-25 mt-10 font-light lg:text-2xl">1/10</div>

          {/* 문장 제시 영역 */}
          <div className="w-408 lg:w-888 mt-6 flex items-center justify-center rounded-2xl bg-[#F2F2F2] p-5 shadow-lg">
            <p className="text-20 break-words text-center font-medium text-black">
              {originalText || "문장이 제시됩니다."}
            </p>
          </div>

          {/* ReactMic */}
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

          {/* 발음 표시 영역 */}
          <div className="w-408 lg:w-888 mt-12 grid grid-cols-1 justify-center gap-4 rounded-2xl bg-[#F2F2F2] shadow-lg">
            <div className="text-20 flex items-center justify-center text-center font-medium text-black">
              <p className="mx-5 mt-5">
                {isLoading ? (
                  "텍스트 변환 중..."
                ) : transcript ? (
                  transcript
                ) : (
                  "녹음 시작 버튼을 눌러 발음 테스트를 진행하세요."
                )}
              </p>
            </div>

            <hr className="mx-3 border-t-2 border-gray-300" />

            <div className="text-20 flex items-center justify-center text-center font-medium text-black">
              <p className="mx-5 mb-5">
                {isLoading ? (
                  "교정 결과 분석 중..."
                ) : readableResult ? (
                  readableResult
                ) : (
                  "여기에 수정된 발음이 표시됩니다."
                )}
              </p>
            </div>
          </div>

          {/* 하단 버튼 영역 */}
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
              disabled={isLoading}
              className="px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white"
            >
              새로고침
            </button>
          </div>

          {/* 나가기 버튼 */}
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

export default TestPage;
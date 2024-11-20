// src/App.js

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ReactMic } from "react-mic"; // ReactMic 임포트
import axios from "axios";
//import "./App.css";

function App() {
  const navigate = useNavigate();

  const [record, setRecord] = useState(false); // 녹음 상태 관리
  const [transcript, setTranscript] = useState(""); // 변환된 텍스트 저장
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 관리
  const [blobURL, setBlobURL] = useState(null); // 녹음된 Blob URL 저장

  // 녹음 시작 함수
  const startRecording = () => {
    setRecord(true);
  };

  // 녹음 중지 함수
  const stopRecording = () => {
    setRecord(false);
  };

  // 녹음이 중지되었을 때 호출되는 함수
  const onStop = async (recordedBlob) => {
    console.log("Recorded Blob:", recordedBlob);
    setBlobURL(recordedBlob.blobURL); // Blob URL 저장

    // WebM 파일로 FormData 설정
    const formData = new FormData();
    formData.append("audio_file", recordedBlob.blob, "recording.webm"); // 파일 확장자 변경

    try {
      setIsLoading(true);
      const response = await axios.post(
        "http://127.0.0.1:8000/api/speech-to-text/",
        formData,
        {
          // 'Content-Type': 'multipart/form-data', // 제거하세요
        },
      );
      setTranscript(response.data.text);
    } catch (error) {
      console.error("오류 발생:", error);
      if (error.response && error.response.data && error.response.data.error) {
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
              "문장이 제시됩니다."
            </p>
          </div>

          {/* ReactMic 컴포넌트 사용 */}
          <ReactMic
            record={record}
            className="sound-wave lg:w-888 mt-12 grid w-96 grid-cols-1 justify-center gap-4 rounded-2xl shadow-lg"
            onStop={onStop}
            mimeType="audio/webm" // WebM 포맷 설정
            sampleRate={16000} // 샘플링 레이트 설정
            channels={1} // 모노 설정
            strokeColor="#000000"
            backgroundColor="#e7ecf2"
          />

          {/* 발음 표시 영역 */}
          <div className="w-408 lg:w-888 mt-12 grid grid-cols-1 justify-center gap-4 rounded-2xl bg-[#F2F2F2] shadow-lg">
            <div className="text-20 flex items-center justify-center text-center font-medium text-black">
              {isLoading ? (
                <p className="mx-5 mt-5">텍스트 변환 중...</p>
              ) : transcript ? (
                <p className="mx-5 mt-5">{transcript}</p>
              ) : (
                <p className="mx-5 mt-5">
                  녹음 시작 버튼을 눌러 발음 테스트를 진행하세요 .
                </p>
              )}
            </div>

            {/* 피드백 표시 영역 */}
            <hr className="mx-3 border-t-2 border-gray-300" />
            <div className="text-20 flex items-center justify-center text-center font-medium text-black">
              <p className="mx-5 mb-5">여기에 수정된 발음이 표시됩니다.</p>
            </div>
          </div>

          {/* 하단 영역 (버튼) */}
          <div className="absolute bottom-[87px] mx-14 flex space-x-24">
            <button onClick={startRecording} disabled={record}>
              녹음 시작
            </button>
            <button onClick={stopRecording} disabled={!record}>
              녹음 중지
            </button>
            <button
              onClick={() => window.location.reload()}
              disabled={isLoading}
            >
              새로고침
            </button>
          </div>
        </div>

        {/* 나가기 버튼 */}
        <div className="absolute bottom-5 right-5">
          <button className="underline" onClick={() => navigate("/")}>
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ReactMic } from "react-mic";
import axios from "axios";
import "../css/TestPage.css";
import playButton from "../imgs/playbutton.svg";

function TestPage() {
  const navigate = useNavigate();

  const [record, setRecord] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [readableResult, setReadableResult] = useState(""); // readable_result 사용
  const [isLoading, setIsLoading] = useState(false);
  const [originalText, setOriginalText] = useState("");
  const [audioUrl, setAudioUrl] = useState(null); // 오디오 파일 URL 상태 추가
  const [currentTextId, setCurrentTextId] = useState(1);
  const [isLastText, setIsLastText] = useState(false);
  const totalTexts = 3;

  // 원본 텍스트 가져오기
  useEffect(() => {
    fetchOriginalText(currentTextId);
  }, [currentTextId]);

  const fetchOriginalText = async (id) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/speech-to-text/original/?id=${id}`,
      );
      if (response.data && response.data.text) {
        setOriginalText(response.data.text);
      } else {
        setIsLastText(true);
      }
      if (id === totalTexts) {
        setIsLastText(true);
      } else {
        setIsLastText(false);
      }
    } catch (error) {
      console.error("원본 텍스트 가져오기 실패:", error);
      setIsLastText(true);
    }
  };

  const startRecording = () => {
    setRecord(true);
    setTranscript("");
    setReadableResult("");

    if (typeof AudioContext !== "undefined") {
      const audioContext = new AudioContext();
      audioContext.resume().then(() => {
        console.log("AudioContext가 활성화되었습니다.");
      });
    }
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
        formData,
      );

      console.log("서버 응답:", response.data);

      if (response.data) {
        setTranscript(response.data.text || "");
        setReadableResult(response.data.readable_result || ""); // readable_result 사용
        setAudioUrl("http://127.0.0.1:8000" + response.data.audio_url); // 서버에서 반환된 오디오 파일 URL 저장
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

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("오디오 재생 오류:", error);
        alert(
          "오디오를 재생할 수 없습니다. 파일 형식이나 접근 권한을 확인하세요.",
        );
      });
    } else {
      alert("재생할 오디오가 없습니다.");
    }
  };

  // 다음 문장 또는 결과 확인 버튼 핸들러
  const handleNextOrResult = () => {
    if (isLastText) {
      navigate("/LastPage");
    } else {
      setTranscript("");
      setReadableResult("");
      setAudioUrl(null);
      setCurrentTextId((prevId) => prevId + 1);
    }
  };
  return (
    <div className="flex min-h-screen justify-center bg-[#E7ECF2]">
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-lg overflow-hidden bg-white p-4 shadow-lg lg:mx-5 lg:my-5 lg:max-w-none lg:overflow-visible lg:rounded-lg">
        {/* Top Icons */}
        <div className="mb-4 flex justify-center">
          <div className="flex space-x-2">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="#5B67A2">
              <path d="M10.8431 7.2C12.2072 4.83722 12.8893 3.65583 13.7798 3.25936C14.5565 2.91355 15.4435 2.91355 16.2202 3.25936C17.1107 3.65583 17.7928 4.83722 19.1569 7.2L23.8335 15.3C25.1976 17.6628 25.8797 18.8442 25.7778 19.8136C25.6889 20.6592 25.2454 21.4273 24.5576 21.9271C23.769 22.5 22.4048 22.5 19.6765 22.5H10.3235C7.59516 22.5 6.23101 22.5 5.44242 21.9271C4.75457 21.4273 4.31108 20.6592 4.22221 19.8136C4.12032 18.8442 4.80239 17.6628 6.16654 15.3L10.8431 7.2Z" />
            </svg>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="#545051">
              <path d="M10.8431 7.2C12.2072 4.83722 12.8893 3.65583 13.7798 3.25936C14.5565 2.91355 15.4435 2.91355 16.2202 3.25936C17.1107 3.65583 17.7928 4.83722 19.1569 7.2L23.8335 15.3C25.1976 17.6628 25.8797 18.8442 25.7778 19.8136C25.6889 20.6592 25.2454 21.4273 24.5576 21.9271C23.769 22.5 22.4048 22.5 19.6765 22.5H10.3235C7.59516 22.5 6.23101 22.5 5.44242 21.9271C4.75457 21.4273 4.31108 20.6592 4.22221 19.8136C4.12032 18.8442 4.80239 17.6628 6.16654 15.3L10.8431 7.2Z" />
            </svg>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="#7B86AA">
              <path d="M10.8431 7.2C12.2072 4.83722 12.8893 3.65583 13.7798 3.25936C14.5565 2.91355 15.4435 2.91355 16.2202 3.25936C17.1107 3.65583 17.7928 4.83722 19.1569 7.2L23.8335 15.3C25.1976 17.6628 25.8797 18.8442 25.7778 19.8136C25.6889 20.6592 25.2454 21.4273 24.5576 21.9271C23.769 22.5 22.4048 22.5 19.6765 22.5H10.3235C7.59516 22.5 6.23101 22.5 5.44242 21.9271C4.75457 21.4273 4.31108 20.6592 4.22221 19.8136C4.12032 18.8442 4.80239 17.6628 6.16654 15.3L10.8431 7.2Z" />
            </svg>
          </div>
        </div>

        {/* 메인 영역 */}
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-25 mt-10 font-light lg:text-2xl">
            {currentTextId}/{totalTexts}
          </div>

          {/* 문장 제시 영역 */}
          <div className="mt-10 flex w-96 items-center justify-center rounded-lg bg-[#F2F2F2] p-5 shadow-lg lg:w-5/12">
            <p className="text-20 break-words text-center font-medium text-black lg:text-[20px]">
              {originalText || "문장이 제시됩니다."}
            </p>
          </div>

          {/* ReactMic */}
          <ReactMic
            record={record}
            className="sound-wave mt-10 grid w-96 grid-cols-1 justify-center rounded-lg shadow-lg lg:h-14 lg:w-5/12"
            onStop={onStop}
            mimeType="audio/webm"
            sampleRate={16000}
            channels={1}
            strokeColor="#000000"
            backgroundColor="#e7ecf2"
          />

          {/* 발음 표시 영역 */}
          <div className="mt-12 grid w-96 grid-cols-1 justify-center gap-4 rounded-2xl bg-[#F2F2F2] shadow-lg lg:w-5/12">
            <div className="text-20 flex items-center justify-center text-center font-medium text-black lg:text-[20px]">
              <p className="mx-5 mt-5">
                {isLoading
                  ? "텍스트 변환 중..."
                  : transcript
                    ? transcript
                    : "녹음 시작 버튼을 눌러 발음 테스트를 시작하세요."}
              </p>
            </div>

            <hr className="mx-3 border-t-2 border-gray-300" />

            <div className="text-20 flex items-center justify-center text-center font-medium text-black lg:text-[20px]">
              {isLoading ? (
                <p className="mx-5 mb-5">교정 결과 분석 중...</p>
              ) : readableResult ? (
                // HTML 렌더링
                <p
                  className="mx-5 mb-5"
                  dangerouslySetInnerHTML={{ __html: readableResult }}
                />
              ) : (
                <p className="mx-5 mb-5">여기에 수정된 발음이 표시됩니다.</p>
              )}
            </div>
          </div>

          {/* 다시 듣기 버튼 */}
          <button
            onClick={playAudio}
            disabled={!audioUrl}
            className={`mt-3 flex text-[20px] text-blue-500 underline hover:text-blue-700 ${!audioUrl ? "cursor-not-allowed" : ""} ${!audioUrl ? "opacity-10" : ""}`}
          >
            <img
              src={playButton}
              alt="발음 듣기 버튼"
              width="25"
              height="25"
              style={{ marginRight: "8px" }}
            />{" "}
            내 발음 다시 듣기
          </button>

          {/* 하단 영역 (버튼) */}
          <div className="absolute bottom-[80px] grid grid-cols-2 gap-4 lg:grid-cols-4">
            <button
              onClick={startRecording}
              disabled={record}
              className={`rounded px-4 py-2 lg:text-[20px] ${
                record ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              녹음 시작
            </button>
            <button
              onClick={stopRecording}
              disabled={!record}
              className={`rounded px-4 py-2 lg:text-[20px] ${
                !record ? "bg-gray-400" : "bg-red-500 hover:bg-red-600"
              } text-white`}
            >
              녹음 중지
            </button>
            <button
              onClick={() => window.location.reload()}
              disabled={isLoading}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 lg:text-[20px]"
            >
              새로고침
            </button>
            <button
              onClick={handleNextOrResult}
              className="rounded bg-pink-500 px-4 py-2 text-white hover:bg-pink-600 lg:text-[20px]"
            >
              {isLastText ? "결과 확인" : "다음 문장"}
            </button>
          </div>

          {/* 나가기 버튼 */}
          <div className="absolute bottom-5 right-5">
            <button
              className="text-blue-500 underline hover:text-blue-700 lg:text-[20px]"
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

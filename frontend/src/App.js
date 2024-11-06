// src/App.js

import React, { useState } from 'react';
import { ReactMic } from 'react-mic'; // ReactMic 임포트
import axios from 'axios';
import './App.css';

function App() {
  const [record, setRecord] = useState(false); // 녹음 상태 관리
  const [transcript, setTranscript] = useState(''); // 변환된 텍스트 저장
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
    console.log('Recorded Blob:', recordedBlob);
    setBlobURL(recordedBlob.blobURL); // Blob URL 저장

    // WebM 파일로 FormData 설정
    const formData = new FormData();
    formData.append('audio_file', recordedBlob.blob, 'recording.webm'); // 파일 확장자 변경

    try {
      setIsLoading(true);
      const response = await axios.post(
        'http://127.0.0.1:8000/api/speech-to-text/',
        formData,
        {
          // 'Content-Type': 'multipart/form-data', // 제거하세요
        }
      );
      setTranscript(response.data.text);
    } catch (error) {
      console.error('오류 발생:', error);
      if (error.response && error.response.data && error.response.data.error) {
        alert(`오류: ${error.response.data.error}`);
      } else {
        alert('오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>실시간 음성 인식</h1>
      {/* ReactMic 컴포넌트 사용 */}
      <ReactMic
        record={record}
        className="sound-wave"
        onStop={onStop}
        mimeType="audio/webm" // WebM 포맷 설정
        sampleRate={16000} // 샘플링 레이트 설정
        channels={1} // 모노 설정
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />
      <div>
        <button onClick={startRecording} disabled={record}>
          녹음 시작
        </button>
        <button onClick={stopRecording} disabled={!record}>
          녹음 중지
        </button>
      </div>
      {blobURL && (
        <div>
          <h2>녹음된 파일 다운로드</h2>
          <a href={blobURL} download="recording.webm">
            다운로드
          </a>
        </div>
      )}
      <div>
        <button onClick={() => window.location.reload()} disabled={isLoading}>
          새로고침
        </button>
      </div>
      {isLoading && <p>텍스트 변환 중...</p>}
      {transcript && (
        <div>
          <h2>변환된 텍스트:</h2>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
}

export default App;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const Title = ({ children, className }) => (
    <div className={`font-Pretendard text-[40px] font-[700] ${className}`}>
      {children}
    </div>
  );

  const handleReset = async () => {
    try {
      setIsLoading(true);
      // 2초 후 TestPage로 이동
      setTimeout(() => {
        navigate("/TestPage");
      }, 2000);
    } catch (error) {
      console.error("초기화 실패:", error);
      setIsLoading(false);
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
        <div className="mt-64 flex flex-col items-center justify-center py-10">
          <Title className="text-center lg:hidden">AI 발음 교정 서비스</Title>
          <div className="hidden text-center lg:block lg:font-Pretendard lg:text-[50px] lg:font-[700]">
            AI 발음 교정 서비스
          </div>
          <div className="mt-2 font-Pretendard text-[20px] font-[500]">
            📢 AI Pronunciation Assistant
          </div>

          {/* 하단 영역 (버튼) */}
          <div className="absolute bottom-[80px] mx-14">
            <button
              className={`h-[56px] w-[392px] rounded-lg bg-slate-800 font-Pretendard text-[20px] font-[700] text-white hover:bg-blue-600 ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
              onClick={handleReset}
            >
              발음 테스트 시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;

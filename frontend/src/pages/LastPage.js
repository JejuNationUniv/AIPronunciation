import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import GaugeChart from "react-gauge-chart";

const LastPage = () => {
  const navigate = useNavigate();
  const [accuracy, setAccuracy] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchAccuracy = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:8000/api/pronunciation/accuracy/",
        );
        setAccuracy(100 - response.data.accuracy);
      } catch (error) {
        console.error("정확도 가져오기 실패:", error);
      }
    };
    fetchAccuracy();
  }, []);

  const Title = ({ children, className }) => (
    <div className={`font-Pretendard text-[40px] font-[700] ${className}`}>
      {children}
    </div>
  );

  const handleReset = async () => {
    try {
      setIsLoading(true);
      await axios.delete("http://127.0.0.1:8000/api/pronunciation/accuracy/");

      // 2초 후 MainPage로 이동
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("초기화 실패:", error);
      setIsLoading(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
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
        <div className="mt-40 flex flex-col items-center justify-center py-10">
          {/* 게이지 차트 */}
          <div className="mb-4 flex justify-center">
            <GaugeChart
              id="accuracy-gauge"
              nrOfLevels={20}
              percent={accuracy / 100}
              textColor="#000000"
              width={300} // 또는 style={{ width: "300px", height: "150px" }}
            />
          </div>

          {/* 발음 정확도 */}
          <Title className="text-center lg:hidden">당신의 발음은</Title>
          <Title className="text-center lg:hidden">
            상위 {(100 - accuracy).toFixed(2)}% 입니다!
          </Title>
          <div className="hidden text-center lg:block lg:font-Pretendard lg:text-[50px] lg:font-[700]">
            당신의 발음은 상위 {(100 - accuracy).toFixed(2)}% 입니다!
          </div>
          <div className="mt-5 font-Pretendard text-[20px] font-[500]">
            WOW! 열심히 연습하면 더 좋아질 거에요! 👍
          </div>

          {/* 하단 영역 (버튼) */}
          <div className="absolute bottom-[80px] mx-14 flex space-x-4">
            <button
              className={`h-[56px] w-[192px] rounded-lg bg-slate-800 font-Pretendard text-[20px] font-[700] text-white hover:bg-blue-600 ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
              onClick={handleReset}
              disabled={isLoading}
            >
              {isLoading ? "이동중..." : "다시 도전하기!"}
            </button>
            <button
              className="h-[56px] w-[192px] rounded-lg bg-gray-500 font-Pretendard text-[20px] font-[700] text-white hover:bg-gray-600"
              onClick={openModal}
            >
              더 연습하러 가기
            </button>
          </div>
        </div>
      </div>

      {/* 모달 창 */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-11/12 max-w-md rounded-lg bg-white p-10">
            <h2 className="mb-4 text-center font-Pretendard text-[30px] font-[700]">
              곧 추가될 기능입니다! 👽
            </h2>
            <p className="mb-6 text-center font-Pretendard text-[16px] font-[400]">
              더 많은 연습 기능이 곧 제공될 예정입니다.
              <br /> 많은 기대 부탁드려요!
            </p>
            <div className="flex justify-center">
              <button
                className="rounded-lg bg-blue-500 px-6 py-1 font-Pretendard text-[15px] font-[700] text-white hover:bg-blue-600"
                onClick={closeModal}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LastPage;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

      // 2초 후 TestPage로 이동
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
      {/* Main Container */}
      <div className="relative w-full max-w-lg overflow-hidden bg-white p-4 shadow-lg lg:mx-5 lg:my-5 lg:max-w-none lg:overflow-visible lg:rounded-lg">
        {/* 메인 영역 */}
        <div className="mt-60 flex flex-col items-center justify-center py-10">
          <Title className="text-center lg:hidden">당신의 발음은</Title>
          <Title className="text-center lg:hidden">
            상위 {(100 - accuracy).toFixed(2)}% 입니다!
          </Title>
          <div className="hidden text-center lg:block lg:font-Pretendard lg:text-[40px] lg:font-[700]">
            당신의 발음은 상위 {(100 - accuracy).toFixed(2)}% 입니다!
          </div>
          <div className="mt-5 font-Pretendard text-[18px] font-[500]">
            열심히 연습하면 더 좋아질 거에요!
          </div>

          {/* 하단 영역 (버튼) */}
          <div className="absolute bottom-[80px] mx-14 flex space-x-4">
            <button
              className={`h-[56px] w-[192px] rounded-2xl bg-slate-800 font-Pretendard text-[20px] font-[700] text-white ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
              onClick={handleReset}
              disabled={isLoading}
            >
              {isLoading ? "이동중..." : "다시 도전하기!"}
            </button>
            <button
              className="h-[56px] w-[192px] rounded-2xl bg-gray-500 font-Pretendard text-[20px] font-[700] text-white hover:bg-gray-600"
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
          <div className="w-11/12 max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-center font-Pretendard text-[24px] font-[700]">
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

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LastPage = () => {
  const navigate = useNavigate();
  const [accuracy, setAccuracy] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

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
          <div className="absolute bottom-[80px] mx-14">
            <button
              className={`h-[56px] w-[392px] rounded-2xl bg-slate-800 font-Pretendard text-[20px] font-[700] text-white ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
              onClick={handleReset}
              disabled={isLoading}
            >
              {isLoading ? "이동중..." : "다시 도전하기!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastPage;

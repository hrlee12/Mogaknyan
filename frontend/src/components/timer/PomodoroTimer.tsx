import React, { useState } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';

interface TimerProps {
  focusTime: number;
  breakTime: number;
  repeatCount: number;
}

const PomodoroTimer: React.FC<TimerProps> = ({
  focusTime,
  breakTime,
  repeatCount,
}) => {
  // 집중 시간과 휴식 시간을 번갈아가며 사용하기 위한 상태
  const [isFocusing, setIsFocusing] = useState(true);
  const [currentRepeat, setCurrentRepeat] = useState(1);
  const [key, setKey] = useState(0); // 타이머를 재시작하기 위한 키

  // 타이머가 완료될 때 호출될 함수
  const handleComplete = () => {
    console.log(currentRepeat);
    // 모든 반복이 완료되었는지 확인
    if (currentRepeat === repeatCount * 2 - 1) {
      // 모든 작업이 완료되면 추가 작업을 수행할 수 있습니다.
      console.log('뽀모도로 타이머 완료!');
      return { shouldRepeat: false };
    }

    // 집중 시간과 휴식 시간을 전환
    setIsFocusing(!isFocusing);

    // 현재 반복 횟수 증가
    setCurrentRepeat(currentRepeat + 1);

    // 타이머를 재시작하기 위한 키 업데이트
    setKey((prevKey) => prevKey + 1);

    return { shouldRepeat: false };
  };

  // 현재 타이머의 시간을 결정
  const timerDuration: number = isFocusing ? focusTime * 60 : breakTime * 60;

  // 시간 형식 기능
  function formatTime(time: number) {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return (
    <CountdownCircleTimer
      key={key} // key 변경으로 컴포넌트 리셋
      isPlaying
      duration={timerDuration}
      colors={['#004777', '#F7B801']}
      colorsTime={[timerDuration * 0.5, timerDuration * 0.2]}
      onComplete={handleComplete}
    >
      {({ remainingTime }) => (
        <div>
          {remainingTime === 0 ? (
            <div>끝</div>
          ) : (
            <>
              <div>남은 시간: {formatTime(remainingTime)}</div>
              <div>{isFocusing ? '집중' : '휴식'} 시간</div>
            </>
          )}
        </div>
      )}
    </CountdownCircleTimer>
  );
};

export default PomodoroTimer;

import { useEffect, useState } from 'react';

const useCountdown = (targetDate: Date) => {
  const countDownDate = targetDate.getTime();

  const [countDown, setCountDown] = useState(
    Math.max(countDownDate - (new Date()).getTime(), 0)
  );


  useEffect(() => {
    if (Math.floor((countDown % (1000 * 60)) / 1000) > 0) {
      const timeout = setTimeout(() => {
        setCountDown(Math.max(countDownDate - (new Date()).getTime(), 0));
      }, 1000);
  
      return () => clearTimeout(timeout);
    }
  }, [countDownDate, countDown]);

  return getCountdownParts(countDown);
};

const getCountdownParts = (countDown: number) => {
  // calculate time left
  const days = Math.floor(countDown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countDown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countDown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countDown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export { useCountdown };
import React, {useState, useEffect,useRef} from 'react';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

const Feeling = ({ isDashboard = false }) => {
    const [progress, setProgress] = useState(10);
    const [buffer, setBuffer] = useState(20);
    const [colors, setColors] = useState('');
    const [textAnalyse, setTextAnalysis] = useState('');
  const progressRef = useRef(() => {});
  useEffect(() => {
    progressRef.current = () => {
        let newColors;
        let analyse;
        if (progress >= 0 && progress <= 35) {
            newColors = '#e53935';
            analyse = 'Negative';
            const diff = Math.random() * 10;
            const diff2 = Math.random() * 10;
            setProgress(progress + diff);
            setBuffer(buffer + diff2);
        } else if (progress >= 35 && progress <= 65) {
          newColors = '#ff9800';
            analyse = 'Neutral';
            const diff = Math.random() * 10;
            const diff2 = Math.random() * 10;
            setProgress(progress + diff);
            setBuffer(buffer + diff2);
        } else if (progress >= 65 && progress <= 100) {
          newColors = '#2e7c67';
          analyse = 'Positive';
          const diff = Math.random() * 10;
          const diff2 = Math.random() * 10;
          setProgress(progress + diff);
          setBuffer(buffer + diff2);
        } else {
            const diff = Math.random() * 10;
            const diff2 = Math.random() * 10;
            setProgress(progress + diff);
            setBuffer(buffer + diff2);
            }
    
        setColors(newColors);
        setTextAnalysis(analyse);
        setProgress((prevProgress) => prevProgress + 1);
        setBuffer((prevBuffer) => prevBuffer + 10);
        if (progress >= 100) {
          setProgress(0);
        }
      };
    }, [progress, buffer]);

    

  React.useEffect(() => {
    const timer = setInterval(() => {
      progressRef.current();
    }, 5000); // 20 seconds

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Box sx={{ width: '100%', marginTop: '2rem' }}>
        {textAnalyse &&
        <>
            <h1 style={{color: colors}}>{textAnalyse}</h1>
            <LinearProgress variant="determinate" value={progress} valueBuffer={buffer} colors={[colors]} /> 
        </>
        }
    </Box>
  );
}


export default Feeling;

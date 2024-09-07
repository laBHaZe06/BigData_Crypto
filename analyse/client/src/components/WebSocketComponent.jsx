import React, { useContext,useEffect,useState} from 'react';
import { WebSocketContext } from '../context/WebSocketContext';
import LineChart from './LineChart';
import BoxPlotChart from './BoxPlotChart';

const WebSocketComponent = ({ symbol }) => {
    const [isLineChart, setIsLineChart] = useState(true);
    const { data, setSymbol } = useContext(WebSocketContext);

    useEffect(() => {
        setSymbol(symbol);
    }, [setSymbol, symbol]);

    const handleChartToggle = () => {
        setIsLineChart(prevState => !prevState);
    };

    return (
        <>

            {isLineChart ? (
                <LineChart data={data} isDashboard={true} />
            ) : (
                <BoxPlotChart data={data} isDashboard={true}  />
            )}
           
            <button onClick={handleChartToggle} >
                {isLineChart ? 'Afficher Chandeliers (BoxPlot)' : 'Afficher Courbes'}
            </button>
           

     
       
        </>
    );
};

              
export default WebSocketComponent;
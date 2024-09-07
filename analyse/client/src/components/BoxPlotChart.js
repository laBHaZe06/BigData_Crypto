import React from 'react';
import { ResponsiveBoxPlot } from '@nivo/boxplot';
import { useTheme } from '@mui/material';
import { tokens } from '../theme';

const BoxPlotChart = ({ data, isCustomLineColors = false, isDashboard = false }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);

    // Fonction pour vérifier si une date est valide
    const isValidDate = (date) => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    const quantile = (array, q) => {
        const pos = (array.length - 1) * q;
        const base = Math.floor(pos);
        const rest = pos - base;
        if (array[base + 1] !== undefined) {
            return array[base] + rest * (array[base + 1] - array[base]);
        } else {
            return array[base];
        }
    };

    // Fonction pour regrouper les données par date
    const groupByDate = (data) => {
        const grouped = {};
        data.forEach(series => {
            if (series.data && Array.isArray(series.data)) {
                series.data.forEach(d => {
                    if (d.x && d.y) {
                        const date = new Date(d.x);
                        if (isValidDate(date)) {
                            const formattedDate = date.toISOString().split('T')[0];
                            if (!grouped[formattedDate]) {
                                grouped[formattedDate] = [];
                            }
                            grouped[formattedDate].push(d.y);
                        } else {
                            console.error(`Invalid date value: ${d.x}`);
                        }
                    } else {
                        console.error(`Data missing x or y value:`, d);
                    }
                });
            } else {
                console.error('Series data is not in expected format:', series);
            }
        });
        return grouped;
    };

    const formatDataForBoxPlot = (data) => {
        const groupedData = groupByDate(data);
        
        // Transformer les données groupées en format BoxPlot
        return Object.keys(groupedData).map(date => {
            const prices = groupedData[date];
            prices.sort((a, b) => a - b); // Trie les prix pour calculer les quartiles
    
            return {
                group: date,
                min: prices[0],
                q1: quantile(prices, 0.25),
                median: quantile(prices, 0.5),
                q3: quantile(prices, 0.75),
                max: prices[prices.length - 1]
            };
        });
    };

    const boxPlotData = formatDataForBoxPlot(data);

    console.log('BoxPlot Data:', boxPlotData);

    return (
        <ResponsiveBoxPlot
            data={boxPlotData}
            margin={{ top: 60, right: 140, bottom: 60, left: 60 }}
            minValue={0}
            maxValue={1000000} // Ajuste cette valeur selon tes besoins
            subgroupBy="group" // Assure-toi que cette propriété correspond à tes données
            quantiles={[0.1, 0.25, 0.5, 0.75, 0.9]}
            padding={0.12}
            enableGridX={true}
            yScale={{
                min: "auto",
                max: "auto",

              }}
            axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Date',
                legendPosition: 'middle',
                legendOffset: 32,
                tickColor: colors.grey[100], // Utilisation des couleurs du thème
            }}
            axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: 'Valeur',
                legendPosition: 'middle',
                legendOffset: -40,
                tickColor: colors.grey[100], // Utilisation des couleurs du thème
            }}
            colors={{ scheme: isDashboard ? 'nivo' : 'nivo' }} // Utilisation des couleurs du thème
            borderRadius={2}
            borderWidth={2}
            borderColor={{
                from: 'color',
                modifiers: [['darker', 0.3]],
            }}
            medianWidth={2}
            medianColor={{
                from: 'color',
                modifiers: [['darker', 0.3]],
            }}
            whiskerEndSize={0.6}
            whiskerColor={{
                from: 'color',
                modifiers: [['darker', 0.3]],
            }}
            motionConfig="stiff"
            legends={[
                {
                    anchor: 'right',
                    direction: 'column',
                    translateX: 100,
                    itemWidth: 60,
                    itemHeight: 20,
                    itemsSpacing: 3,
                    itemTextColor: colors.grey[100], // Utilisation des couleurs du thème
                    symbolSize: 20,
                    symbolShape: 'square',
                    effects: [
                        {
                            on: 'hover',
                            style: {
                                itemTextColor: colors.primary[500], // Utilisation des couleurs du thème
                            },
                        },
                    ],
                },
            ]}
        />
    );
};

export default BoxPlotChart;
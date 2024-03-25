import React, { useRef, useEffect, useState } from 'react';
import Chart from 'chart.js/auto';
import DoubleSlider from "./DoubleSlider";

const AreaChart = ({
                       similarities,
                       minValue,
                       maxValue,
                       selectedMaxValue,
                       setSelectedMaxValue,
                       setSelectedMinValue,
                       selectedMinValue,
                       filteredItems
    }) => {
    const chartRef = useRef(null);
    const [value, setValue] = useState([minValue, maxValue]);
    const [itemPercentile, setItemPercentile] = useState(filteredItems.length);
    let chartInstance;

    useEffect(() => {
        createChart();
        return () => {
            // Cleanup function to destroy the chart instance
            if (chartInstance) {
                chartInstance.destroy();
            }
        };
    }, [similarities, maxValue, minValue]);

    const createChart = () => {
        if (!chartRef.current) return;

        const ctx = chartRef.current.getContext('2d');
        if (!ctx) return;

        // Remove existing chart instance if exists
        if (chartInstance) {
            chartInstance.destroy();
        }

        // Define the bin width and calculate the number of bins
        const binWidth = 0.1; // Adjust as needed
        const numBins = Math.ceil((maxValue - minValue) / binWidth);

        // Initialize an array to hold the counts for each bin
        const binCounts = new Array(numBins).fill(0);

        // Count the number of items falling into each bin
        Object.values(similarities).forEach(similarity => {
            const binIndex = Math.floor((similarity - minValue) / binWidth);
            if (binIndex >= 0 && binIndex < numBins) {
                binCounts[binIndex]++;
            }
        });

        // Create labels for the bins
        const binLabels = [];
        for (let i = 0; i < numBins; i++) {
            binLabels.push((minValue + i * binWidth).toFixed(2)); // Adjust precision as needed
        }

        // Create the chart data
        const data = {
            labels: binLabels,
            datasets: [{
                label: 'Number of Items',
                data: binCounts,
                fill: 'origin',
                backgroundColor: '#E3E3E3',
                borderColor: '#949494',
                borderWidth: 2,
                tension: 0.4,
                pointRadius: 0, // Hide data points by default
                hoverRadius: 5, // Show data points when hovered
            }]
        };

        // Create the chart instance
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        type: 'linear',
                        min: minValue,
                        max: maxValue,
                        title: {
                            display: true,
                            text: 'Similarity Score'
                        },
                        grid: {
                            display: false // Hide x-axis gridlines
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Number of Items'
                        },
                        ticks: {
                            display: false // Hide y-axis count numbers
                        },
                        grid: {
                            display: false // Hide y-axis gridlines
                        }
                    },
                }
            }
        });
    };

    useEffect(() => {
        setItemPercentile(filteredItems.length);
    }, [filteredItems]);

    const areaChartStyle = {
        width: '100%',
        height: '200px',
    };

    return (
        <div className={"areachart-container"}>
            <div className={"component-header"}>Filter</div>
            <label className={"sub-text"}>
                {itemPercentile} items selected
            </label>
            <canvas ref={chartRef} style={areaChartStyle}></canvas>
            <DoubleSlider selectedMinValue={selectedMinValue}
                          selectedMaxValue={selectedMaxValue}
                          setSelectedMinValue={setSelectedMinValue}
                          setSelectedMaxValue={setSelectedMaxValue}
                          minValue={minValue}
                          maxValue={maxValue} />
        </div>
    );
};

export default AreaChart;

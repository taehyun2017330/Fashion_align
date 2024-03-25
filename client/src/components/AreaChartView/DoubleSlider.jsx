import React, { useRef, useEffect, useState } from 'react';

const DoubleSlider = ({ minValue, maxValue, selectedMinValue, setSelectedMinValue, selectedMaxValue, setSelectedMaxValue }) => {
    const sliderRef = useRef(null);
    const [isDraggingMin, setIsDraggingMin] = useState(false);
    const [isDraggingMax, setIsDraggingMax] = useState(false);

    const handleMouseDown = (event, type) => {
        if (type === 'min') {
            setIsDraggingMin(true);
        } else if (type === 'max') {
            setIsDraggingMax(true);
        }
    };

    const handleMouseMove = (event) => {
        if (isDraggingMin) {
            const newValue = calculateValue(event.clientX, sliderRef.current.getBoundingClientRect().left, sliderRef.current.offsetWidth);
            if (newValue <= selectedMaxValue) {
                const adjustedValue = Math.max(newValue, minValue); // Ensure newValue is not less than minValue
                setSelectedMinValue(adjustedValue);
            }
        }
        if (isDraggingMax) {
            const newValue = calculateValue(event.clientX, sliderRef.current.getBoundingClientRect().left, sliderRef.current.offsetWidth);
            if (newValue >= selectedMinValue) {
                const adjustedValue = Math.min(newValue, maxValue); // Ensure newValue is not greater than maxValue
                setSelectedMaxValue(adjustedValue);
            }
        }
    };

    const calculateValue = (mouseX, barLeft, barWidth) => {
        // Calculate the offset of the mouse position relative to the bar
        let offsetX = mouseX - barLeft;

        // Ensure the offsetX stays within the bounds of the bar
        offsetX = Math.max(offsetX, 0);
        offsetX = Math.min(offsetX, barWidth);

        // Calculate the percentage of the offset relative to the bar width
        const percent = offsetX / barWidth;

        // Calculate the new value based on the percentage and value range
        const valueRange = maxValue - minValue;
        return minValue + percent * valueRange;
    };


    const handleMouseUp = () => {
        setIsDraggingMin(false);
        setIsDraggingMax(false);
    };

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDraggingMin, isDraggingMax]);

    return (
        <div className="double-slider" ref={sliderRef}>
            <div
                className="selected-range"
                style={{
                    left: ((selectedMinValue - minValue) / (maxValue - minValue)) * 100 + '%',
                    width: ((selectedMaxValue - selectedMinValue) / (maxValue - minValue)) * 100 + '%'
                }}
            />
            <div
                className="slider-handle"
                style={{ left: ((selectedMinValue - minValue) / (maxValue - minValue)) * 100 + '%' }}
                onMouseDown={(event) => handleMouseDown(event, 'min')}
            />
            <div
                className="slider-handle"
                style={{ left: ((selectedMaxValue - minValue) / (maxValue - minValue)) * 100 + '%' }}
                onMouseDown={(event) => handleMouseDown(event, 'max')}
            />
        </div>
    );
};

export default DoubleSlider;

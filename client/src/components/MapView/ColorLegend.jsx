import React, {useState} from 'react';
import * as d3 from "d3";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const ColorLegend = ({ categories }) => {
    const scale = d3.scaleOrdinal(d3.schemeTableau10);
    const [isLegendVisible, setLegendVisible] = useState(true);

    const toggleLegendVisibility = () => {
        setLegendVisible(!isLegendVisible);
    };

    return (
        <div className="color-legend-container">
            <label className={"component-header"}>Color Legend</label>
            {isLegendVisible && (
                <div style={{display: "flex"}}>
                    {categories.map((category, index) => (
                        <div key={index} className="color-legend-item">
                            <div className="color-legend-dot" style={{ backgroundColor: scale(category) }}></div>
                            <div className="sub-text">{category}</div>
                        </div>
                    ))}
                </div>
            )}
            <button className={"point-button"} onClick={toggleLegendVisibility} style={{ padding: "0px 5px" }}>
                {isLegendVisible ? <FontAwesomeIcon icon={faChevronLeft} /> : <FontAwesomeIcon icon={faChevronRight} />}
            </button>
        </div>
    );
};

export default ColorLegend;



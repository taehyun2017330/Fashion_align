import React, { useState } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

const KeywordChip = ({ keyword, onClickRemove, onClickAdd, isKeyword, isBold }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div className={"chip-container"} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
            <div className={"chip-inner"}>
                <span style={isBold ? { fontWeight: 'bold' } : {}}>{keyword}</span>
                {isHovered && isKeyword && (
                    <button className={"point-button"}
                            onClick={onClickRemove}
                            style={{ padding: 0 }}>
                        <FontAwesomeIcon icon={faMinus} />
                    </button>
                )}
                {!isKeyword && isHovered && (
                    <button className={"point-button"}
                            onClick={onClickAdd}
                            style={{ padding: 0 }}>
                        <FontAwesomeIcon icon={faPlus} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default KeywordChip;






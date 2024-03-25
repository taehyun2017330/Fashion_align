import React, { useState, useRef, useEffect } from 'react';
import KeywordChip from '../KeywordChip';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { NUM_KEYWORDS } from '../../App';

const KeywordGroup = ({ 
    groupNumber, 
    similaritiesArray, 
    keywordsArray, 
    image, 
    hiddenState, 
    onStateChange,
    onKeywordArrayChange,
    onRemoveClick
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const imageRef = useRef(null);
    const [imageHeight, setImageHeight] = useState(0);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    useEffect(() => {
        if (imageRef.current) {
            setImageHeight(imageRef.current.offsetHeight);
        }
    }, [image]);

    const handleHideClick = () => {
        const newHiddenState = !hiddenState;
        onStateChange(newHiddenState);
    };

    const renderImage = () => {
        if (image) {
            const maxHeight = imageHeight < styles.keywordWrapper.minHeight ? imageHeight : styles.keywordWrapper.minHeight;
            return (
                <div style={{ width: '20%', height: maxHeight, marginRight: '8px' }}>
                    <img ref={imageRef} src={image} alt="Group Image" style={{ height: '100%', width: 'auto', objectFit: 'cover' }} />
                </div>
            );
        }
        return null;
    };

    const onClickRemove = (keywordToRemove) => {
        const updatedKeywordsArray = keywordsArray.filter(keyword => keyword !== keywordToRemove);
        onKeywordArrayChange(updatedKeywordsArray);
    };

    const containerOpacity = hiddenState ? 0.3 : 1;
    
    return (
        <div 
        className={"keyword-group-container"} 
        style={{...styles.container, opacity: containerOpacity}}
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
        >
            {isHovered && (
                <div>
                <div style={styles.buttonContainer}>
                    <button className={"point-button"} onClick={handleHideClick}>
                        {hiddenState ? "Show" : " Hide"}
                    </button>
                    <button className={"point-button"} onClick={onRemoveClick}>
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
                </div>
            )}
            <div style={styles.contentWrapper}>
            {renderImage()}
            <div style={styles.keywordWrapper}>
                {keywordsArray.map((keyword, index) => (
                    <KeywordChip
                        key={index}
                        keyword={keyword}
                        isKeyword={true}
                        isBold={index === 0 && keywordsArray.length > NUM_KEYWORDS}
                        onClickRemove={() => onClickRemove(keyword)}
                    />
                ))}
            </div>
            </div>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#FAFAFA'
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
    contentWrapper: {
        display: 'flex',
        alignItems: 'center', // Vertically center items
        flexDirection: 'row',
    },
    keywordWrapper: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '5px',
        minHeight: '40px', // Set a minimum height for the keyword wrapper
    },
};

export default KeywordGroup;

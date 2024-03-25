import React, { useRef, useState } from 'react';
import OpenAIAPI from "../../api/OpenAIAPI";
import KeywordGroup from './KeywordGroup';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { faArrowUpFromBracket } from '@fortawesome/free-solid-svg-icons';
import { NUM_KEYWORDS } from '../../App';

const UserInput = ({
    onKeyDown,
    isInitialSearch,
    setIsInitialSearch,
    setIsLoading,
    setCategory,
    setImage,
    keywordGroups,
    setKeywordGroups
}) => {
    const textareaRef = useRef(null);
    const [value, setValue] = useState('');
    const headerLabel = isInitialSearch ? 'Start your search' : 'Add keywords';
    const [initialQuery, setInitialQuery] = useState('');

    const handleInputChange = (e) => {
        setValue(e.target.value);
    };

    const handleRefreshButton = () => {
        setKeywordGroups([]);
        setValue('');
        setIsInitialSearch(true);
    }

    const getSimilarities = async (query) => {
        try {
          const response = await fetch('api/search', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({query: query}),
          });
          if (response.ok) {
            const data = await response.json();
            return data.response.similarities;
          }
        } catch (error) {
          console.error('Error:', error);
        }
      };

    //for initial search
    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            e.currentTarget.blur();
            const response = await OpenAIAPI.extractQueryKeywords(value);
            const keywords = [...response?.Keywords || [], ...response?.Recommendations || []];
            if (keywords) {
                const query = keywords.join(' ');
                const newKeywordGroup = {
                    groupNumber: keywordGroups.length + 1,
                    similaritiesArray: await getSimilarities(query), 
                    keywordsArray: keywords,
                    hiddenState: false, 
                };
                setKeywordGroups([...keywordGroups, newKeywordGroup]);
            }
            setValue('');
            setIsInitialSearch(false);
        }
    }

    // Handler for when an image is selected
    const handleImageChange = async (event) => {
        const prompt =
            `Give me a comma-separated list of ${NUM_KEYWORDS} short keywords, that best captures the style of the given clothing in JSON response. The key should Keywords.`;
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Image = event.target.result;
            OpenAIAPI.extractSingleImageKeywords(base64Image, prompt).then(async (response) => {
                const startIndex = response.indexOf('{');
                const endIndex = response.lastIndexOf('}');
                const responseData = JSON.parse(response.substring(startIndex, endIndex + 1));
                const keywords = responseData.Keywords.split(',').map(keyword => keyword.trim());
                const query = keywords.join(' ');
                const newKeywordGroup = {
                    groupNumber: keywordGroups.length + 1,
                    similaritiesArray: await getSimilarities(query), 
                    keywordsArray: keywords,
                    image: base64Image,
                    hiddenState: false, 
                };
                setKeywordGroups([...keywordGroups, newKeywordGroup]);
                setIsInitialSearch(false);
            });
        };
        reader.readAsDataURL(file);
    };

    const handleGroupStateChange = (index, newHiddenState) => {
        // Make a copy of the keywordGroups array to avoid mutating state directly
        const updatedKeywordGroups = [...keywordGroups];
    
        // Update the keyword group at the specified index with the new hidden state and similarities array
        updatedKeywordGroups[index] = {
            ...updatedKeywordGroups[index], // Maintain the existing properties of the keyword group
            hiddenState: newHiddenState, // Update hiddenState with the newHiddenState
        };

        // Update the state with the modified keywordGroups array
        setKeywordGroups(updatedKeywordGroups);
    };

    const handleKeywordArrayChange = async (index, newKeywordsArray) => {
        // Make a copy of the keywordGroups array to avoid mutating state directly
        const updatedKeywordGroups = [...keywordGroups];
    
        // Update the keyword group at the specified index with the new keywords array
        updatedKeywordGroups[index] = {
            ...updatedKeywordGroups[index], // Maintain the existing properties of the keyword group
            keywordsArray: newKeywordsArray // Update keywordsArray with the newKeywordsArray
        };
    
        // Recalculate similarity for the updated keywords array
        const query = newKeywordsArray.join(' ');
        const newSimilaritiesArray = await getSimilarities(query); // Assuming getSimilarities is a function to calculate similarities
        // Update the similaritiesArray of the updated keyword group
        updatedKeywordGroups[index].similaritiesArray = newSimilaritiesArray;
    
        // Update the state with the modified keywordGroups array
        setKeywordGroups(updatedKeywordGroups);
    };

    const handleGroupRemoveClick = (index) => {
        // Make a copy of the keywordGroups array to avoid mutating state directly
        const updatedKeywordGroups = [...keywordGroups];

        // Remove the keyword group at the specified index
        updatedKeywordGroups.splice(index, 1);
    
        // Update the state with the modified keywordGroups array
        setKeywordGroups(updatedKeywordGroups);
    };
    

    return (
        <div className="user-input-container">
            <div className={"user-input-header"}>
                <div className="label-button-header">
                    <label className="component-header">{headerLabel}</label>
                    <div>
                        <label className="point-button">
                            <input id="file-input" type="file" onChange={handleImageChange} accept="image/*" style={{display: "none"}} />
                            <FontAwesomeIcon icon={faArrowUpFromBracket} />
                        </label>
                        <button onClick={handleRefreshButton} className={"point-button"}>
                            <FontAwesomeIcon icon={faArrowsRotate} />
                        </button>
                    </div>
                </div>
                <textarea
                value={value}
                className="textarea-container"
                onKeyDown={handleSearch}
                onChange={handleInputChange}
            />
            </div>
            <div className="keyword-groups-outer">
            {keywordGroups.map((group, index) => (
                <KeywordGroup
                    key={index}
                    groupNumber={index + 1} 
                    similaritiesArray={group.similaritiesArray}
                    keywordsArray={group.keywordsArray}
                    image={group.image}
                    hiddenState={group.hiddenState}
                    onStateChange={(newHiddenState) =>
                        handleGroupStateChange(index, newHiddenState)
                    }
                    onKeywordArrayChange={(newKeywordsArray) =>
                        handleKeywordArrayChange(index, newKeywordsArray)
                    }
                    onRemoveClick={() => handleGroupRemoveClick(index)}
                />
            ))}
            </div>
        </div>
    );
};

export default UserInput;



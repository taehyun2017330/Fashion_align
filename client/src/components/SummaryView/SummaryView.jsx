import React, {useEffect, useState} from "react";
import OpenAIApi from "../../api/OpenAIAPI";
import KeywordChip from "../KeywordChip";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faCaretLeft, faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { brush } from "d3";
import CollageImage from "./CollageImage";

const SummaryView = ({ 
    brushedItems, 
    keywordGroups, 
    setKeywordGroups 
}) => {

    const defaultPrompt =
        'Give me a comma-separated list of three short descriptions, that best captures the style of the given clothing.' +
        'Use abstract and high-level everyday language keywords.' +
        'Try to generate meaningful keywords, not too simple yet not too detailed.';

    const [value, setValue] = useState(defaultPrompt);
    const [summary, setSummary] = useState("");

    // keywords
    const [currIndex, setCurrIndex] = useState(5);
    const [keywords, setKeywords] = useState(Array.from({ length: 11 }, () => []));
    const [currentKeywords, setCurrentKeywords] = useState([]);

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

    // Add keyword group to the list of keyword groups
    const handleAddKeyword = async (addedKeyword) => {
        const imageURL = `https://fashionalign.s3.ap-northeast-2.amazonaws.com/${brushedItems[0].id}.jpg`
        const newKeywordGroup = {
            groupNumber: keywordGroups.length + 1,
            image: imageURL,
            similaritiesArray: await getSimilarities(addedKeyword), 
            keywordsArray: [addedKeyword],
            hiddenState: false, 
        };
        setKeywordGroups([...keywordGroups, newKeywordGroup]);
    };

    useEffect(() => {
        setKeywords(Array.from({ length: 11 }, () => []));
        setCurrIndex(5);
        setCurrentKeywords([]);
    }, [brushedItems]);

    const onClickAbstract = async () => {
        if (currIndex === 0) return;
        if (keywords[currIndex - 1].length > 0) {
            setCurrentKeywords(keywords[currIndex - 1]);
            setCurrIndex(currIndex - 1);
        } else {
            const newPrompt =
                `You gave me ${currentKeywords.map(keyword => keyword).join(', ')}.)}` +
                'Give me more abstract and high-level language keywords. Should be Comma-separated.'
            await fetchKeywords(currIndex - 1, newPrompt);
        }
    };

    const onClickDetailed = async () => {
        if (currIndex === 10) return;
        if (keywords[currIndex + 1].length > 0) {
            setCurrentKeywords(keywords[currIndex + 1]);
            setCurrIndex(currIndex + 1);
        } else {
            const newPrompt =
                `You gave me ${currentKeywords.map(keyword => keyword).join(', ')}.)}` +
                'Give me more detailed and specific keywords that can be generalized for all items. Should be Comma-separated.'
            await fetchKeywords(currIndex + 1, newPrompt);
        }
    };

    const fetchKeywords = async (index, newPrompt) => {
        try {
            const response = await OpenAIApi.extractImageKeywords(brushedItems, defaultPrompt + newPrompt);
            const parsedResponse = response.split(',').map(keyword => keyword.trim()).slice(0, 3);
            const updatedKeywords = [...keywords];
            updatedKeywords[index] = parsedResponse;
            setKeywords(updatedKeywords);
            setCurrentKeywords(parsedResponse);
            setCurrIndex(index);
        } catch (error) {
            console.error("Error fetching keywords:", error);
        }
    };

    useEffect(() => {
        console.log(brushedItems);
    }, [brushedItems]);

    return (
        <div className={"summary-container"}>
            <div className={"label-button-header"}>
                <div className={"component-header"}>Item Summary</div>
                <button className={"point-button"} onClick={() => fetchKeywords(currIndex)}>generate</button>
            </div>
            {keywords[5].length !== 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                    <button onClick={onClickAbstract} className={"point-button"}>
                        <FontAwesomeIcon icon={faCaretLeft} />
                        <label className={"sub-text"} style={{ fontSize: '10px' }}>Abstract</label>
                    </button>
                    <div className={"summary-card-container"} style={{ padding: 5 }}>
                        {keywords[currIndex] && keywords[currIndex].map((keyword, keywordIndex) => (
                            <KeywordChip key={keywordIndex} keyword={keyword} isKeyword={false}
                                         onClickAdd={() => handleAddKeyword(keyword)}/>
                        ))}
                    </div>
                    <button onClick={onClickDetailed} className={"point-button"}>
                        <FontAwesomeIcon icon={faCaretRight} />
                        <label className={"sub-text"} style={{ fontSize: '10px' }}>Detailed</label>
                    </button>
                </div>
            )}
        </div>
    );
};

export default SummaryView;

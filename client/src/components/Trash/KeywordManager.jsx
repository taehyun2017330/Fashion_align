import React from 'react';
import KeywordChip from "../KeywordChip";

const KeywordManager = ({ keywords, setKeywords, isLoading }) => {
    const handleRemoveKeyword = (removedKeyword) => {
        const updatedKeywords = keywords.filter(keyword => keyword !== removedKeyword);
        setKeywords(updatedKeywords);
    };

    return (
        <div className={"keywords-container"}>
            <label className={"component-header"}>Search Keywords</label>
            <div style={styles.keywordWrapper}>
                {keywords.map((keyword, index) => (
                    <KeywordChip
                        key={index}
                        keyword={keyword}
                        onClickRemove={() => handleRemoveKeyword(keyword)}
                        isKeyword={true}
                    />
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        backgroundColor: 'white',
        padding: '10px',
        borderRadius: '20px',
        width: '100%',
    },

    label: {
        fontFamily: 'Mona Sans',
        fontSize: '14px',
        fontWeight: 'bold',
        marginBottom: '5px',
    },

    textarea: {
        width: '90%',
        padding: '10px',
        borderRadius: '15px',
        backgroundColor: '#F8F8F8',
        border: '1px solid #D3D3D3',
        outline: 'none',
        overflowY: 'hidden',
        resize: 'vertical',
        height: 'auto',
        minHeight: '50px',
    },

    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        marginBottom: '5px',
    },

    keywordWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginTop: '5px',
    },
};

export default KeywordManager;

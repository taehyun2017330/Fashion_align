import React from 'react';
import KeywordChip from "../KeywordChip";

const CategoryTab = ({ category, setCategory, isLoading }) => {
    return (
        <div className={"category-container"}>
            <div className={"label-button-header"}>
                <label className={"component-header"}>Category</label>
                {category && category !== '' && category !== 'None' ? (
                    <KeywordChip keyword={category} onClickRemove={() => setCategory('')} isKeyword={true}/>
                ) : (
                    <label className={"sub-text"}>None</label>
                )}
            </div>
        </div>
    );
};

export default CategoryTab;

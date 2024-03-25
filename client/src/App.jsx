import './App.css';
import {useEffect, useState} from "react";
import ItemMap from "./components/MapView/ItemMap";
import UserInput from "./components/InputView/UserInput";
import SummaryView from "./components/SummaryView/SummaryView";
import KeywordManager from "./components/Trash/KeywordManager";
import ListView from "./components/SummaryView/ListView";
import CategoryTab from "./components/Trash/Category";
import AreaChart from "./components/AreaChartView/AreaChart";

export const NUM_KEYWORDS = 3;

function App() {
  const [items, setItems] = useState([]);
  const [brushedItems, setBrushedItems] = useState([]);
  const [isInitialSearch, setIsInitialSearch] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [similarities, setSimilarities] = useState({});
  const [minSimilarity, setMinSimilarity] = useState(0);
  const [maxSimilarity, setMaxSimilarity] = useState(0);
  const [searchError, setSearchError] = useState(false);
  //For selecting range similarities
  const [selectedMinValue, setSelectedMinValue] = useState(0);
  const [selectedMaxValue, setSelectedMaxValue] = useState(0);
  const [filteredItems, setFilteredItems] = useState([]);
  const [image, setImage] = useState(null);

  //keyword groups 
  const [keywordGroups, setKeywordGroups] = useState([]);

  // Calculating mean similarity 
  useEffect(() => {
    const fetchSimilarityData = async () => {
        // Filter out hidden groups and calculate mean similarity for visible groups
        const visibleGroups = keywordGroups.filter(group => !group.hiddenState);
        
        // Create a dictionary to store cumulative sum and count of similarities for each ID
        const meanSimilarityDictionary = {};
        
        for (const group of visibleGroups) {
            // Wait for the promise to resolve
            const similaritiesArray = await group.similaritiesArray;
            // Once the promise is resolved, continue processing
            const similarityEntries = Object.entries(similaritiesArray);
            similarityEntries.forEach(([id, similarity]) => {
                const numericSimilarity = Number(similarity);
                if (!isNaN(numericSimilarity)) {
                    if (!meanSimilarityDictionary[id]) {
                        meanSimilarityDictionary[id] = {
                            sum: numericSimilarity,
                            count: 1
                        };
                    } else {
                        meanSimilarityDictionary[id].sum += numericSimilarity;
                        meanSimilarityDictionary[id].count++;
                    }
                }
            });
        }
        
        // TODO: the data format is weird here
        const similarityEntries = Object.entries(meanSimilarityDictionary).reduce((acc, [id, data]) => {
          acc[id] = data.sum / data.count;
          return acc;
      }, {});
        const similarityValues = Object.values(similarityEntries);
        const minSimilarity = similarityValues.length > 0 ? Math.min(...similarityValues) : 0;
        const maxSimilarity = similarityValues.length > 0 ? Math.max(...similarityValues) : 0;

        if (!isNaN(minSimilarity) && !isNaN(maxSimilarity)) {
            setSimilarities(similarityEntries);
            setMinSimilarity(minSimilarity);
            setMaxSimilarity(maxSimilarity);
        }
    };
    fetchSimilarityData();
}, [keywordGroups]);

  useEffect(() => {
    getItems();
  }, []);

  const getItems = async () => {
    try {
      const response = await fetch('api/items', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
        setFilteredItems(data);
      } else {
        console.error('Request failed with status:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    if (isInitialSearch) {
      setSimilarities({});
    }
  }, [isInitialSearch]);


  return (
    <div className="App">
      <div style={{display: 'flex', flexDirection: 'column', gap: '10px', width: '20%'}}>
        <label style={{fontSize: 30, fontFamily: 'Mona Sans', fontWeight: 'bold'}}>FashionAlign</label>
        <UserInput
            isInitialSearch={isInitialSearch}
            setIsInitialSearch={setIsInitialSearch}
            setIsLoading={setIsLoading}
            setKeywords={setKeywords}
            setCategory={setCategory}
            keywords={keywords}
            setImage={setImage}
            keywordGroups={keywordGroups}
            setKeywordGroups={setKeywordGroups}
        />
        <AreaChart
            similarities={similarities}
            minValue={minSimilarity}
            maxValue={maxSimilarity}
            selectedMaxValue={selectedMaxValue}
            setSelectedMaxValue={setSelectedMaxValue}
            selectedMinValue={selectedMinValue}
            setSelectedMinValue={setSelectedMinValue}
            filteredItems={filteredItems}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'column', gap: '10px', width: '20%'}}>
        <ListView brushedItems={brushedItems} />
        <SummaryView
            brushedItems={brushedItems}
            keywordGroups={keywordGroups}
            setKeywordGroups={setKeywordGroups}
        />
      </div>
      <ItemMap items={items}
               setBrushedItems={setBrushedItems}
               filteredItems={filteredItems}
               setFilteredItems={setFilteredItems}
               similarities={similarities}
               selectedMinValue={selectedMinValue}
               selectedMaxValue={selectedMaxValue}
               category={category}
      />
    </div>
  );
}

export default App;

# backend/app/controllers/item_data_controller.py

import numpy as np
import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.metrics import pairwise_distances_argmin_min
import numpy as np

class ItemDataController:
    def __init__(self, item_df, coats_df, dresses_df, jackets_df, pants_df, skirts_df, tops_df):
        self.item_df = item_df
        self.coats_df = coats_df
        self.dresses_df = dresses_df
        self.jackets_df = jackets_df
        self.pants_df = pants_df
        self.skirts_df = skirts_df
        self.tops_df = tops_df

    # Get entire dataset (initial run)
    def get_items(self):
        selected_columns = ['id', 'category', 'x', 'y', 'shortDescription', 'description']
        result_df = self.item_df.loc[:, selected_columns]
        result_json = result_df.to_json(orient='records')
        return result_json

    def get_keywords(self, item_id):
        category = self.get_category(item_id)
        if category is None:
            return None
        lowercase_category = category.lower()
        category_df = getattr(self, f'{lowercase_category}_df', None)
        if category_df is None:
            print(f'No keywords for category {category}')
            return None
        item_row = category_df[category_df['id'] == np.int64(item_id)]
        if item_row.empty:
            print(f'The category {category} does not have item {item_id}')
            return None
        keywords_dict = item_row.iloc[0].to_dict()
        keywords_json = json.dumps(keywords_dict)
        return keywords_json

    def get_category(self, item_id):
        # Get the category of the item
        selected_rows = self.item_df[self.item_df['id'] == np.int64(item_id)]
        if not selected_rows.empty:
            category_value = selected_rows.iloc[0]['category'].lower()
            return category_value
        else:
            return None

    def is_same_category(self, item_ids):
        # Get if if the item ids are the same categories
        categories = []
        for item_id in item_ids:
            categories.append(self.get_category(item_id))
        is_same_category = len(set(categories)) == 1
        return is_same_category

    def get_attribute_list(self, item_ids):
        # Get the list of attributes to create the stacked bar chart with
        is_same_category = self.is_same_category(item_ids)
        if is_same_category:
            attributes = self.get_attributes_for_category(item_ids[0])
        else:
            attributes = ['Color/Print/Pattern', 'Material', 'Category', 'Detail']
        
        return attributes
    

    def get_clustered_attributes(self, item_ids):
        # Get the list of attributes 
        attributes = self.get_attribute_list(item_ids)
    
        # Dictionary to store clustered attributes
        clustered_attributes = {}

        for attribute in attributes:
            attribute_keywords = []
            for item_id in item_ids:
                if attribute == 'Category':
                    attribute_keywords.append(self.get_category(item_id))
                else:
                    keywords_json = self.get_keywords(item_id)
                    if keywords_json:
                        keywords = json.loads(keywords_json)
                        attribute_value = keywords.get(attribute, "")  
                        attribute_keywords.append(attribute_value)

            # Cluster keywords for the current attribute
            clusters = self.cluster_keywords(attribute_keywords)

            # Store clusters in the dictionary
            clustered_attributes[attribute] = clusters
    
        return clustered_attributes


    def cluster_keywords(self, keywords):
        # Convert keywords to TF-IDF features
        if keywords is None or not any(keywords):
            return None
        
        vectorizer = TfidfVectorizer(stop_words='english')
        X = vectorizer.fit_transform(keywords)

        # Cluster keywords using K-Means (max is 5, min is 2)
        num_clusters = max(2, min(5, len(keywords)))
        kmeans = KMeans(n_clusters=num_clusters, random_state=42)
        kmeans.fit(X)

        # Find the closest keywords to each cluster center
        closest_keywords_idx = pairwise_distances_argmin_min(kmeans.cluster_centers_, X)[0]

        # Initialize a dictionary to store clusters and their representative keywords
        clusters = {}
    
        for i, idx in enumerate(closest_keywords_idx):
            cluster_id = i
            cluster_center = kmeans.cluster_centers_[i]

            # Reshape the cluster_center array to 2D
            cluster_center_2d = cluster_center.reshape(1, -1)

            representative_keyword = vectorizer.inverse_transform(cluster_center_2d)[0][0]
            keyword_count = np.sum(kmeans.labels_ == i)

            clusters[cluster_id] = {
                'representative_keyword': representative_keyword,
                'keyword_count': keyword_count
            }

        print(clusters)
        return clusters


    def get_attributes_for_category(self, item_id):
        category = self.get_category(item_id)
        if category == 'Dresses':
            return ['Design', 'Color/Print/Pattern', 'Detail', 'Neckline', 'Material', 'Hem', 'Sleeves',
                    'Length', 'Shoulder', 'Waist/Waistline', 'Trim']
        elif category == 'Skirts':
            return ['Length', 'Color/Print/Pattern', 'Waist/Waistline', 'Detail', 'Silhouette', 'Hem',
                    'Material', 'Trim']
        elif category == 'Pants':
            return ['Fastening', 'Waist/Waistline', 'Detail', 'Material', 'Color/Print/Pattern',
                    'Design/Silhouette', 'Leg Style', 'Finish/Effect']
        elif category == 'Tops':
            return ['Design/Style', 'Print/Pattern/Color', 'Sleeves', 'Detail', 'Shoulder', 'Neckline',
                    'Effect/Finish', 'Hem', 'Trim', 'Material', 'Back', 'Hood']
        elif category == 'Jackets':
            return ['Hem', 'Sleeves', 'Collar', 'Neck', 'Waist/Waistline', 'Hood', 'Hem', 'Color/Pattern/Print',
                    'Effect/Finish', 'Material', 'Length']
        elif category == 'Coats':
            return ['Pattern/Color/Print', 'Detail', 'Material', 'Finish/Effect', 'Length', 'Collar', 'Neck',
                    'Design/Silhouette', 'Hood', 'Sleeves', 'Hem']
        else:
            return ['Color/Print/Pattern', 'Material', 'Category', 'Detail']

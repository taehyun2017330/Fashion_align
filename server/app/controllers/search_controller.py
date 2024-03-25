# backend/app/controllers/search_controller.py

import numpy as np


class SearchController:
    def __init__(self, fclip_model, item_df, image_embeddings):
        self.fclip = fclip_model
        self.item_df = item_df
        self.image_embeddings = image_embeddings

    def embed_text(self, text):
        print("Query is", text)
        return self.fclip.encode_text([text], 32)[0]

    def calculate_all_similarities(self, query_text):
        # Encode the input query text
        text_embedding = self.embed_text(query_text)
        print(text_embedding[0:10])

        response = {}
        similarities = {}

        # Calculate similarities with text embeddings
        similarity_values = text_embedding.dot(self.image_embeddings.T)

        max_similarity_index = np.argmax(similarity_values)
        max_similarity_id = str(self.item_df.iloc[max_similarity_index]['id'])

        for index in range(similarity_values.shape[0]):
            item_id = str(self.item_df.iloc[index]['id'])
            similarities[item_id] = similarity_values[index]

        min_similarity = np.min(similarity_values)
        max_similarity = np.max(similarity_values)

        response['similarities'] = similarities
        response['min_similarity'] = min_similarity
        response['max_similarity'] = max_similarity

        print(f"The id with the highest similarity is: {max_similarity_id}")

        return response

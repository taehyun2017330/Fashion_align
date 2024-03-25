# backend/app/routes/api.py
from fashion_clip.fashion_clip import FashionCLIP
import json
from flask import Blueprint, request, jsonify
import pandas as pd
import numpy as np
from app.controllers.search_controller import SearchController
from app.controllers.item_data_controller import ItemDataController
from app.data.data_loader import load_item_data, load_image_embeddings, \
    load_skirts_keywords, load_pants_keywords, load_jackets_keywords, \
    load_dresses_keywords, load_tops_keywords, load_coats_keywords

bp = Blueprint('api', __name__)

# 데이터 읽기
fclip_model = FashionCLIP('fashion-clip')
item_df = load_item_data()  # 전체 item data
image_embeddings = load_image_embeddings()

# Keyword 데이터 읽기
skirt_keywords = load_skirts_keywords()
pants_keywords = load_pants_keywords()
jackets_keywords = load_jackets_keywords()
dresses_keywords = load_dresses_keywords()
tops_keywords = load_tops_keywords()
coats_keywords = load_coats_keywords()

# Controllers
search_controller = SearchController(fclip_model, item_df, image_embeddings)
item_data_controller = ItemDataController(item_df, coats_keywords, dresses_keywords, jackets_keywords, pants_keywords,
                                          skirt_keywords, tops_keywords)


@bp.route('/search', methods=['POST'])
def search():
    data = request.get_json()
    if not data or 'query' not in data:
        return jsonify({'error': 'Missing or invalid query'}), 400

    query_text = data['query']
    response = search_controller.calculate_all_similarities(query_text)
    return jsonify({'response': response})


@bp.route('/items', methods=['GET'])
def get_items():
    return item_data_controller.get_items()


@bp.route('/item', methods=['POST'])
def item_keywords():
    data = request.get_json()
    if not data or 'item_id' not in data:
        return jsonify({'error': 'Missing or invalid item_ids'}), 400

    if not data or 'category' not in data:
        return jsonify({'error': 'Missing or invalid category'}), 400

    item_id = data['item_id']
    response = item_data_controller.get_keywords(item_id)
    return jsonify({'response': response})


@bp.route('/fetch-attribute-list', methods=['POST'])
def get_attribute_list():
    data = request.get_json()
    if not data or 'item_ids' not in data:
        return jsonify({'error': 'Missing or invalid item_ids'}), 400

    item_ids = data['item_ids']
    response = item_data_controller.get_attribute_list(item_ids)
    return jsonify({'response': response})


@bp.route('/fetch-clusters', methods=['POST'])
def get_clusters():
    data = request.get_json()
    if not data or 'item_ids' not in data:
        return jsonify({'error': 'Missing or invalid item_ids'}), 400
    
    item_ids = data['item_ids']
    response = item_data_controller.get_clustered_attributes(item_ids)
    json_response = json.dumps(response, default=convert_int64_to_int)
    return jsonify({'response': json_response})

def convert_int64_to_int(obj):
    if isinstance(obj, np.int64):
        return int(obj)
    return obj

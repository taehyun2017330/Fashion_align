# backend/app/data/data_loader.py

import pandas as pd
import numpy as np
import os

def get_project_root(csv_path):
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', csv_path)


def load_item_data(csv_path='combined_df.csv'):
    item_df = pd.read_csv(get_project_root(csv_path))
    print(item_df.head())
    return item_df


def load_image_embeddings(csv_path="image_embeddings.csv"):
    csv_path = get_project_root(csv_path)
    image_embeddings = np.loadtxt(csv_path, delimiter=",")
    image_embeddings = image_embeddings / np.linalg.norm(image_embeddings, ord=2, axis=-1, keepdims=True)
    return image_embeddings


# Read Individual Category
def load_skirts_keywords(csv_path="keywords/skirts_keywords.csv"):
    return pd.read_csv(get_project_root(csv_path))


def load_pants_keywords(csv_path="keywords/pants_keywords.csv"):
    return pd.read_csv(get_project_root(csv_path))


def load_dresses_keywords(csv_path="keywords/dresses_keywords.csv"):
    return pd.read_csv(get_project_root(csv_path))


def load_tops_keywords(csv_path="keywords/tops_keywords.csv"):
    return pd.read_csv(get_project_root(csv_path))


def load_jackets_keywords(csv_path="keywords/jackets_keywords.csv"):
    return pd.read_csv(get_project_root(csv_path))


def load_coats_keywords(csv_path="keywords/coats_keywords.csv"):
    return pd.read_csv(get_project_root(csv_path))

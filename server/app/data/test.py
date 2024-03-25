# backend/app/data/data_loader.py

import pandas as pd
import numpy as np
import os

def get_project_root(csv_path):
    return os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', csv_path)

item_df = pd.read_csv(get_project_root(csv_path='item_df.csv'))
item_df = item_df.rename(columns={'category': 'label'})
selected_columns = ['id', 'x', 'y', 'label']
item_df = item_df[selected_columns]
json_file = 'item_df_sample.json'
item_df.to_json(json_file, orient='records', lines=True)
print(f'Data saved to {json_file}')

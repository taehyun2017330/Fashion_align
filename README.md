# FashionAlign

![FashionAlign Interface](https://github.com/gracekim027/infovis-shared/blob/main/overview.png?raw=true)

FashionAlign bridges the gap between novice users' intentions and the capabilities of fashion item search engines. By using natural language processing and advanced visualization techniques, our system transforms abstract style descriptions into a visually curated display of fashion items. This approach significantly improves the search experience by aligning textual descriptions with visual features, making it easier for users to find what they're looking for without needing detailed domain knowledge.

## Key Features

- **Natural Language Search**: Enables users to search for fashion items using natural language, making the search process intuitive and accessible.
- **Semantic Alignment**: Uses advanced algorithms to align textual descriptions with visual features, ensuring that search results closely match user queries.
- **UMAP Visualization**: Employs UMAP (Uniform Manifold Approximation and Projection) for dimensionality reduction, providing a curated visual display of search results.
- **User-Centric Design**: Designed with the user in mind, FashionAlign offers an enhanced search experience, demonstrated by improved match accuracy and query refinement in user studies.

## Getting Started

To get started with FashionAlign, clone our repository and follow the setup instructions.

## Setup Instructions

### Server

1. **Setup Python Environment:**
   ```bash
   pip install -r requirements.txt

2. **Run Server:**
   ```bash
   python run.py

### Client 

1. **Set OpenAI API Key:**
   - Add your OpenAI API key to the `.env` file:
     ```makefile
     OPEN_AI_API_KEY=your_openai_api_key_here
     ```

2. **Install Dependencies:**
   ```bash
   npm install

3. **Run Client:**
   ```bash
   npm start


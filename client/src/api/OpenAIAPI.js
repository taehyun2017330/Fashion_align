import OpenAI from 'openai';
import { NUM_KEYWORDS } from '../App';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const openai = new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true });


const OpenAIApi = {
    extractQueryKeywords: async (query) => {
        const prompt = `
            [SYSTEM]: Your model is tasked with two primary goals: Keyword Translation, and Keyword Addition.

            1. Keyword Translation:
                - Take a natural language query and return only the significant fashion keywords.
                - For example, if the query is “I want to buy a black dress for a party”, the system should return “black”, “dress”, “party” as the keywords.
                - If the original query is okay by itself as a search keyword, give the original query as the response.

            2. Keyword Addition:
                - Using the user query, add similar keywords.
                - For abstract queries, capture the essence and style realistically.
                - For instance, if the user query is “goth”, then the system can return keywords like “black”, “lace”.
                - Return a maximum of ${NUM_KEYWORDS} additional keywords.

            Output Format:
                - Response format: JSON
                - The keys should be Keywords, Recommendations.
                - The value of Keywords should be an array of strings.
                - The value of Recommendations should be an array of strings.

            Example JSON Response:
            {
                "Keywords": ["black", "dress", "party"],
                "Recommendations": ["elegant", "style", "occasion"]
            }
            `;

        try {
            const completion = await openai.chat.completions.create({
                model: 'gpt-4-1106-preview',
                response_format: {type: "json_object"},
                messages: [
                    {role: 'system', content: prompt},
                    {role: 'user', content: query}
                ],
            });
            const content = completion.choices[0].message.content;

            if (content !== null) {
                try {
                    const result = JSON.parse(content);
                    console.log(result);
                    return result;
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            } else {
                console.error('Error: Content is null');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    },
    extractImageKeywords: async (items, prompt) => {
        const messages = [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                ],
            },
            // Map the ids to create message objects with encoded image strings
            ...items.map(item => ({
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            "url": `https://fashionalign.s3.ap-northeast-2.amazonaws.com/${item.id}.jpg`
                        },
                    },
                ],
            })),
        ];

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4-vision-preview",
                messages: messages,
                max_tokens: 100,
            });

            try {
                console.log(completion.choices);
                return completion.choices[0].message.content;
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return null; // or handle the error in an appropriate way
            }
        } catch (error) {
            console.error('Error:', error);
        }
    },
    extractSingleImageKeywords: async (base64Image, prompt, rawImage) => {
        const messages = {
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: base64Image
                            }
                        }
                    ]
                }
            ],
        };

        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4-vision-preview",
                messages: messages.messages,
                max_tokens: 100,
            });

            try {
                return completion.choices[0].message.content;
            } catch (error) {
                console.error('Error parsing JSON:', error);
                return null;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
};

export default OpenAIApi;

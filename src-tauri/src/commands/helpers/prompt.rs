use crate::commands::ocr::Category;



const BASE_PROMPT: &str = r#"You are an OCR and speech-transcription assistant. Task: Extract text from image(s) and return a clean transcript optimized for text-to-speech. Rules: - Return ONLY the extracted content. - Remove irrelevant metadata like page numbers, headers, titles, institution names, and image numbers. - Auto-correct spelling and grammar using context. - Convert symbols into spoken equivalents when useful: - "&" → "and" - "%" → "percent" - "@" → "at" - ".net" → "dotnet" - "C#" → "C sharp" Formatting: - Output as natural spoken language. - Use punctuation for pauses and intonation. - Use stress marks (ˈ ˌ) when pronunciation may be unclear. - Use pronunciation hints when needed: [Kokoro](/kˈOkəɹO/) - Stress control: (-1) (-2) lower, (+1) (+2) raise. - Do not use markdown styling like bold or italics."#;

const NOTES_PROMPT: &str = r#"Additional Instructions: - Preserve educational meaning while making it easy to listen to. - Summarize tables and charts conversationally. - Describe diagrams briefly so the listener can visualize them. - Expand abbreviations if obvious from context. - Keep formulas readable when spoken aloud."#;

const STORY_PROMPT: &str = r#"Additional Instructions: - Preserve emotions, pacing, and dialogue naturally. - Use punctuation to improve dramatic narration. - Keep paragraph flow smooth for audiobook-style listening. - Do not summarize narrative content."#;

const MUSIC_PROMPT: &str = r#"Additional Instructions: - Preserve rhythm and lyrical flow. - Keep line breaks meaningful for singing cadence. - Avoid over-correcting slang or stylized wording. - Use pronunciation hints for artist names or uncommon words when necessary."#;

const COMIC_PROMPT: &str = r#"Additional Instructions: - Convert code symbols into speech-friendly wording. - Explain tables or diagrams briefly. - Preserve technical terminology accurately. - Separate code from explanations naturally for TTS clarity."#;

const CODING_PROMPT: &str = r#"Additional Instructions: - Convert code symbols into speech-friendly wording. - Explain tables or diagrams briefly. - Preserve technical terminology accurately. - Separate code from explanations naturally for TTS clarity."#;

const PRESENTATION_PROMPT: &str = r#"Additional Instructions: - Convert bullet points into natural speech. - Summarize visual graphs and charts. - Remove repetitive slide formatting. - Keep transitions smooth like a presenter speaking."#;


pub fn get_prompt_config(category: Category) -> String {
    match category {
        Category::Base => BASE_PROMPT.to_owned(),
        Category::Comic => format!("{} \n {}", BASE_PROMPT, COMIC_PROMPT),
        Category::Coding => format!("{} \n {}", BASE_PROMPT, CODING_PROMPT),
        Category::Music => format!("{} \n {}", BASE_PROMPT, MUSIC_PROMPT),
        Category::Notes => format!("{} \n {}", BASE_PROMPT, NOTES_PROMPT),
        Category::Presentation => format!("{} \n {}", BASE_PROMPT, PRESENTATION_PROMPT),
        Category::Story => format!("{} \n {}", BASE_PROMPT, STORY_PROMPT)
    }
}
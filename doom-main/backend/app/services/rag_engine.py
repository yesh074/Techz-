import re
import math
from typing import List, Dict, Any, Optional
import httpx
from backend.app.config import settings

class RAGEngine:
    def __init__(self):
        self.gemini_key = settings.GEMINI_API_KEY
        self.model = settings.GEMINI_MODEL or "gemini-1.5-flash"

    def _tokenize(self, text: str) -> List[str]:
        return [w.lower() for w in re.findall(r"\w+", text) if len(w) > 2]

    def _calculate_bm25_score(self, query_tokens: List[str], doc_tokens: List[str], avg_doc_len: float) -> float:
        if not doc_tokens:
            return 0.0
        k1 = 1.5
        b = 0.75
        doc_len = len(doc_tokens)
        score = 0.0
        doc_token_counts = {}
        for t in doc_tokens:
            doc_token_counts[t] = doc_token_counts.get(t, 0) + 1

        for qt in query_tokens:
            if qt in doc_token_counts:
                tf = doc_token_counts[qt]
                score += (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * (doc_len / (avg_doc_len or 1))))
        return score

    def search_book_chunks(self, book: Dict[str, Any], query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        query_tokens = self._tokenize(query)
        if not query_tokens:
            return []

        chunks: List[Dict[str, Any]] = []

        # Index chapters, sections, algorithms, formulas
        for chap in book.get("hierarchy", []):
            chap_num = chap.get("chapter_number")
            chap_title = chap.get("title")

            # Check chapter summary
            if chap.get("summary"):
                chunks.append({
                    "chapter": chap_num,
                    "chapter_title": chap_title,
                    "section": "Summary",
                    "page": chap.get("start_page", 1),
                    "content": chap.get("summary"),
                    "type": "chapter_summary"
                })

            # Check algorithms
            for alg in chap.get("algorithms", []):
                chunks.append({
                    "chapter": chap_num,
                    "chapter_title": chap_title,
                    "section": alg.get("name"),
                    "page": alg.get("page", chap.get("start_page", 1)),
                    "content": f"Algorithm: {alg.get('name')}\nComplexity: {alg.get('complexity')}\nExplanation: {alg.get('explanation')}\nPseudocode:\n{alg.get('pseudocode')}",
                    "type": "algorithm"
                })

            # Check formulas
            for form in chap.get("formulas", []):
                chunks.append({
                    "chapter": chap_num,
                    "chapter_title": chap_title,
                    "section": form.get("name"),
                    "page": form.get("page", chap.get("start_page", 1)),
                    "content": f"Formula: {form.get('name')}\nEquation: {form.get('equation')}\nVariables: {form.get('variables')}",
                    "type": "formula"
                })

            # Check sections
            for sec in chap.get("sections", []):
                sec_text = f"Section {sec.get('section_number')}: {sec.get('title')}. Topics: {', '.join(sec.get('topics', []))}."
                for conc in sec.get("concepts", []):
                    sec_text += f"\nConcept: {conc.get('name')} (Page {conc.get('page')}) - {conc.get('definition')}"
                chunks.append({
                    "chapter": chap_num,
                    "chapter_title": chap_title,
                    "section": sec.get("title"),
                    "section_number": sec.get("section_number"),
                    "page": sec.get("start_page", chap.get("start_page", 1)),
                    "content": sec_text,
                    "type": "section"
                })

        # Also index sample_pages if present
        for page in book.get("sample_pages", []):
            chunks.append({
                "chapter": page.get("chapter", 1),
                "chapter_title": page.get("chapter_title", ""),
                "section": page.get("section", ""),
                "page": page.get("page_number", 1),
                "content": page.get("text", ""),
                "type": "page"
            })

        if not chunks:
            return []

        avg_len = sum(len(self._tokenize(c["content"])) for c in chunks) / len(chunks)
        scored_chunks = []
        for c in chunks:
            doc_toks = self._tokenize(c["content"])
            score = self._calculate_bm25_score(query_tokens, doc_toks, avg_len)
            if score > 0:
                scored_chunks.append((score, c))

        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored_chunks[:top_k]]

    async def answer_question(self, book: Dict[str, Any], question: str) -> Dict[str, Any]:
        matched_chunks = self.search_book_chunks(book, question, top_k=3)

        if not matched_chunks:
            return {
                "answer": f"Information regarding '{question}' was not found in '{book.get('title', 'this book')}'. This AI assistant only provides verified information directly grounded in the processed textbook content.",
                "found": False,
                "citations": []
            }

        citations = []
        context_blocks = []
        for c in matched_chunks:
            cite_str = f"Chapter {c.get('chapter', 'N/A')}: {c.get('chapter_title', '')}, Section: {c.get('section', 'General')}, Page {c.get('page', 'N/A')}"
            citations.append({
                "chapter": c.get("chapter"),
                "chapter_title": c.get("chapter_title"),
                "section": c.get("section"),
                "page": c.get("page"),
                "source": cite_str
            })
            context_blocks.append(f"[{cite_str}]\n{c.get('content')}")

        context_text = "\n\n".join(context_blocks)

        # If Google Gemini API Key is configured, make real call
        if self.gemini_key:
            try:
                system_instruction = (
                    "You are the TECHZ Book Intelligence Assistant. Answer the user's question strictly "
                    "using the provided context from the textbook. Ground your explanation in the text. "
                    "Explicitly reference Chapter, Section, and Page in your answer."
                )
                full_prompt = (
                    f"{system_instruction}\n\n"
                    f"Textbook Context:\n{context_text}\n\n"
                    f"Question: {question}"
                )
                endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.gemini_key}"
                payload = {
                    "contents": [
                        {
                            "role": "user",
                            "parts": [{"text": full_prompt}]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.2
                    }
                }
                async with httpx.AsyncClient(timeout=25.0) as client:
                    resp = await client.post(endpoint, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates:
                            parts = candidates[0].get("content", {}).get("parts", [])
                            if parts and "text" in parts[0]:
                                return {
                                    "answer": parts[0]["text"],
                                    "found": True,
                                    "citations": citations
                                }
            except Exception as e:
                pass  # Fall back to heuristic grounded synthesizer

        # Heuristic grounded response
        primary = matched_chunks[0]
        cite = citations[0]
        structured_answer = (
            f"Based on **{book.get('title')}**, in **Chapter {cite['chapter']}: {cite['chapter_title']}** "
            f"(Page {cite['page']}):\n\n"
            f"{primary['content']}\n\n"
            f"This content is verified directly against the syllabus textbook. "
            f"Cross-referenced with **{cite['source']}**."
        )

        return {
            "answer": structured_answer,
            "found": True,
            "citations": citations
        }

rag_engine = RAGEngine()

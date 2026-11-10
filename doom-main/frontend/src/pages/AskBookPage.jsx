import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  MessageSquare, Send, BookOpen, Sparkles, CheckCircle,
  FileText, CornerDownRight, Quote, Info, Search
} from 'lucide-react'
import { booksApi, askBookApi } from '../services/api'
import toast from 'react-hot-toast'

export default function AskBookPage() {
  const [searchParams] = useSearchParams()
  const initialBookId = searchParams.get('id') || ''

  const [books, setBooks] = useState([])
  const [selectedBookId, setSelectedBookId] = useState(initialBookId)
  const [selectedBook, setSelectedBook] = useState(null)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)

  const sampleQuestions = [
    'Explain the core concept of Dynamic Programming and when to use memoization.',
    'What is the difference between Dijkstra and Bellman-Ford algorithms?',
    'What are the key asymptotic notations (Big-O, Big-Omega, Big-Theta)?',
    'Explain how B-Trees maintain balanced search performance.'
  ]

  useEffect(() => {
    booksApi.list().then(res => {
      const list = res.data || []
      setBooks(list)
      if (!selectedBookId && list.length > 0) {
        setSelectedBookId(list[0].book_id)
        setSelectedBook(list[0])
      } else if (selectedBookId) {
        const found = list.find(b => b.book_id === selectedBookId)
        if (found) setSelectedBook(found)
      }
    }).catch(() => {})
  }, [selectedBookId])

  function handleSelectBook(id) {
    setSelectedBookId(id)
    const found = books.find(b => b.book_id === id)
    setSelectedBook(found)
    setMessages([])
  }

  async function handleAsk(qText) {
    const q = (qText || question).trim()
    if (!q || !selectedBookId) return

    const userMsg = { role: 'user', content: q, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setQuestion('')
    setLoading(true)

    try {
      const res = await askBookApi.ask(selectedBookId, q)
      const data = res.data
      const aiMsg = {
        role: 'assistant',
        content: data.answer,
        citations: data.citations || [],
        found: data.found,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (err) {
      toast.error('Failed to get answer from book assistant.')
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error searching this textbook context. Please try again.',
          citations: [],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles size={16} />
            <span>Grounded Semantic RAG Assistant</span>
          </div>
          <h1 className="page-title text-2xl">Ask the Textbook</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly grounded in your institution's prescribed curriculum with Chapter & Page citations.
          </p>
        </div>

        {/* Book Selector */}
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-slate-400" />
          <select
            value={selectedBookId}
            onChange={(e) => handleSelectBook(e.target.value)}
            className="input text-xs font-semibold py-2 px-3 min-w-[220px]"
          >
            {books.map(b => (
              <option key={b.book_id} value={b.book_id}>
                {b.title} ({b.course_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Book Context Pill */}
      {selectedBook && (
        <div className="flex items-center justify-between bg-primary-50 border border-primary-100 px-4 py-2.5 rounded-xl text-xs">
          <div className="flex items-center gap-2">
            <Quote size={14} className="text-primary-600" />
            <span className="text-slate-600">Active Reference:</span>
            <span className="font-semibold text-primary-900">{selectedBook.title}</span>
            <span className="text-slate-400">·</span>
            <span className="text-slate-500">Dept of {selectedBook.department} ({selectedBook.semester})</span>
          </div>
          <span className="text-[11px] font-mono text-primary-700 bg-white px-2 py-0.5 rounded border border-primary-200">
            {selectedBook.current_stock} in stock
          </span>
        </div>
      )}

      {/* Chat Messages Container */}
      <div className="card min-h-[420px] flex flex-col justify-between overflow-hidden shadow-card">
        <div className="p-6 space-y-6 overflow-y-auto max-h-[500px]">
          {messages.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center mx-auto">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">Ask any question about this textbook</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Answers are generated strictly using the indexed pages and knowledge tree with exact citations.
                </p>
              </div>

              {/* Sample Question Chips */}
              <div className="pt-4 max-w-lg mx-auto">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Sample Inquiries
                </div>
                <div className="flex flex-col gap-2">
                  {sampleQuestions.map((sq, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAsk(sq)}
                      className="text-left text-xs bg-slate-50 hover:bg-primary-50 hover:text-primary-700 text-slate-700 p-2.5 rounded-lg border border-slate-200 transition-colors flex items-center justify-between"
                    >
                      <span>{sq}</span>
                      <CornerDownRight size={14} className="text-slate-400" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary-600 text-white rounded-br-none'
                      : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-line">{m.content}</div>

                  {/* Citations block for AI response */}
                  {m.citations && m.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                        <CheckCircle size={12} className="text-emerald-600" />
                        Grounded Textbook Citations
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.citations.map((c, cIdx) => (
                          <span
                            key={cIdx}
                            className="text-[11px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded shadow-2xs font-medium"
                          >
                            Chapter {c.chapter} (Page {c.page}) — {c.section}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
              </div>
            ))
          )}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3.5 rounded-xl max-w-sm">
              <Sparkles className="animate-spin text-primary-600" size={16} />
              <span>Scanning textbook knowledge graph & generating citations...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleAsk()
          }}
          className="p-4 border-t border-slate-100 bg-white flex items-center gap-3"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question (e.g. 'How does QuickSort choose its pivot?')..."
            className="input flex-1 py-2.5 text-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="btn-primary py-2.5 px-5 disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            <Send size={16} />
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  )
}

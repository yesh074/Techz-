import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Brain, BookOpen, Layers, Code, Hash, FileText, CheckCircle2,
  HelpCircle, Sparkles, MessageSquare, ArrowLeft, Search, BookmarkCheck
} from 'lucide-react'
import { booksApi, intelligenceApi, summaryApi } from '../services/api'
import toast from 'react-hot-toast'

export default function BookIntelligencePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const bookIdParam = searchParams.get('id')

  const [books, setBooks] = useState([])
  const [selectedBookId, setSelectedBookId] = useState(bookIdParam || '')
  const [book, setBook] = useState(null)
  const [intel, setIntel] = useState(null)
  const [activeTab, setActiveTab] = useState('overview') // overview, chapters, algorithms, formulas, exam_notes, flashcards, mcqs
  const [loading, setLoading] = useState(false)
  const [examNotes, setExamNotes] = useState(null)
  const [flashcards, setFlashcards] = useState(null)
  const [mcqs, setMCQs] = useState(null)
  const [flashcardIdx, setFlashcardIdx] = useState(0)
  const [showCardBack, setShowCardBack] = useState(false)
  const [mcqAnswers, setMcqAnswers] = useState({})

  useEffect(() => {
    booksApi.list().then(res => {
      const bList = res.data || []
      setBooks(bList)
      if (!selectedBookId && bList.length > 0) {
        setSelectedBookId(bList[0].book_id)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedBookId) return
    setLoading(true)
    Promise.all([
      booksApi.get(selectedBookId),
      intelligenceApi.get(selectedBookId).catch(() => ({ data: null }))
    ]).then(([bookRes, intelRes]) => {
      setBook(bookRes.data)
      setIntel(intelRes.data)
      setLoading(false)
    }).catch(err => {
      setLoading(false)
      toast.error('Failed to load book intelligence data')
    })
  }, [selectedBookId])

  function loadExamNotes() {
    if (examNotes) return
    toast.loading('Generating exam revision notes...', { id: 'exam_notes' })
    summaryApi.getExamNotes(selectedBookId).then(res => {
      setExamNotes(res.data)
      toast.success('Exam notes loaded!', { id: 'exam_notes' })
    }).catch(() => toast.error('Could not load notes', { id: 'exam_notes' }))
  }

  function loadFlashcards() {
    if (flashcards) return
    summaryApi.getFlashcards(selectedBookId).then(res => {
      setFlashcards(res.data.flashcards || [])
    }).catch(() => toast.error('Could not load flashcards'))
  }

  function loadMCQs() {
    if (mcqs) return
    summaryApi.getMCQs(selectedBookId).then(res => {
      setMCQs(res.data.mcqs || [])
    }).catch(() => toast.error('Could not load MCQs'))
  }

  const hierarchy = intel?.hierarchy || book?.hierarchy || []
  const algorithms = intel?.algorithms || book?.algorithms || []
  const formulas = intel?.formulas || book?.formulas || []

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-slate-500 text-sm mb-1">
            <Brain className="text-primary-600" size={18} />
            <span>AI Knowledge Extraction & Book Intelligence</span>
          </div>
          <h1 className="page-title text-2xl">
            {book?.title || 'Book Intelligence Suite'}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Structured knowledge graph, concepts, algorithms, and automated study aids.
          </p>
        </div>

        {/* Book Selector Dropdown */}
        <div className="flex items-center gap-3">
          <select
            value={selectedBookId}
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="input text-sm font-medium py-2 px-3 min-w-[240px]"
          >
            {books.map(b => (
              <option key={b.book_id} value={b.book_id}>
                {b.title} ({b.course_code || b.department})
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate(`/ask-book?id=${selectedBookId}`)}
            className="btn-primary flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            <MessageSquare size={16} />
            <span>Ask This Book</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Hierarchy & Concepts', icon: Layers },
          { id: 'algorithms', label: `Algorithms (${algorithms.length})`, icon: Code },
          { id: 'formulas', label: `Formulas (${formulas.length})`, icon: Hash },
          { id: 'exam_notes', label: 'Exam High-Yield Notes', icon: FileText, onSelect: loadExamNotes },
          { id: 'flashcards', label: 'Flashcards', icon: BookmarkCheck, onSelect: loadFlashcards },
          { id: 'mcqs', label: 'Practice Quiz', icon: HelpCircle, onSelect: loadMCQs },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id)
                if (tab.onSelect) tab.onSelect()
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {loading && (
        <div className="card p-12 text-center text-slate-400">
          <Sparkles className="animate-spin mx-auto mb-2 text-primary-500" size={24} />
          Loading parsed intelligence structure...
        </div>
      )}

      {/* TAB 1: Overview & Chapter Hierarchy */}
      {!loading && activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <Layers size={18} className="text-primary-600" />
              Chapter Breakdown & Concepts
            </h2>
            {hierarchy.map((chap, idx) => (
              <div key={idx} className="card p-5 hover:border-primary-200 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
                      Chapter {chap.chapter_number}
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 mt-0.5">
                      {chap.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    Page {chap.start_page} - {chap.end_page || chap.start_page + 15}
                  </span>
                </div>

                {chap.summary && (
                  <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    {chap.summary}
                  </p>
                )}

                {/* Sections */}
                {chap.sections && chap.sections.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Key Sections & Topics
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {chap.sections.map((sec, sIdx) => (
                        <div key={sIdx} className="p-2.5 rounded-lg border border-slate-100 bg-white">
                          <div className="text-xs font-semibold text-slate-800">
                            §{sec.section_number} {sec.title}
                          </div>
                          {sec.topics && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {sec.topics.map((t, tIdx) => (
                                <span key={tIdx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Book Metadata Sidebar */}
          <div className="space-y-6">
            <div className="card p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Syllabus Metadata</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Course Code</span>
                  <span className="font-semibold text-slate-800">{book?.course_code || 'CS301'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Department</span>
                  <span className="font-semibold text-slate-800">{book?.department || 'Computer Science'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Semester</span>
                  <span className="font-semibold text-slate-800">{book?.semester || 'Semester V'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Current Stock</span>
                  <span className="font-semibold text-slate-800">{book?.current_stock} copies</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Predicted Demand</span>
                  <span className="font-semibold text-primary-700">{book?.predicted_demand} copies</span>
                </div>
              </div>
            </div>

            <div className="card p-5 bg-gradient-to-br from-primary-50 to-indigo-50 border-primary-100">
              <div className="flex items-center gap-2 text-primary-800 font-semibold text-sm mb-1">
                <Sparkles size={16} />
                <span>Autonomous Synthesis</span>
              </div>
              <p className="text-xs text-primary-700 leading-relaxed mb-3">
                This textbook has been autonomously tokenized and indexed using BM25 semantic chunking for contextual question answering.
              </p>
              <button
                onClick={() => navigate(`/ask-book?id=${selectedBookId}`)}
                className="w-full btn-primary text-xs justify-center py-2"
              >
                Launch Contextual Q&A
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Algorithms */}
      {!loading && activeTab === 'algorithms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {algorithms.length === 0 ? (
            <div className="card p-8 text-center text-slate-400 col-span-2">
              No specific algorithms extracted for this textbook.
            </div>
          ) : (
            algorithms.map((alg, idx) => (
              <div key={idx} className="card p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-base font-bold text-slate-900">{alg.name}</h3>
                  <span className="text-xs font-mono bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded">
                    {alg.complexity || 'O(N)'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {alg.explanation}
                </p>
                {alg.pseudocode && (
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                    {alg.pseudocode}
                  </pre>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Formulas */}
      {!loading && activeTab === 'formulas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formulas.length === 0 ? (
            <div className="card p-8 text-center text-slate-400 col-span-2">
              No mathematical formulas parsed for this textbook.
            </div>
          ) : (
            formulas.map((form, idx) => (
              <div key={idx} className="card p-5 space-y-2">
                <h3 className="text-sm font-bold text-slate-900">{form.name}</h3>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg font-mono text-sm text-primary-800 font-bold">
                  {form.equation}
                </div>
                {form.variables && (
                  <div className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Variables: </span>
                    {form.variables}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: Exam Notes */}
      {!loading && activeTab === 'exam_notes' && (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-primary-600" />
              High-Yield Exam Cram Notes
            </h2>
            <button
              onClick={loadExamNotes}
              className="text-xs text-primary-600 hover:underline font-medium"
            >
              Regenerate Notes
            </button>
          </div>
          {examNotes ? (
            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-6 rounded-xl border border-slate-200">
              {examNotes.notes || JSON.stringify(examNotes, null, 2)}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              Click the button above or wait while notes are generated.
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Flashcards */}
      {!loading && activeTab === 'flashcards' && (
        <div className="max-w-xl mx-auto space-y-4">
          {flashcards && flashcards.length > 0 ? (
            <div>
              <div className="flex justify-between text-xs text-slate-400 font-medium mb-2">
                <span>Card {flashcardIdx + 1} of {flashcards.length}</span>
                <span>Click card to flip</span>
              </div>
              <div
                onClick={() => setShowCardBack(!showCardBack)}
                className="card min-h-[220px] p-8 flex flex-col items-center justify-center text-center cursor-pointer select-none hover:shadow-md transition-shadow bg-gradient-to-br from-white to-slate-50 border-2 border-primary-200"
              >
                <div className="text-xs uppercase tracking-widest text-primary-600 font-bold mb-3">
                  {showCardBack ? 'Answer' : 'Question / Concept'}
                </div>
                <div className="text-base font-semibold text-slate-800">
                  {showCardBack
                    ? flashcards[flashcardIdx]?.back || flashcards[flashcardIdx]?.answer
                    : flashcards[flashcardIdx]?.front || flashcards[flashcardIdx]?.question}
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <button
                  disabled={flashcardIdx === 0}
                  onClick={() => {
                    setFlashcardIdx(i => Math.max(0, i - 1))
                    setShowCardBack(false)
                  }}
                  className="btn-secondary text-xs px-4"
                >
                  Previous
                </button>
                <button
                  onClick={() => setShowCardBack(!showCardBack)}
                  className="text-xs text-primary-600 font-medium hover:underline"
                >
                  Flip Card
                </button>
                <button
                  disabled={flashcardIdx === flashcards.length - 1}
                  onClick={() => {
                    setFlashcardIdx(i => Math.min(flashcards.length - 1, i + 1))
                    setShowCardBack(false)
                  }}
                  className="btn-primary text-xs px-4"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            <div className="card p-12 text-center text-slate-400">
              Loading flashcards deck...
            </div>
          )}
        </div>
      )}

      {/* TAB 6: MCQs */}
      {!loading && activeTab === 'mcqs' && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {mcqs && mcqs.length > 0 ? (
            mcqs.map((m, qIdx) => (
              <div key={qIdx} className="card p-5 space-y-3">
                <div className="text-sm font-semibold text-slate-900">
                  {qIdx + 1}. {m.question}
                </div>
                <div className="space-y-2">
                  {m.options?.map((opt, oIdx) => {
                    const isSelected = mcqAnswers[qIdx] === oIdx
                    const isCorrect = m.correct_index === oIdx
                    const hasAnswered = mcqAnswers[qIdx] !== undefined

                    let btnClass = 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    if (hasAnswered) {
                      if (isCorrect) btnClass = 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                      else if (isSelected && !isCorrect) btnClass = 'border-red-400 bg-red-50 text-red-700'
                    }

                    return (
                      <button
                        key={oIdx}
                        disabled={hasAnswered}
                        onClick={() => setMcqAnswers(prev => ({ ...prev, [qIdx]: oIdx }))}
                        className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center justify-between ${btnClass}`}
                      >
                        <span>{opt}</span>
                        {hasAnswered && isCorrect && <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />}
                      </button>
                    )
                  })}
                </div>
                {mcqAnswers[qIdx] !== undefined && m.explanation && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <span className="font-semibold text-slate-700">Explanation: </span>
                    {m.explanation}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="card p-12 text-center text-slate-400">
              Loading practice questions...
            </div>
          )}
        </div>
      )}
    </div>
  )
}

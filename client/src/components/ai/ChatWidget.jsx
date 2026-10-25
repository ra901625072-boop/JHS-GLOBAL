import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, Link } from 'react-router-dom';
import {
  Sparkles,
  X,
  Send,
  Loader2,
  ChevronRight,
  ShieldCheck,
  Bot,
  ExternalLink,
  Plus,
  Check,
  RotateCcw,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  FileText,
  Building2,
  WifiOff,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { sendAiChatMessage, submitAiChatFeedback } from '../../features/ai/api';
import { useQuoteBasket } from '../../features/quoteBasket/context';
import WhatsAppIcon from '../common/WhatsAppIcon';

export { openAiAssistant } from './chatEvents';

const STORAGE_KEY = 'jhs_global_buyer_chat_v3';

const INITIAL_WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    'Welcome to the JHS Global B2B Export Desk Assistant. I am grounded in our verified export catalogue and company records. Ask me about technical specifications, active assays, packaging formats, certifications, and quotation workflows.',
  sources: [],
  source_chips: [
    { label: 'Export Catalogue', type: 'product' },
    { label: 'Verified Registrations', type: 'company' },
  ],
};

const renderInlineMarkdown = (text) => {
  if (!text) return null;
  // Clean any stray internal fact markers
  const clean = text.replace(/\[FACT-ID:\s*[^\]]+\]/gi, '').trim();
  // Split by bold markdown **text**
  const parts = clean.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-neutral-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const FormattedMessage = ({ content }) => {
  if (!content) return null;

  // Clean any stray fact citations
  const sanitized = content
    .replace(/\s*\[FACT-ID:\s*[^\]]+\]/gi, '')
    .replace(/\[FACT-ID:[^\]]*\]/gi, '')
    .trim();

  // Split into paragraphs / sections by double newlines
  const blocks = sanitized.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return (
    <div className="space-y-2.5 text-neutral-800 text-xs">
      {blocks.map((block, bIdx) => {
        const rawLines = block.split('\n').map((l) => l.trim()).filter(Boolean);

        return (
          <div key={bIdx} className="space-y-1">
            {rawLines.map((line, lIdx) => {
              // Bullet item (- or * or •)
              if (/^[-*•]\s+/.test(line)) {
                const itemText = line.replace(/^[-*•]\s+/, '');
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-0.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-600 shrink-0 mt-1.5" />
                    <span className="flex-1 text-[11.5px] leading-relaxed text-neutral-800">
                      {renderInlineMarkdown(itemText)}
                    </span>
                  </div>
                );
              }

              // Heading line (e.g., **Heading:** or ### Heading)
              const isHeaderLine =
                (/^###\s+/.test(line)) ||
                (line.startsWith('**') && (line.endsWith('**') || line.endsWith('**:') || line.endsWith('** :')));

              if (isHeaderLine) {
                const headerText = line.replace(/^###\s+/, '');
                return (
                  <div
                    key={lIdx}
                    className="font-bold text-neutral-900 text-xs tracking-tight pt-1 first:pt-0"
                  >
                    {renderInlineMarkdown(headerText)}
                  </div>
                );
              }

              // Standard prose line
              return (
                <p key={lIdx} className="leading-relaxed text-[11.5px]">
                  {renderInlineMarkdown(line)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

const getPagePrompts = (pathname) => {
  if (pathname.startsWith('/products/')) {
    return [
      'What are the typical specifications?',
      'What packaging formats are available?',
      'How do I request a formal quote?',
      'Can you supply custom forms or mesh sizes?',
    ];
  }
  if (pathname === '/about-us' || pathname === '/about') {
    return [
      'What export products do you specialize in?',
      'Which government certifications do you hold?',
      'Where is your export facility located?',
      'What is your quote turnaround promise?',
    ];
  }
  if (pathname.includes('/category') || pathname === '/catalogue') {
    return [
      'Which personal care raw materials do you supply?',
      'What are your minimum order quantities (MOQ)?',
      'How do I request evaluation samples?',
      'What export Incoterms do you support?',
    ];
  }
  return [
    'What products does JHS Global export?',
    'Which export licenses and registrations do you hold?',
    'How do I request a formal proforma quote?',
    '¿Cuáles son las especificaciones de exportación?',
  ];
};

export const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedProducts, setAddedProducts] = useState({});
  const [feedbackMap, setFeedbackMap] = useState({});
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const location = useLocation();
  const { addItem, setIsDrawerOpen } = useQuoteBasket();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const dialogRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const whatsappNumber = (import.meta.env.VITE_WHATSAPP_NUMBER || '+917202907720').replace(/[^0-9]/g, '');

  const pagePrompts = useMemo(() => getPagePrompts(location.pathname), [location.pathname]);

  const [messages, setMessages] = useState(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [INITIAL_WELCOME_MESSAGE];
    } catch {
      return [INITIAL_WELCOME_MESSAGE];
    }
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persist messages in session
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // quota exception safety
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);

      // On mobile viewports (<640px), lock background body scroll and stop Lenis smooth scroll
      if (typeof window !== 'undefined' && window.innerWidth < 640) {
        document.body.style.overflow = 'hidden';
        if (window.__lenis) {
          window.__lenis.stop();
        }
      }
    } else {
      document.body.style.overflow = '';
      if (window.__lenis) {
        window.__lenis.start();
      }
    }

    return () => {
      document.body.style.overflow = '';
      if (window.__lenis) {
        window.__lenis.start();
      }
    };
  }, [messages, isOpen]);

  // Native wheel listener to isolate mouse wheel events strictly inside the assistant dialog
  useEffect(() => {
    const dialogEl = dialogRef.current;
    if (!dialogEl || !isOpen) return;

    const handleDialogWheel = (e) => {
      const messagesEl = messagesContainerRef.current;
      if (!messagesEl) {
        e.preventDefault();
        return;
      }

      // Check if event target is inside a scrollable container (messages or prompts)
      const scrollableChild = e.target.closest('[data-scroll-container]');

      if (scrollableChild) {
        const { scrollTop, scrollHeight, clientHeight } = scrollableChild;
        const isAtTop = scrollTop <= 0 && e.deltaY < 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1 && e.deltaY > 0;

        if (isAtTop || isAtBottom) {
          // Prevent scroll chaining to the background body/window
          e.preventDefault();
        }
      } else {
        // Cursor is on header, footer, or padding of assistant
        // Forward scroll delta to messages container and prevent background scroll
        e.preventDefault();
        messagesEl.scrollTop += e.deltaY;
      }
    };

    dialogEl.addEventListener('wheel', handleDialogWheel, { passive: false });
    return () => {
      dialogEl.removeEventListener('wheel', handleDialogWheel);
    };
  }, [isOpen]);

  const handleClearHistory = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // safety
    }
  };

  const handleAddToQuote = (src) => {
    addItem(
      {
        _id: src.id || src.slug,
        name: src.name,
        slug: src.slug,
        hsCode: src.hsCode,
      },
      1,
      'MT'
    );
    setAddedProducts((prev) => ({ ...prev, [src.slug || src.id]: true }));
    setTimeout(() => {
      setAddedProducts((prev) => ({ ...prev, [src.slug || src.id]: false }));
    }, 2500);
  };

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = { role: 'user', content: textToSend.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = newMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Extract current pageContext
      const isProductPage = location.pathname.startsWith('/products/');
      const pageSlug = isProductPage
        ? location.pathname.split('/products/')[1]?.split('/')[0]?.split('?')[0]
        : null;

      const pageContext = {
        pathname: location.pathname,
        type: isProductPage ? 'product' : 'page',
        slug: pageSlug || null,
      };

      const res = await sendAiChatMessage({
        message: textToSend.trim(),
        history: historyForApi,
        pageContext,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            res.answer ||
            res.reply ||
            'Our commercial desk will provide tailored export documentation upon receipt of your formal RFQ.',
          intent: res.intent,
          used_fact_ids: res.used_fact_ids || [],
          confidence: res.confidence,
          needs_human: Boolean(res.needs_human),
          suggested_action: res.suggested_action || (res.hasBuyingIntent ? 'open_rfq' : 'none'),
          follow_up_question: res.follow_up_question || null,
          source_chips: res.source_chips || [],
          sources: res.sources || [],
          hasBuyingIntent: Boolean(res.hasBuyingIntent),
          auditLogId: res.auditLogId || null,
        },
      ]);
    } catch (err) {
      const isRateLimited =
        err?.status === 429 ||
        err?.code === 'RATE_LIMIT_EXCEEDED' ||
        err?.message?.toLowerCase().includes('limit') ||
        err?.message?.toLowerCase().includes('too many');

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: isRateLimited
            ? 'You have reached the temporary chat inquiry rate limit (20 questions / 10 minutes). To proceed immediately, please submit your requirement using our official RFQ form or connect with our export managers on WhatsApp.'
            : 'Our automated trade assistant is momentarily experiencing high server volume. Our full catalogue and formal RFQ quotation system remain fully operational.',
          sources: [],
          source_chips: [],
          isError: true,
          isRateLimited,
          needs_human: true,
          suggested_action: 'open_rfq',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Listen for global open-ai-chat events triggered from MobileMenuDrawer, Header, or other buttons
  useEffect(() => {
    const handleOpenAiChat = (e) => {
      setIsOpen(true);
      const query = e?.detail?.query;
      if (query && typeof query === 'string') {
        setTimeout(() => {
          handleSend(query);
        }, 350);
      }
    };
    window.addEventListener('open-ai-chat', handleOpenAiChat);
    return () => window.removeEventListener('open-ai-chat', handleOpenAiChat);
  }, []);

  const widgetContent = (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs z-40 sm:hidden transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Floating Trigger Button: Reliably placed above WhatsApp on mobile with clear AI badge */}
      <aside
        aria-label="Interactive AI Export Assistant"
        className="fixed bottom-[140px] sm:bottom-36 lg:bottom-24 right-4 sm:right-6 z-40 flex items-center group select-none"
      >
        <span className="hidden sm:inline-block mr-3 px-3 py-1.5 rounded-md bg-neutral-900/90 text-white text-xs font-medium shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Ask Export Desk AI
        </span>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close Trade Assistant' : 'Open Trade Assistant'}
          className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary-950 hover:bg-primary-900 active:scale-95 text-accent-400 border border-accent-500/40 flex items-center justify-center shadow-[0_10px_25px_-5px_rgba(14,59,46,0.5),0_4px_10px_-2px_rgba(0,0,0,0.2)] hover:shadow-xl hover:scale-105 transition-all duration-200 min-h-[44px] min-w-[44px] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-500"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-neutral-100" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot className="w-6 h-6 sm:w-7 sm:h-7 text-accent-400" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-500" />
              </span>
              {/* Distinct Mobile "AI" Indicator Badge */}
              <span className="absolute -bottom-2 -right-1 px-1.5 py-0.2 rounded-full bg-[#c59b27] text-neutral-950 font-black text-[8px] tracking-wider uppercase shadow-xs border border-primary-950">
                AI
              </span>
            </div>
          )}
        </button>
      </aside>

      {/* Chat Popover / Mobile Bottom Sheet Window */}
      {isOpen && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Export Intelligence Assistant"
          data-lenis-prevent
          className="fixed inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-40 sm:right-6 z-50 sm:w-[420px] max-h-[88dvh] sm:max-h-[600px] h-[85dvh] sm:h-[560px] bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-neutral-200 flex flex-col overflow-hidden overscroll-contain transform-gpu animate-popover-enter motion-reduce:animate-none"
        >
          {/* Mobile Drag Handle */}
          <div className="w-10 h-1 bg-neutral-300 rounded-full mx-auto my-2 sm:hidden shrink-0" />

          {/* Offline Warning Banner */}
          {!isOnline && (
            <div className="px-3 py-1.5 bg-amber-50 text-amber-900 text-[11px] flex items-center gap-1.5 border-b border-amber-200 shrink-0">
              <WifiOff className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span>You are currently offline. Responses may be delayed.</span>
            </div>
          )}

          {/* Header */}
          <div className="bg-primary-950 text-white px-4 py-3 flex items-center justify-between border-b border-primary-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-800 border border-accent-500/40 flex items-center justify-center text-accent-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  JHS Global Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Online & Grounded in DB" />
                </h2>
                <p className="text-[10px] text-neutral-400">
                  Verified Specs, MOQ & Export Terms
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-neutral-400 hover:text-white p-1 rounded transition-colors text-[10px] flex items-center gap-1"
                  title="Clear chat history"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div
            ref={messagesContainerRef}
            data-lenis-prevent
            data-scroll-container="messages"
            className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-3.5 bg-neutral-50/50 text-xs"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] sm:max-w-[88%] rounded-xl p-3.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary-900 text-white shadow-xs'
                      : msg.isError
                      ? 'bg-red-50 text-red-900 border border-red-200'
                      : 'bg-white text-neutral-800 border border-neutral-200/90 shadow-xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  ) : (
                    <FormattedMessage content={msg.content} />
                  )}

                  {/* Grounded Source Chips */}
                  {msg.source_chips && msg.source_chips.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-neutral-100">
                      {msg.source_chips
                        .filter((chip, cIdx, arr) => arr.findIndex((c) => c.label === chip.label) === cIdx)
                        .slice(0, 3)
                        .map((chip, cIdx) => (
                          <span
                            key={cIdx}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                              chip.type === 'product'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : chip.type === 'company'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-neutral-100 text-neutral-700 border-neutral-200'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
                            <span>From: {chip.label}</span>
                            {chip.slug && (
                              <Link
                                to={`/products/${chip.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="hover:underline ml-0.5"
                                title="View dossier"
                              >
                                <ExternalLink className="w-2.5 h-2.5 inline" />
                              </Link>
                            )}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Referenced Specification Cards (Strictly for Catalogue Products) */}
                  {(() => {
                    const productSources = (msg.sources || []).filter(
                      (src) =>
                        (src.type === 'product_spec' || src.type === 'product' || Boolean(src.slug)) &&
                        src.name &&
                        !src.type?.includes('company')
                    );
                    if (productSources.length === 0) return null;

                    return (
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 space-y-2">
                        <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">
                          Referenced Catalogue Items:
                        </span>
                        {productSources.slice(0, 3).map((src, sIdx) => (
                          <div
                            key={sIdx}
                            className="bg-neutral-50 border border-neutral-200/80 rounded-lg p-2 text-[11px] flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-neutral-900 block truncate">
                                {src.name}
                              </span>
                              <span className="text-neutral-500 text-[10px] block truncate">
                                {src.hsCode ? `HS: ${src.hsCode}` : ''}
                                {src.moq ? ` • MOQ: ${src.moq}` : ''}
                              </span>
                            </div>

                            {src.slug && (
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleAddToQuote(src)}
                                  className="px-2 py-1 rounded bg-primary-900 hover:bg-primary-950 text-accent-300 hover:text-accent-200 text-[10px] font-bold flex items-center gap-1 transition-colors shadow-xs min-h-[30px]"
                                  title="Add to Quote Basket"
                                >
                                  {addedProducts[src.slug || src.id] ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400">Added!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      <span>Add</span>
                                    </>
                                  )}
                                </button>
                                <Link
                                  to={`/products/${src.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="text-neutral-500 hover:text-primary-800 p-1 font-semibold flex items-center min-h-[30px] min-w-[30px] justify-center"
                                  title="View Technical Dossier"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Link>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {/* Interactive Follow-Up Clarifying Question */}
                  {msg.follow_up_question && (
                    <div className="mt-2.5 pt-2 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={() => handleSend(msg.follow_up_question)}
                        className="text-left text-[11px] text-primary-900 bg-primary-50/80 hover:bg-primary-100 border border-primary-200/70 rounded-md p-2 flex items-center gap-1.5 transition-colors group w-full"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-accent-700 shrink-0" />
                        <span className="flex-1 font-medium">{msg.follow_up_question}</span>
                        <ChevronRight className="w-3 h-3 text-neutral-400 group-hover:text-primary-900 shrink-0" />
                      </button>
                    </div>
                  )}

                  {/* Unverified / Needs Human Badge */}
                  {msg.needs_human && !msg.isError && (
                    <div className="mt-2 flex items-center gap-1 text-[10px] text-neutral-500">
                      <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
                      <span>Technical/commercial details to be confirmed by our trade desk.</span>
                    </div>
                  )}

                  {/* Contextual Suggested Action Buttons */}
                  {msg.suggested_action && msg.suggested_action !== 'none' && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-neutral-900 space-y-2">
                      <div className="flex items-start gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-accent-700 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[11px] font-bold text-neutral-900">
                            {msg.suggested_action === 'request_sample'
                              ? 'Request Evaluation Sample'
                              : msg.suggested_action === 'add_to_quote'
                              ? 'Add to Your Quote Basket'
                              : 'Request Binding Quotation'}
                          </p>
                          <p className="text-[10px] text-neutral-600 leading-normal mt-0.5">
                            Binding proforma invoices with full ocean freight are furnished within 48 business hours.
                          </p>
                        </div>
                      </div>
                      <div className="pt-0.5 flex flex-wrap items-center gap-2">
                        {msg.suggested_action === 'add_to_quote' && msg.sources?.[0]?.slug ? (
                          <button
                            type="button"
                            onClick={() => handleAddToQuote(msg.sources[0])}
                            className="px-2.5 py-1.5 rounded bg-primary-900 hover:bg-primary-950 text-accent-300 font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors min-h-[32px]"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add to Quote Basket</span>
                          </button>
                        ) : msg.suggested_action === 'request_sample' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              setIsDrawerOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded bg-amber-700 hover:bg-amber-800 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors min-h-[32px]"
                          >
                            <span>Request Sample Dossier</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsOpen(false);
                              setIsDrawerOpen(true);
                            }}
                            className="px-2.5 py-1.5 rounded bg-primary-900 hover:bg-primary-950 text-accent-300 font-bold text-[10px] flex items-center gap-1 shadow-xs transition-colors min-h-[32px]"
                          >
                            <span>Open Formal RFQ</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        )}

                        <a
                          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello JHS Global Export Desk, I would like to request a commercial quotation.')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] flex items-center gap-1.5 transition-colors min-h-[32px]"
                        >
                          <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                          <span>WhatsApp Desk</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Error Action Strip */}
                  {msg.isError && (
                    <div className="mt-2.5 pt-2 border-t border-red-200/60 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpen(false);
                          setIsDrawerOpen(true);
                        }}
                        className="px-2.5 py-1.5 rounded bg-primary-900 hover:bg-primary-950 text-white text-[10px] font-bold flex items-center gap-1 min-h-[32px]"
                      >
                        <span>Submit Formal RFQ</span>
                        <ChevronRight className="w-2.5 h-2.5" />
                      </button>
                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hello JHS Global Export Desk, I need assistance with a quotation.')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1.5 min-h-[32px]"
                      >
                        <WhatsAppIcon className="w-3.5 h-3.5 text-white" />
                        <span>WhatsApp Desk</span>
                      </a>
                    </div>
                  )}

                  {/* Thumbs-Up / Thumbs-Down Quality Feedback */}
                  {msg.role === 'assistant' && msg.auditLogId && (
                    <div className="mt-2.5 pt-1.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
                      <span>Was this answer accurate?</span>
                      <div className="flex items-center gap-1.5">
                        {feedbackMap[msg.auditLogId] ? (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Feedback saved
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await submitAiChatFeedback({ logId: msg.auditLogId, rating: 'helpful' });
                                  setFeedbackMap((prev) => ({ ...prev, [msg.auditLogId]: 'helpful' }));
                                } catch (e) {}
                              }}
                              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-emerald-600 transition-colors"
                              title="Helpful & accurate"
                            >
                              <ThumbsUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await submitAiChatFeedback({ logId: msg.auditLogId, rating: 'unhelpful' });
                                  setFeedbackMap((prev) => ({ ...prev, [msg.auditLogId]: 'unhelpful' }));
                                } catch (e) {}
                              }}
                              className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-red-600 transition-colors"
                              title="Inaccurate or incomplete"
                            >
                              <ThumbsDown className="w-3 h-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-neutral-500 bg-white border border-neutral-200 rounded-lg p-3 w-fit shadow-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent-600" />
                <span className="text-[11px]">Verifying catalogue facts & specs...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Page-Aware Suggested Inquiries (shown if only welcome message) */}
          {messages.length === 1 && (
            <div
              data-lenis-prevent
              data-scroll-container="prompts"
              className="p-3 bg-white border-t border-neutral-100 flex flex-wrap gap-1.5 shrink-0 max-h-[160px] overflow-y-auto overscroll-contain"
            >
              <span className="w-full text-[10px] uppercase tracking-wider text-neutral-400 font-semibold mb-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent-600" />
                Suggested for this page:
              </span>
              {pagePrompts.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="text-[11px] text-left px-2.5 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors border border-neutral-200/80 min-h-[28px]"
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Quick RFQ CTA Strip */}
          <div className="px-3 py-1.5 bg-neutral-100 border-t border-neutral-200 flex items-center justify-between text-[11px] shrink-0">
            <span className="text-neutral-600 flex items-center gap-1 font-medium text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>B2B Pricing: On Request Only</span>
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsDrawerOpen(true);
              }}
              className="text-primary-900 font-bold hover:text-accent-600 flex items-center gap-1 text-[11px] py-1"
            >
              <span>Open RFQ Form</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Input Box */}
          <div className="p-2.5 bg-white border-t border-neutral-200 flex items-center gap-2 shrink-0 pb-[max(10px,env(safe-area-inset-bottom))]">
            <input
              ref={inputRef}
              type="text"
              value={input}
              maxLength={500}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Ask about specs, packaging, HS codes, certificates..."
              className="flex-1 text-xs px-3 py-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary-800 focus:border-primary-800 disabled:opacity-50"
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-lg bg-primary-900 hover:bg-primary-950 disabled:bg-neutral-300 text-white transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Send query"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );

  return typeof document !== 'undefined' ? createPortal(widgetContent, document.body) : widgetContent;
};

export default ChatWidget;

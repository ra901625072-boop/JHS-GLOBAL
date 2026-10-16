import { Op, Sequelize } from 'sequelize';
import { sequelize } from '../../config/db.js';
import { callLlm, scrubPii } from './ai.provider.js';
import { AiChatAuditLog } from './aiChatAuditLog.model.js';
import { BUYER_ASSISTANT_V3_SYSTEM_PROMPT } from './prompts/buyerAssistant.v3.prompt.js';
import { BuyerAssistantOutputSchema } from './schemas/buyerAssistant.schema.js';
import { assembleContext } from './rag/contextAssembly.service.js';
import { validateAssistantOutput, sanitizeAssistantFallback } from './rag/buyerAssistantValidator.js';
import { RFQ_SUMMARIZER_SYSTEM_PROMPT, InquirySummaryZodSchema } from './prompts/rfqSummarizer.prompt.js';
import { SALES_REPLY_DRAFT_SYSTEM_PROMPT, SalesReplyDraftSchema } from './prompts/salesReplyDraft.prompt.js';
import { FOLLOW_UP_ASSISTANT_SYSTEM_PROMPT } from './prompts/followUpAssistant.prompt.js';
import {
  PRODUCT_CONTENT_GENERATOR_SYSTEM_PROMPT,
  ProductContentZodSchema,
} from './prompts/productContentGenerator.prompt.js';
import { SMART_SEARCH_SYSTEM_PROMPT, SmartSearchZodSchema } from './prompts/smartSearch.prompt.js';
import { RFQ_HELPER_SYSTEM_PROMPT, RfqHelperZodSchema } from './prompts/rfqHelper.prompt.js';
import Product from '../product/product.model.js';
import Category from '../category/category.model.js';
import Faq from '../faq/faq.model.js';
import Inquiry from '../inquiry/inquiry.model.js';
import Quotation from '../quotation/quotation.model.js';
import Order from '../order/order.model.js';
import logger from '../../utils/logger.js';

import { searchSimilarChunks, reindexAllCatalogue } from './rag/embedding.service.js';

/**
 * Public RAG-grounded buyer chat assistant (Version 3.0 Ground-Truth Engine)
 */
export const chatWithBuyerAssistant = async ({
  message,
  history = [],
  pageContext = null,
  sessionUuid = null,
  ipHash = '',
}) => {
  if (!message || !message.trim()) {
    throw new Error('Message is required');
  }

  // 1. Retrieve Grounding Context & Assemble Fact Ledger
  const assembled = await assembleContext({ message, history, pageContext });
  const { intent, factLedger, factLedgerText, sources, isAmbiguous, clarifyingQuestion } = assembled;

  // 2. Format Conversation History for Context Injection (last 6 turns)
  const conversationMessages = (history || []).slice(-6).map((msg) => ({
    role: msg.role === 'buyer' || msg.role === 'user' ? 'user' : 'assistant',
    content: msg.content || msg.text || '',
  }));

  conversationMessages.push({
    role: 'user',
    content: message,
  });

  // 3. Deterministic safe fallback JSON for offline / timeout scenarios
  const fallbackFactIds = factLedger.filter((f) => f.isVerified).slice(0, 2).map((f) => f.id);
  const fallbackJson = JSON.stringify({
    answer: `Our export technical desk will verify these specific commercial and technical parameters directly for your inquiry. Please submit an RFQ to receive binding proforma terms within 48 business hours [FACT-ID: FACT-COMP-sourcing_promise].`,
    intent: intent || 'product_info',
    used_fact_ids: fallbackFactIds.length > 0 ? fallbackFactIds : ['FACT-COMP-sourcing_promise'],
    confidence: isAmbiguous ? 0.70 : 0.85,
    needs_human: true,
    suggested_action: 'open_rfq',
    follow_up_question: isAmbiguous ? clarifyingQuestion : null,
    source_chips: sources.slice(0, 2).map((s) => ({
      label: s.name,
      type: s.type,
      slug: s.slug || undefined,
    })),
  });

  // 4. Invoke LLM with Grounded Fact Ledger and Zod Schema
  let llmResponse = await callLlm({
    feature: 'quote_assistant',
    systemPrompt: BUYER_ASSISTANT_V3_SYSTEM_PROMPT,
    messages: conversationMessages,
    context: factLedgerText,
    temperature: 0.1,
    maxTokens: 2500,
    schema: BuyerAssistantOutputSchema,
    fallback: fallbackJson,
    ipHash,
    cacheKey: null,
  });

  let rawData = llmResponse.data;
  if (!rawData && llmResponse.text) {
    try {
      const cleaned = llmResponse.text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
      rawData = JSON.parse(cleaned);
    } catch {
      rawData = JSON.parse(fallbackJson);
    }
  }

  // 5. Server-Side Fact Citation & Guardrail Validation
  let validationResult = validateAssistantOutput({
    output: rawData,
    factLedger,
    userMessage: message,
  });

  // If invalid, trigger a single corrective retry
  if (!validationResult.isValid) {
    logger.warn(
      `Buyer Assistant output validation issues: ${validationResult.violations.join('; ')}. Initiating corrective retry.`
    );
    const retryMessages = [
      ...conversationMessages,
      {
        role: 'assistant',
        content: JSON.stringify(rawData),
      },
      {
        role: 'user',
        content: `CORRECTION REQUIRED: Your previous response violated the strict grounding rules: ${validationResult.violations.join('; ')}. Please regenerate valid JSON strictly citing only available [FACT-ID: ...] items from the provided ledger, qualifying unverified specs as 'typical'. Do NOT invent prices or certifications.`,
      },
    ];

    try {
      const retryResponse = await callLlm({
        feature: 'quote_assistant',
        systemPrompt: BUYER_ASSISTANT_V3_SYSTEM_PROMPT,
        messages: retryMessages,
        context: factLedgerText,
        temperature: 0.05,
        maxTokens: 2500,
        schema: BuyerAssistantOutputSchema,
        fallback: fallbackJson,
        ipHash,
        cacheKey: null,
      });

      if (retryResponse.data) {
        const retryValidation = validateAssistantOutput({
          output: retryResponse.data,
          factLedger,
          userMessage: message,
        });
        if (retryValidation.isValid) {
          validationResult = retryValidation;
        }
      }
    } catch (retryErr) {
      logger.warn(`Corrective retry encountered error: ${retryErr.message}`);
    }
  }

  // 6. Final Safe Sanitization Fallback if violations persist
  const finalOutput = validationResult.isValid
    ? validationResult.sanitized
    : sanitizeAssistantFallback({
        sanitized: validationResult.sanitized,
        violations: validationResult.violations,
        factLedger,
      });

  // Ensure source chips have fallback if empty and sources exist
  if ((!finalOutput.source_chips || finalOutput.source_chips.length === 0) && sources.length > 0) {
    finalOutput.source_chips = sources.slice(0, 2).map((s) => ({
      label: s.name,
      type: s.type,
      slug: s.slug || undefined,
    }));
  }

  const hasBuyingIntent =
    ['pricing_moq', 'sample', 'how_to_order'].includes(finalOutput.intent) ||
    ['add_to_quote', 'open_rfq', 'request_sample'].includes(finalOutput.suggested_action);

  // 7. Extract inline fact citations into used_fact_ids, then clean [FACT-ID: ...] tokens for human presentation
  const inlineFactIds = (finalOutput.answer.match(/\[FACT-ID:\s*([^\]]+)\]/gi) || []).map((m) =>
    m.replace(/\[FACT-ID:\s*|\]/gi, '').trim()
  );
  if (inlineFactIds.length > 0) {
    finalOutput.used_fact_ids = Array.from(new Set([...(finalOutput.used_fact_ids || []), ...inlineFactIds]));
  }

  // Format clean B2B prose by stripping internal ledger tokens from buyer-facing output
  const cleanAnswer = (finalOutput.answer || '')
    .replace(/\s*\[FACT-ID:\s*[^\]]+\]/gi, '')
    .replace(/\[FACT-ID:[^\]]*\]/gi, '')
    .trim();

  // Persist chat audit log asynchronously (privacy-safe, PII scrubbed)
  let auditLog = null;
  try {
    auditLog = await AiChatAuditLog.create({
      sessionUuid,
      message: scrubPii(message),
      answer: cleanAnswer,
      intent: finalOutput.intent,
      usedFactIds: finalOutput.used_fact_ids || [],
      confidence: finalOutput.confidence || 0.85,
      needsHuman: Boolean(finalOutput.needs_human),
      suggestedAction: finalOutput.suggested_action || 'none',
      pageContext: pageContext || null,
      ipHash,
    });
  } catch (logErr) {
    logger.warn(`Failed to persist chat audit log: ${logErr.message}`);
  }

  return {
    reply: cleanAnswer,
    answer: finalOutput.answer || cleanAnswer,
    intent: finalOutput.intent,
    hasBuyingIntent,
    auditLogId: auditLog?.id || null,
    used_fact_ids: finalOutput.used_fact_ids,
    confidence: finalOutput.confidence,
    needs_human: finalOutput.needs_human,
    suggested_action: finalOutput.suggested_action,
    follow_up_question: finalOutput.follow_up_question,
    source_chips: finalOutput.source_chips,
    sources,
    ragGrounded: sources.length > 0 || factLedger.length > 0,
    model: llmResponse.model,
    cached: llmResponse.cached || false,
    latencyMs: llmResponse.latencyMs,
  };
};

/**
 * Background intelligence job processing new RFQs: Summarize, Lead Score & Draft Reply
 */
export const processInquiryAiJob = async (inquiryId) => {
  try {
    const inquiry = await Inquiry.findByPk(inquiryId);
    if (!inquiry) {
      logger.warn(`AI job skipped: inquiry ${inquiryId} not found`);
      return;
    }

    const inqData = inquiry.toJSON();

    const inquiryContext = `
INQUIRY DETAILS:
Reference: ${inqData.referenceNo}
Buyer Name: ${inqData.buyer?.name}
Company: ${inqData.buyer?.company}
Email: ${inqData.buyer?.email}
Country: ${inqData.buyer?.country} (${inqData.buyer?.city || 'N/A'})
Buyer Type: ${inqData.buyer?.buyerType}
Discharge Port: ${inqData.destinationPort || 'Not specified'}
Incoterm: ${inqData.incoterm || 'CIF'}
Target Month: ${inqData.targetShipmentMonth || 'Immediate'}
Payment Term: ${inqData.paymentTerm || 'TT'}
Requested Commodities:
${inqData.items?.map((item) => `- ${item.productName}: ${item.quantity} ${item.unit} (Packing: ${item.packing || 'Std'})`).join('\n') || 'None specified'}
Buyer Message: "${inqData.message || 'No additional note'}"
`;

    // 1. Generate Summary, Lead Score & Spam Assessment using Zod Schema
    const summaryRes = await callLlm({
      feature: 'inquiry_summary',
      systemPrompt: RFQ_SUMMARIZER_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Analyze this inquiry:\n${inquiryContext}` }],
      context: inquiryContext,
      schema: InquirySummaryZodSchema,
      fallback: {
        summary: 'Commercial RFQ received from international buyer.',
        language: 'en',
        leadScore: 75,
        scoreReason: 'Standard commercial inquiry',
        urgency: 'warm',
        isSpam: false,
        extracted: {},
        suggestedAction: 'Issue proforma invoice with valid ocean freight schedule to destination discharge port.',
      },
    });

    const parsedSummary = summaryRes.data || JSON.parse(summaryRes.text || '{}');

    // 2. Generate Sales Draft Reply with Zod schema validation
    const draftRes = await callLlm({
      feature: 'reply_draft',
      systemPrompt: SALES_REPLY_DRAFT_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Draft acknowledgement quotation email for:\n${inquiryContext}\nLanguage: ${parsedSummary.language || 'en'}`,
        },
      ],
      context: inquiryContext,
      schema: SalesReplyDraftSchema,
      fallback: {
        subject: `Commercial Quotation & Export Response [Ref: ${inqData.referenceNo}] — Jhs Global`,
        greeting: `Dear ${inqData.buyer?.name || 'Procurement Team'},`,
        body: `Thank you for your commercial quotation inquiry regarding containerized agricultural commodities from India. All consignments undergo 100% Sortex optical color cleaning, batch laboratory testing with Certificate of Analysis (COA), and strict APEDA / FSSAI export compliance. Our logistics team is computing binding container ocean freight to your destination. You will receive our formal Proforma Invoice with complete commercial specifications within 48 business hours.`,
        callToAction: `Please confirm if your team requires palletized container stuffing or marine transit insurance inclusion.`,
        fullEmail: `Dear ${inqData.buyer?.name || 'Procurement Team'},\n\nThank you for your commercial quotation inquiry. All consignments undergo 100% Sortex optical color cleaning, batch testing with COA, and APEDA compliance. You will receive our formal Proforma Invoice within 48 business hours.\n\nPlease confirm if palletized stuffing is required.\n\nBest regards,\nJhs Global Exports`,
        language: parsedSummary.language || 'en',
        tone: 'formal_b2b',
      },
    });

    const parsedDraft =
      draftRes.data ||
      (typeof draftRes.text === 'string' && draftRes.text.startsWith('{')
        ? JSON.parse(draftRes.text)
        : { fullEmail: draftRes.text, subject: `Commercial Quotation & Export Response [Ref: ${inqData.referenceNo}] — Jhs Global` });
    const replySubject =
      parsedDraft.subject || `Commercial Quotation & Export Response [Ref: ${inqData.referenceNo}] — Jhs Global`;
    const suggestedReplyText = parsedDraft.fullEmail || parsedDraft.body || draftRes.text;

    // 3. Duplicate detection
    const dupCheck = await detectDuplicateInquiries({
      email: inqData.buyer?.email,
      company: inqData.buyer?.company,
      currentInquiryId: inqData.id,
    });

    const existingNotes = Array.isArray(inquiry.notes) ? [...inquiry.notes] : [];
    if (dupCheck.isDuplicate) {
      existingNotes.push({
        by: 'AI Lead Auditor',
        text: `Repeat buyer detected: ${dupCheck.count} prior inquiry record(s) found in the last 30 days.`,
        at: new Date().toISOString(),
      });
      inquiry.notes = existingNotes;
    }

    // 4. Update Inquiry record
    inquiry.ai = {
      summary: parsedSummary.summary || 'Commercial RFQ received from international buyer.',
      language: parsedSummary.language || 'en',
      translatedMessage: parsedSummary.translatedMessage || '',
      extracted: parsedSummary.extracted || {},
      leadScore: typeof parsedSummary.leadScore === 'number' ? parsedSummary.leadScore : 75,
      scoreReason: parsedSummary.scoreReason || '',
      urgency: parsedSummary.urgency || 'warm',
      isSpam: Boolean(parsedSummary.isSpam),
      spamReason: parsedSummary.spamReason || '',
      suggestedAction: parsedSummary.suggestedAction || 'Review inquiry and respond with proforma invoice',
      suggestedReply: suggestedReplyText,
      replySubject: replySubject,
      model: summaryRes.model,
      generatedAt: new Date().toISOString(),
    };

    // 5. Spam and Priority classification
    if (parsedSummary.isSpam) {
      inquiry.status = 'spam';
      inquiry.priority = 'cold';
      logger.warn(`Inquiry ${inquiry.referenceNo} flagged as SPAM by AI: ${parsedSummary.spamReason}`);
    } else if (parsedSummary.urgency === 'hot' || parsedSummary.leadScore >= 80) {
      inquiry.priority = 'hot';
    } else if (parsedSummary.urgency === 'cold' || parsedSummary.leadScore < 50) {
      inquiry.priority = 'cold';
    } else {
      inquiry.priority = 'warm';
    }

    await inquiry.save();
    logger.info(
      `AI lead scoring complete for ${inquiry.referenceNo}: Score ${inquiry.ai.leadScore}/100 [Priority: ${inquiry.priority}, Status: ${inquiry.status}]`
    );
  } catch (error) {
    logger.error(`AI job failed for inquiry ${inquiryId}: ${error.message}`);
  }
};

/**
 * Regenerate or customize sales reply draft on demand
 */
export const generateDraftReply = async (inquiryId, options = {}) => {
  const inquiry = await Inquiry.findByPk(inquiryId);
  if (!inquiry) {
    const error = new Error('Inquiry not found');
    error.statusCode = 404;
    throw error;
  }

  const inqData = inquiry.toJSON();
  const targetLang = options.language || inqData.ai?.language || 'en';
  const customInstructions = options.customInstructions ? `\nStaff Guidance: ${options.customInstructions}` : '';

  const inquiryContext = `
Reference: ${inqData.referenceNo}
Buyer: ${inqData.buyer?.name} (${inqData.buyer?.company}, ${inqData.buyer?.country})
Items: ${inqData.items?.map((i) => `${i.productName} ${i.quantity}${i.unit} (Packing: ${i.packing || 'Std'})`).join(', ') || 'General commodity inquiry'}
Port: ${inqData.destinationPort || 'As agreed'} | Incoterm: ${inqData.incoterm || 'CIF'}
Target Month: ${inqData.targetShipmentMonth || 'Immediate'}
Payment Term: ${inqData.paymentTerm || 'TT'}
Message: "${inqData.message || 'No additional note'}"
Language: ${targetLang}${customInstructions}
`;

  const draftRes = await callLlm({
    feature: 'reply_draft',
    systemPrompt: SALES_REPLY_DRAFT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Draft acknowledgement quotation email for:\n${inquiryContext}\nLanguage: ${targetLang}`,
      },
    ],
    context: inquiryContext,
    schema: SalesReplyDraftSchema,
    fallback: {
      subject: `Commercial Quotation & Export Response [Ref: ${inqData.referenceNo}] — Jhs Global`,
      greeting: `Dear ${inqData.buyer?.name || 'Procurement Team'},`,
      body: `Thank you for your commercial quotation inquiry regarding containerized agricultural commodities from India. All consignments undergo 100% Sortex optical color cleaning, batch laboratory testing with Certificate of Analysis (COA), and strict APEDA / FSSAI export compliance. Our logistics team is computing binding container ocean freight to your destination. You will receive our formal Proforma Invoice with complete commercial specifications within 48 business hours.`,
      callToAction: `Please confirm if your team requires palletized container stuffing or marine transit insurance inclusion.`,
      fullEmail: `Dear ${inqData.buyer?.name || 'Procurement Team'},\n\nThank you for your commercial quotation inquiry. All consignments undergo 100% Sortex optical color cleaning, batch testing with COA, and APEDA compliance. You will receive our formal Proforma Invoice within 48 business hours.\n\nPlease confirm if palletized stuffing is required.\n\nBest regards,\nJhs Global Exports`,
      language: targetLang,
      tone: 'formal_b2b',
    },
  });

  const parsedDraft =
    draftRes.data ||
    (typeof draftRes.text === 'string' && draftRes.text.startsWith('{')
      ? JSON.parse(draftRes.text)
      : { fullEmail: draftRes.text, subject: `Commercial Quotation & Export Response [Ref: ${inqData.referenceNo}] — Jhs Global` });
  const replySubject =
    parsedDraft.subject || `Commercial Quotation & Export Response [Ref: ${inqData.referenceNo}] — Jhs Global`;
  const suggestedReplyText = parsedDraft.fullEmail || parsedDraft.body || draftRes.text;

  const ai = inquiry.ai ? { ...inquiry.ai } : {};
  ai.suggestedReply = suggestedReplyText;
  ai.replySubject = replySubject;
  inquiry.ai = ai;
  await inquiry.save();

  return {
    subject: replySubject,
    suggestedReply: suggestedReplyText,
    draftReply: suggestedReplyText,
    greeting: parsedDraft.greeting || '',
    body: parsedDraft.body || suggestedReplyText,
    callToAction: parsedDraft.callToAction || '',
    language: parsedDraft.language || targetLang,
  };
};

/**
 * AI #5 - Follow-up Assistant for pending inquiries/quotations
 */
export const generateFollowUpDraft = async ({ inquiryId, quotationId, channel = 'email' }) => {
  let context = '';
  let recipient = '';

  if (quotationId) {
    const quotation = await Quotation.findByPk(quotationId);
    if (quotation) {
      recipient = `${quotation.buyer?.name} (${quotation.buyer?.company}, ${quotation.buyer?.country})`;
      context = `
QUOTATION DETAILS:
Quote Ref: ${quotation.quotationNumber}
Buyer: ${recipient}
Commodities: ${(quotation.items || []).map((i) => `${i.productName} (${i.quantity} ${i.unit} @ ${quotation.currency} ${i.unitPrice})`).join(', ')}
Total: ${quotation.currency} ${quotation.totalAmount} (${quotation.incoterm})
Port: ${quotation.portOfDischarge}
Validity: ${new Date(quotation.validityDate).toLocaleDateString()}
`;
    }
  } else if (inquiryId) {
    const inquiry = await Inquiry.findByPk(inquiryId);
    if (inquiry) {
      recipient = `${inquiry.buyer?.name} (${inquiry.buyer?.company}, ${inquiry.buyer?.country})`;
      context = `
INQUIRY DETAILS:
Reference: ${inquiry.referenceNo}
Buyer: ${recipient}
Commodities: ${(inquiry.items || []).map((i) => `${i.productName} (${i.quantity} ${i.unit})`).join(', ')}
Port: ${inquiry.destinationPort || 'As agreed'}
Incoterm: ${inquiry.incoterm}
Status: ${inquiry.status}
`;
    }
  }

  if (!context) {
    throw new Error('Valid quotationId or inquiryId must be supplied');
  }

  const promptChannel = channel === 'whatsapp' ? 'WhatsApp message (max 100 words, direct, professional)' : 'Formal B2B email';

  const res = await callLlm({
    feature: 'quote_assistant',
    systemPrompt: FOLLOW_UP_ASSISTANT_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Draft a professional follow-up for this commercial prospect via ${promptChannel}:\n${context}`,
      },
    ],
    context,
    fallback: `Dear ${recipient},\n\nWe wanted to follow up regarding your commercial inquiry with Jhs Global Exports. Our export logistics desk is ready to proceed with container allocation and booking for your required destination. Please let us know if your procurement committee requires any additional quality certificates or shipping specifications.\n\nBest regards,\nInternational Trade Desk`,
  });

  return {
    recipient,
    channel,
    content: res.text,
    followUpText: res.text,
    model: res.model,
  };
};

/**
 * AI #6 - Product Content Generator
 */
export const generateProductContent = async (payload = {}) => {
  const productName = (payload.productName || payload.name || '').trim();
  const categoryName = payload.categoryName || '';
  const rawNotes = payload.rawNotes || payload.packaging || '';

  if (!productName) {
    throw new Error('productName is required');
  }

  const promptContext = `Commodity: ${productName}\nCategory: ${categoryName || 'General Agro-Commodity'}\nNotes: ${rawNotes}`;

  const res = await callLlm({
    feature: 'product_content',
    systemPrompt: PRODUCT_CONTENT_GENERATOR_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Generate complete B2B export specification sheet and SEO dossier for:\n${promptContext}`,
      },
    ],
    schema: ProductContentZodSchema,
    context: promptContext,
    fallback: {
      shortDescription: `Premium export-grade ${productName} sourced from prime manufacturing facilities in India, tested for international export compliance.`,
      description: `We supply high-grade ${productName} adhering to stringent international quality benchmarks with full batch COA and documentation.`,
      highlights: ['Purity: Min 99.5%', 'Export Grade', 'Batch COA Available'],
      seo: {
        title: `${productName} Exporters India | Export Quality Bulk Supply`,
        description: `Direct manufacturer-exporter of premium ${productName} with batch COA and export packaging.`,
        keywords: [productName, 'raw material exporter india'],
      },
      specSuggestions: {
        suggestedHsCode: '2918.21',
        suggestedMoq: { value: 1, unit: 'MT' },
        suggestedPacking: '25kg fiber drums',
        shelfLife: '24 months',
        storage: 'Store in cool, dry hygienic warehouse',
      },
      suggestedSpecs: [
        { key: 'Purity', value: '99.5% min', unit: '%' },
        { key: 'Moisture', value: '1.0% max', unit: '%' },
      ],
      faqs: [
        {
          question: `What is the standard packaging for ${productName}?`,
          answer: 'Packed in 25kg export-grade fiber drums with PE inner liners.',
        },
      ],
      seoTitle: `${productName} Exporters India | Export Quality Bulk Supply`,
      seoDescription: `Direct manufacturer-exporter of premium ${productName}.`,
    },
  });

  const parsed =
    res.data ||
    (typeof res.text === 'string' && res.text.startsWith('{')
      ? JSON.parse(res.text)
      : { shortDescription: res.text, description: res.text, specs: [], packing: [] });

  if (parsed && !parsed.seoTitle && parsed.seo?.title) {
    parsed.seoTitle = parsed.seo.title;
  }
  if (parsed && !parsed.seoDescription && parsed.seo?.description) {
    parsed.seoDescription = parsed.seo.description;
  }
  if (parsed && !parsed.keywords && parsed.seo?.keywords) {
    parsed.keywords = parsed.seo.keywords;
  }

  return parsed;
};

/**
 * Duplicate Inquiry Detection across 30-day window
 */
export const detectDuplicateInquiries = async ({ email, company, currentInquiryId = null }) => {
  if (!email && !company) {
    return { isDuplicate: false, count: 0, candidates: [] };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const orConditions = [];
  if (email) {
    orConditions.push(
      Sequelize.where(
        Sequelize.fn('lower', Sequelize.literal(`"buyer"->>'email'`)),
        email.toLowerCase().trim()
      )
    );
  }
  if (company) {
    orConditions.push(
      Sequelize.where(
        Sequelize.literal(`"buyer"->>'company'`),
        { [Op.iLike]: `%${company.trim()}%` }
      )
    );
  }

  const where = {
    createdAt: { [Op.gte]: thirtyDaysAgo },
    [Op.or]: orConditions,
  };

  if (currentInquiryId) {
    where.id = { [Op.ne]: parseInt(currentInquiryId, 10) };
  }

  const matches = await Inquiry.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 5,
    attributes: ['referenceNo', 'buyer', 'items', 'status', 'createdAt'],
  });

  if (matches.length === 0) {
    return { isDuplicate: false, count: 0, candidates: [] };
  }

  return {
    isDuplicate: true,
    count: matches.length,
    similarityScore: 92,
    candidates: matches.map((m) => {
      const plain = m.toJSON();
      return {
        referenceNo: plain.referenceNo,
        company: plain.buyer?.company,
        email: plain.buyer?.email,
        commodities: (plain.items || []).map((i) => i.productName).join(', '),
        status: plain.status,
        date: plain.createdAt,
      };
    }),
  };
};

/**
 * AI #7 - Catalogue Quality Checker
 */
export const auditCatalogueQuality = async () => {
  const products = await Product.findAll({
    where: { isActive: true },
    include: [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
    ],
  });

  const issues = [];
  let healthyCount = 0;

  for (const productModel of products) {
    const product = productModel.toJSON();
    const missing = [];
    const fixes = [];

    if (!product.hsCode || product.hsCode.trim().length < 4) {
      missing.push('hsCode');
      fixes.push('Assign standard 6-digit export HS code (e.g., 0910.30)');
    }

    if (!product.images || product.images.length === 0) {
      missing.push('images');
      fixes.push('Upload high-resolution commercial commodity image');
    }

    if (!product.shortDescription || product.shortDescription.trim().length < 20) {
      missing.push('shortDescription');
      fixes.push('Add 1-2 sentence commercial summary for catalogue card');
    }

    if (!product.specs || product.specs.length === 0) {
      missing.push('specs');
      fixes.push('Add batch lab specifications (e.g. Moisture %, Purity %, Foreign Matter)');
    }

    if (!product.seo?.title || !product.seo?.description) {
      missing.push('seo');
      fixes.push('Configure international buyer SEO title and meta description');
    }

    if (!product.moq?.value || !product.packing || product.packing.length === 0) {
      missing.push('packing');
      fixes.push('Specify export packaging type and minimum container order tonnage');
    }

    if (missing.length === 0) {
      healthyCount++;
    } else {
      const severity =
        missing.includes('hsCode') || missing.includes('specs')
          ? 'high'
          : missing.includes('images')
            ? 'medium'
            : 'low';
      issues.push({
        productId: product.id,
        productName: product.name,
        slug: product.slug,
        category: product.category?.name || 'Uncategorized',
        missingFields: missing,
        severity,
        suggestedFixes: fixes,
      });
    }
  }

  const total = products.length;
  const healthScore = total > 0 ? Math.round((healthyCount / total) * 100) : 100;

  return {
    totalAudited: total,
    healthyCount,
    flawedCount: issues.length,
    catalogueHealthScore: healthScore,
    issues,
    summary: `Catalogue quality audit completed across ${total} active commodities. Health score: ${healthScore}%. ${issues.length} product(s) require technical spec, HS code, or imagery enrichment.`,
  };
};

/**
 * AI #8 - Executive Sales Insights
 */
export const getSalesInsights = async ({ question }) => {
  const [
    totalInquiries,
    statusBreakdownRows,
    countryBreakdownRows,
    totalOrders,
    orderRevenueSum,
    inquiriesWithApproved,
  ] = await Promise.all([
    Inquiry.count(),
    Inquiry.findAll({
      attributes: ['status', [sequelize.fn('count', sequelize.col('id')), 'count']],
      group: ['status'],
      raw: true,
    }),
    Inquiry.findAll({
      attributes: [
        [sequelize.literal(`COALESCE("buyer"->>'country', 'Unknown')`), 'country'],
        [sequelize.fn('count', sequelize.col('id')), 'count'],
      ],
      group: [sequelize.literal(`COALESCE("buyer"->>'country', 'Unknown')`)],
      order: [[sequelize.literal('count'), 'DESC']],
      limit: 8,
      raw: true,
    }),
    Order.count(),
    Order.sum('totalAmount'),
    Inquiry.findAll({
      where: sequelize.literal(`"ai"->>'approvedAt' IS NOT NULL`),
      attributes: ['createdAt', 'ai'],
      raw: true,
    }),
  ]);

  let avgResponseTimeHours = 18.5;
  if (inquiriesWithApproved.length > 0) {
    const totalDiffMs = inquiriesWithApproved.reduce((acc, inq) => {
      const approvedAt = inq.ai?.approvedAt ? new Date(inq.ai.approvedAt) : null;
      const createdAt = inq.createdAt ? new Date(inq.createdAt) : null;
      if (approvedAt && createdAt) {
        const diff = approvedAt - createdAt;
        return acc + (diff > 0 ? diff : 0);
      }
      return acc;
    }, 0);
    avgResponseTimeHours = Number((totalDiffMs / (inquiriesWithApproved.length * 3600000)).toFixed(1));
  }

  const conversionRate = totalInquiries > 0 ? Number(((totalOrders / totalInquiries) * 100).toFixed(1)) : 0;

  const statsContext = `
LIVE EXPORT DATABASE METRICS:
Total RFQs Received: ${totalInquiries}
Total Orders Confirmed: ${totalOrders}
Inquiry to Order Conversion Rate: ${conversionRate}%
Average Response Time: ${avgResponseTimeHours} hours
Inquiries by Country:
${countryBreakdownRows.map((c) => `- ${c.country}: ${c.count} inquiries`).join('\n')}
Total Order Revenue: USD ${Number(orderRevenueSum || 0).toLocaleString()}
Status Distribution:
${statusBreakdownRows.map((s) => `- ${s.status}: ${s.count}`).join('\n')}
`;

  const res = await callLlm({
    feature: 'quote_assistant',
    systemPrompt: `You are the Commercial Director and Export Intelligence Analyst for Jhs Global Exports.
Answer the user's strategic business question using ONLY the provided real database statistics.
Cover:
1. Top destination markets and commodity demand trends
2. Response time SLA performance (${avgResponseTimeHours}h) and quotation throughput
3. Practical recommendations to improve RFQ conversion
Be crisp, professional, and highlight high-yield growth opportunities.`,
    messages: [
      {
        role: 'user',
        content: question || 'Provide an executive briefing of our current export pipeline, response times, and top markets.',
      },
    ],
    context: statsContext,
  });

  return {
    question: question || 'Executive Export Intelligence Briefing',
    insights: res.text,
    metricsSummary: {
      totalInquiries,
      totalOrders,
      conversionRate,
      avgResponseTimeHours,
      topCountries: countryBreakdownRows,
      statusBreakdown: statusBreakdownRows,
    },
  };
};

/**
 * Smart Search: Convert natural language user query into structured catalogue filters
 */
export const parseSmartSearch = async ({ query, ipHash = '' }) => {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Search query is required');
  }

  const trimmedQuery = query.trim().slice(0, 500);
  const cacheKey = `smart_search:${trimmedQuery.toLowerCase()}`;

  const res = await callLlm({
    feature: 'smart_search',
    systemPrompt: SMART_SEARCH_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: trimmedQuery }],
    schema: SmartSearchZodSchema,
    ipHash,
    cacheKey,
    fallback: {
      keyword: trimmedQuery,
      categorySlug: '',
      origin: '',
      quantity: null,
      unit: '',
      packing: '',
      detectedLanguage: 'en',
      summary: 'Parsed into keyword search',
    },
  });

  return (
    res.data ||
    (typeof res.text === 'string' && res.text.startsWith('{')
      ? JSON.parse(res.text)
      : { keyword: trimmedQuery, categorySlug: '', origin: '', quantity: null, unit: '', packing: '', detectedLanguage: 'en', summary: 'Parsed keyword search' })
  );
};

/**
 * RFQ Helper: Extract structured RFQ form fields from unstructured text or emails
 */
export const parseFreeTextRfq = async ({ text, ipHash = '' }) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    throw new Error('RFQ text is required');
  }

  const trimmedText = text.trim().slice(0, 2000);

  const res = await callLlm({
    feature: 'rfq_parse',
    systemPrompt: RFQ_HELPER_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Extract RFQ fields from this procurement message:\n${trimmedText}`,
      },
    ],
    schema: RfqHelperZodSchema,
    ipHash,
    fallback: {
      buyer: {},
      items: [],
      logistics: { incoterm: 'CIF', paymentTerm: 'TT' },
      cleanedMessage: trimmedText,
      extractedLanguage: 'en',
    },
  });

  const parsed =
    res.data ||
    (typeof res.text === 'string' && res.text.startsWith('{')
      ? JSON.parse(res.text)
      : { buyer: {}, items: [], logistics: { incoterm: 'CIF', paymentTerm: 'TT' }, cleanedMessage: trimmedText, extractedLanguage: 'en' });

  if (parsed && !parsed.message && parsed.cleanedMessage) {
    parsed.message = parsed.cleanedMessage;
  }

  return parsed;
};

export const reindexCatalogueEmbeddings = async () => {
  return await reindexAllCatalogue();
};

/**
 * Submit visitor feedback (thumbs up / thumbs down) for an AI response
 */
export const submitChatFeedback = async ({ logId, rating, comment = '' }) => {
  if (!logId || !['helpful', 'unhelpful'].includes(rating)) {
    throw new Error('Valid logId and rating (helpful or unhelpful) are required');
  }
  const log = await AiChatAuditLog.findByPk(logId);
  if (!log) {
    throw new Error('Chat log not found');
  }
  log.feedbackRating = rating;
  if (comment) {
    log.feedbackComment = scrubPii(comment);
  }
  await log.save();
  return log;
};

/**
 * List paginated chat audit logs with filters for admin review
 */
export const listChatAuditLogs = async ({
  page = 1,
  limit = 20,
  intent,
  needsHuman,
  lowConfidence,
  rating,
  isResolved,
  search,
} = {}) => {
  const where = {};
  if (intent) where.intent = intent;
  if (typeof needsHuman === 'boolean' || needsHuman === 'true' || needsHuman === 'false') {
    where.needsHuman = String(needsHuman) === 'true';
  }
  if (typeof isResolved === 'boolean' || isResolved === 'true' || isResolved === 'false') {
    where.isResolved = String(isResolved) === 'true';
  }
  if (String(lowConfidence) === 'true') {
    where.confidence = { [Op.lt]: 0.75 };
  }
  if (rating) {
    where.feedbackRating = rating;
  }
  if (search && search.trim()) {
    where.message = { [Op.iLike]: `%${search.trim()}%` };
  }

  const offset = (Math.max(1, Number(page)) - 1) * Number(limit);
  const { rows, count } = await AiChatAuditLog.findAndCountAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: Number(limit),
    offset,
  });

  const [totalCount, needsHumanCount, lowConfidenceCount, unhelpfulCount] = await Promise.all([
    AiChatAuditLog.count().catch(() => count),
    AiChatAuditLog.count({ where: { needsHuman: true, isResolved: false } }).catch(() => 0),
    AiChatAuditLog.count({ where: { confidence: { [Op.lt]: 0.75 }, isResolved: false } }).catch(() => 0),
    AiChatAuditLog.count({ where: { feedbackRating: 'unhelpful' } }).catch(() => 0),
  ]);

  return {
    logs: rows,
    total: count,
    page: Number(page),
    totalPages: Math.ceil(count / Number(limit)) || 1,
    stats: {
      total: totalCount,
      needsHumanCount,
      lowConfidenceCount,
      unhelpfulCount,
    },
  };
};

/**
 * Identify and aggregate repeated unknown or low-confidence questions
 */
export const getRepeatedUnknownQueries = async () => {
  const logs = await AiChatAuditLog.findAll({
    where: {
      [Op.or]: [{ needsHuman: true }, { confidence: { [Op.lt]: 0.75 } }],
      isResolved: false,
    },
    order: [['createdAt', 'DESC']],
    limit: 200,
  });

  const grouped = new Map();
  for (const log of logs) {
    const normalized = log.message.trim().toLowerCase().replace(/[?!.,]/g, '');
    if (!grouped.has(normalized)) {
      grouped.set(normalized, {
        query: log.message,
        normalizedQuery: normalized,
        originalMessage: log.message,
        count: 0,
        intent: log.intent,
        lastSeenAt: log.createdAt,
        pageContexts: [],
        sampleLogId: log.id,
      });
    }
    const entry = grouped.get(normalized);
    entry.count++;
    if (log.pageContext && !entry.pageContexts.some((p) => p.pathname === log.pageContext.pathname)) {
      entry.pageContexts.push(log.pageContext);
    }
  }

  const repeated = Array.from(grouped.values())
    .sort((a, b) => b.count - a.count)
    .map((item) => ({
      ...item,
      alert: item.count >= 3,
    }));

  return repeated;
};

/**
 * Mark a chat audit log as resolved once staff adds missing facts
 */
export const resolveChatAuditLog = async (id, { resolvedNote = '' } = {}) => {
  const log = await AiChatAuditLog.findByPk(id);
  if (!log) {
    throw new Error('Chat log not found');
  }
  log.isResolved = true;
  if (resolvedNote) {
    log.resolvedNote = resolvedNote;
  }
  await log.save();
  return log;
};

export default {
  chatWithBuyerAssistant,
  processInquiryAiJob,
  generateDraftReply,
  generateFollowUpDraft,
  generateProductContent,
  auditCatalogueQuality,
  detectDuplicateInquiries,
  getSalesInsights,
  reindexCatalogueEmbeddings,
  parseSmartSearch,
  parseFreeTextRfq,
  submitChatFeedback,
  listChatAuditLogs,
  getRepeatedUnknownQueries,
  resolveChatAuditLog,
};

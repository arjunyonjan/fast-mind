export interface IntentResult {
  intent: string;
  confidence: number;
  data: any;
  requiresConfirmation: boolean;
}

const INTENT_PATTERNS = [
  // Confirmations
  {
    intent: "confirm_task",
    patterns: [/^(yes|y|yeah|yep|sure|ok|okay|confirm|do it|go ahead|👍|✅|proceed|accept|approve)$/i],
    confidence: 1.0,
    data: null
  },
  // Rejections
  {
    intent: "reject_task",
    patterns: [/^(no|n|nah|nope|cancel|abort|stop|reject|decline|pass|skip)$/i],
    confidence: 1.0,
    data: null
  },
  // List pending
  {
    intent: "list_pending",
    patterns: [
      /(list|show|get|what|any).*pending/i,
      /pending (tasks|items|things)/i,
      /what.*waiting/i,
      /show.*draft/i
    ],
    confidence: 0.95,
    data: null
  },
  // List tasks (with optional filter extraction)
  {
    intent: "list_tasks",
    patterns: [
      /(list|show|get|what|see|view).*tasks?/i,
      /my tasks/i,
      /all tasks/i,
      /task list/i,
      /what (do|should) i (do|work on)/i
    ],
    confidence: 0.95,
    extractData: (msg: string) => {
      const status = /completed|done|finished/i.test(msg) ? "completed" :
                     /pending|active|open|incomplete/i.test(msg) ? "pending" : null;
      const priority = /high\s*(priority)?|urgent|critical|asap/i.test(msg) ? "high" :
                       /low\s*(priority)?|whenever/i.test(msg) ? "low" : null;
      return { status, priority };
    }
  },
  // List documents
  {
    intent: "list_documents",
    patterns: [
      /(list|show|get|what|see|view).*documents?/i,
      /my (docs|documents)/i,
      /all (docs|documents)/i,
      /recent (docs|documents)/i
    ],
    confidence: 0.95,
    data: null
  },
  // Delete task by quoted title
  {
    intent: "delete_task",
    patterns: [
      /delete\s+["""]([^""]+)["""]/i,
      /delete\s+the\s+(.+?)\s+task/i,
      /delete\s+task\s+(?:named|called|titled)\s+["""]([^""]+)["""]/i,
      /get\s+rid\s+of\s+["""]([^""]+)["""]/i,
      /remove\s+["""]([^""]+)["""]/i
    ],
    confidence: 0.85,
    extractData: (msg: string) => {
      const patterns = [
        /delete\s+["""]([^""]+)["""]/i,
        /delete\s+the\s+(.+?)\s+task/i,
        /delete\s+task\s+(?:named|called|titled)\s+["""]([^""]+)["""]/i,
        /get\s+rid\s+of\s+["""]([^""]+)["""]/i,
        /remove\s+["""]([^""]+)["""]/i
      ];
      for (const p of patterns) {
        const m = msg.match(p);
        if (m?.[1]) return { identifier: m[1].trim() };
      }
      return null;
    }
  },
  // Delete task by number
  {
    intent: "delete_task",
    patterns: [
      /delete\s+task\s+(\d+)/i,
      /delete\s+#?(\d+)/i
    ],
    confidence: 0.9,
    extractData: (msg: string) => {
      const match = msg.match(/delete\s+task\s+(\d+)|delete\s+#?(\d+)/i);
      const num = match?.[1] || match?.[2];
      return num ? { identifier: num } : null;
    }
  },
  // Complete task by quoted title
  {
    intent: "complete_task",
    patterns: [
      /complete\s+["""]([^""]+)["""]/i,
      /complete\s+the\s+(.+?)\s+task/i,
      /mark\s+["""]([^""]+)["""]\s+(?:as\s+)?complete/i,
      /done\s+with\s+["""]([^""]+)["""]/i
    ],
    confidence: 0.85,
    extractData: (msg: string) => {
      const patterns = [
        /complete\s+["""]([^""]+)["""]/i,
        /complete\s+the\s+(.+?)\s+task/i,
        /mark\s+["""]([^""]+)["""]\s+(?:as\s+)?complete/i,
        /done\s+with\s+["""]([^""]+)["""]/i
      ];
      for (const p of patterns) {
        const m = msg.match(p);
        if (m?.[1]) return { identifier: m[1].trim() };
      }
      return null;
    }
  },
  // Complete task by number
  {
    intent: "complete_task",
    patterns: [
      /complete\s+task\s+(\d+)/i,
      /complete\s+#?(\d+)/i
    ],
    confidence: 0.9,
    extractData: (msg: string) => {
      const match = msg.match(/complete\s+task\s+(\d+)|complete\s+#?(\d+)/i);
      const num = match?.[1] || match?.[2];
      return num ? { identifier: num } : null;
    }
  },
  // Update task (priority, status, etc.)
  {
    intent: "update_task",
    patterns: [
      /(?:change|set|update)\s+task\s+(\d+)\s+priority\s+to\s+(high|medium|low)/i,
      /(?:change|set|update)\s+task\s+(\d+)\s+(?:status\s+)?to\s+(completed|in.progress|cancelled|pending|active)/i,
      /mark\s+task\s+(\d+)\s+as\s+(completed|in.progress|cancelled|pending|active)/i,
      /(?:change|set|update)\s+priority\s+(?:of\s+)?task\s+(\d+)\s+to\s+(high|medium|low)/i
    ],
    confidence: 0.9,
    extractData: (msg: string) => {
      const priorityMatch = msg.match(/(?:change|set|update)\s+task\s+(\d+)\s+priority\s+to\s+(high|medium|low)/i)
                         || msg.match(/(?:change|set|update)\s+priority\s+(?:of\s+)?task\s+(\d+)\s+to\s+(high|medium|low)/i);
      if (priorityMatch) return { identifier: priorityMatch[1], field: "priority", value: priorityMatch[2].toLowerCase() };

      const statusMatch = msg.match(/(?:change|set|update)\s+task\s+(\d+)\s+(?:status\s+)?to\s+(completed|in.progress|cancelled|pending|active)/i)
                       || msg.match(/mark\s+task\s+(\d+)\s+as\s+(completed|in.progress|cancelled|pending|active)/i);
      if (statusMatch) return { identifier: statusMatch[1], field: "status", value: statusMatch[2].toLowerCase().replace(/\./g, " ") };

      return null;
    }
  },
  // Create task – explicit patterns (high confidence)
  {
    intent: "create_task",
    patterns: [
      /(?:add|create|new|make|set up|schedule)\s+(?:a\s+)?(?:new\s+)?task/i,
      /(?:add|create|new|make)\s+(?:a\s+)?(?:new\s+)?(?:todo|to-do|to do)/i,
      /remind me (?:to|about)\s+(.+)/i,
      /don't forget (?:to|about)\s+(.+)/i
    ],
    confidence: 0.85,
    extractData: (msg: string) => {
      const patterns = [
        /(?:add|create|new|make|set up|schedule)\s+(?:a\s+)?(?:new\s+)?(?:task|todo|to-do|to do)\s*(?::|to|for)?\s*(.+)/i,
        /remind me (?:to|about)\s+(.+)/i,
        /don't forget (?:to|about)\s+(.+)/i,
        /(.+)\s+(?:as a task|to my tasks)/i
      ];
      for (const pattern of patterns) {
        const match = msg.match(pattern);
        if (match?.[1]) {
          const title = match[1].trim();
          const priority = /urgent|asap|critical|important|high priority/i.test(msg) ? "high" :
                           /low priority|whenever|sometime|later/i.test(msg) ? "low" : "medium";
          return { title, priority };
        }
      }
      return null;
    }
  },
  // Create task – vague obligation patterns (low confidence → pending)
  {
    intent: "create_task",
    patterns: [
      /(?:need to|should|must|have to|gotta|got to)\s+(.+)/i
    ],
    confidence: 0.6,
    extractData: (msg: string) => {
      const match = msg.match(/(?:need to|should|must|have to|gotta|got to)\s+(.+)/i);
      if (match?.[1]) {
        const title = match[1].trim();
        if (title.length > 100) return null;
        const priority = /urgent|asap|critical|important|high priority/i.test(msg) ? "high" :
                         /low priority|whenever|sometime|later/i.test(msg) ? "low" : "medium";
        return { title, priority };
      }
      return null;
    }
  },
  // Create document
  {
    intent: "create_document",
    patterns: [
      /(?:create|new|make|start|write)\s+(?:a\s+)?(?:new\s+)?(?:doc|document|note|page)/i,
      /(?:new|create)\s+(?:doc|document|note)/i,
      /write\s+(?:a\s+)?(?:new\s+)?(?:doc|document|note|article|post)/i
    ],
    confidence: 0.85,
    extractData: (msg: string) => {
      const match = msg.match(/(?:about|on|for|titled?|called|named)\s+["']?([^"']+)["']?/i);
      return { title: match?.[1] || "Untitled Document" };
    }
  },
  // Open / navigate to a task or document
  {
    intent: "open_item",
    patterns: [
      /^(?:open|show|go to|view|navigate to)\s+task\s+(\d+)/i,
      /^(?:open|show|go to|view|navigate to)\s+(?:doc|document|note)\s+(\d+)/i,
      /^(?:open|show|go to|view|navigate to)\s+(?:doc|document|note)\s+["""]([^""]+)["""]/i
    ],
    confidence: 0.9,
    extractData: (msg: string) => {
      const taskMatch = msg.match(/^(?:open|show|go to|view|navigate to)\s+task\s+(\d+)/i);
      if (taskMatch) return { type: "task", identifier: taskMatch[1] };

      const docNum = msg.match(/^(?:open|show|go to|view|navigate to)\s+(?:doc|document|note)\s+(\d+)/i);
      if (docNum) return { type: "document", identifier: docNum[1] };

      const docTitle = msg.match(/^(?:open|show|go to|view|navigate to)\s+(?:doc|document|note)\s+["""]([^""]+)["""]/i);
      if (docTitle) return { type: "document", identifier: docTitle[1] };

      return null;
    }
  },
  // General chat patterns (must be LAST)
  {
    intent: "chat",
    patterns: [
      /^(hi|hello|hey)(\s|$)/i,
      /^(what|how|why|when|where|who|tell me|can you|could you|is it|are you|do you|will you)\b/i,
      /^(thanks?|thank you|appreciate|cool|nice|awesome|great|good|ok|okay)$/i,
      /\?$/,
      /^[a-z]{3,}$/i,
      /^[a-z]{1,2}$/i
    ],
    confidence: 0.5,
    data: null
  }
];

export function extractIntent(message: string): IntentResult {
  const lower = message.toLowerCase().trim();
  
  for (const config of INTENT_PATTERNS) {
    for (const pattern of config.patterns) {
      if (pattern.test(lower)) {
        const data = config.extractData ? config.extractData(message) : config.data;
        const hasValidData = data !== null && 
          (typeof data !== 'object' || Object.keys(data).length > 0);
        
        return {
          intent: config.intent,
          confidence: hasValidData ? config.confidence : Math.max(0.5, config.confidence - 0.2),
          data,
          requiresConfirmation: !hasValidData || config.confidence < 0.85
        };
      }
    }
  }
  
  return {
    intent: "chat",
    confidence: 0.5,
    data: null,
    requiresConfirmation: false
  };
}
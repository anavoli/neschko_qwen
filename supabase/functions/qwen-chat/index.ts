import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ChatMessage {
  role: string;
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
  conversationId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { messages }: RequestBody = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Messages array is required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Call Qwen API (using Alibaba Cloud's DashScope API)
    const qwenApiKey = Deno.env.get("QWEN_API_KEY");
    
    if (!qwenApiKey) {
      // Simulate a response if API key is not configured
      const simulatedResponse = generateSimulatedResponse(messages[messages.length - 1].content);
      
      return new Response(
        JSON.stringify({ 
          message: simulatedResponse,
          simulated: true 
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const response = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${qwenApiKey}`,
        },
        body: JSON.stringify({
          model: "qwen-turbo",
          input: {
            messages: messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
          },
          parameters: {
            result_format: "message",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Qwen API error:", errorText);
      
      // Fallback to simulated response
      const simulatedResponse = generateSimulatedResponse(messages[messages.length - 1].content);
      
      return new Response(
        JSON.stringify({ 
          message: simulatedResponse,
          simulated: true 
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();
    const assistantMessage = data.output?.choices?.[0]?.message?.content || "Извините, нисам успео да генеришем одговор.";

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in qwen-chat function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        message: "Здраво! Ја сам Нешко _ Qwen асистент. Како могу да вам помогнем данас?"
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

function generateSimulatedResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes("здраво") || lowerMessage.includes("hello") || lowerMessage.includes("hi") || lowerMessage.includes("ћао")) {
    return "Здраво! Ја сам Нешко _ Qwen асистент. Како могу да вам помогнем данас?";
  }

  if (lowerMessage.includes("како си") || lowerMessage.includes("how are you")) {
    return "Одлично сам, хвала на питању! Ту сам да вам помогнем са било којим питањима која имате.";
  }

  if (lowerMessage.includes("помоћ") || lowerMessage.includes("help") || lowerMessage.includes("помози")) {
    return "Ту сам да помогнем! Можете ме питати о различитим темама, и учинићу све што могу да пружим корисне одговоре. Шта бисте желели да знате?";
  }

  if ((lowerMessage.includes("шта") || lowerMessage.includes("what")) && (lowerMessage.includes("можеш") || lowerMessage.includes("do") || lowerMessage.includes("радиш"))) {
    return "Ја сам AI асистент на бази Qwen. Могу да помогнем са одговорима на питања, пружим информације, помогнем са решавањем проблема и водим разговоре о широком спектру тема. Шта бисте желели да истражимо?";
  }

  return "Хвала на поруци! Ја сам Нешко _ Qwen асистент. Иако тренутно радим у демо режиму, ту сам да разговарам са вама. Слободно ме питајте било шта!";
}
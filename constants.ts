import { Category } from "./types";

export const APP_NAME = "LunarCraft AI";
export const THEME_RED = "#D62828";
export const THEME_GOLD = "#F77F00";

export const CATEGORIES = [
  {
    id: Category.COUPLET,
    label: "靈感對聯 (Couplet)",
    desc: "AI 揮毫，定制您的專屬祥瑞對聯。",
    icon: "📜"
  },
  {
    id: Category.IP_FIGURE,
    label: "新春潮玩 (3D Figure)",
    desc: "生成皮克斯風格的 3D 新春吉祥物。",
    icon: "🧧"
  },
  {
    id: Category.FORTUNE,
    label: "新年求籤 (Divination)",
    desc: "誠心祈福，AI 為您抽取蛇年靈籤與運勢解讀。",
    icon: "🎋"
  }
];

export const MERMAID_CODE = `graph TD
    subgraph "感知層 (Sensory Layer)"
    A[用戶意圖] -->|文本/圖像| B(多模態解析)
    B --> C{氛圍上下文}
    end

    subgraph "路由層 (Router)"
    C -->|對聯| D[分支 A: 語義生成]
    C -->|潮玩| E[分支 B: 視覺生成]
    C -->|求籤| F[分支 C: 命理推演]
    end

    subgraph "AI 處理層 (Processing)"
    D --> D1[LLM 創作]
    D1 --> D2[平仄格律校驗]
    D2 --> D3[書法渲染]
    
    E --> E1[特徵提取]
    E1 --> E2[擴散模型繪製]
    E2 --> E3[3D 風格化]
    
    F --> F1[隨機數運算]
    F1 --> F2[簽文匹配]
    F2 --> F3[運勢解讀]
    end

    subgraph "交付層 (Delivery)"
    D3 --> G[最終年貨]
    E3 --> G
    F3 --> G
    end

    style A fill:#fff,stroke:#D62828,stroke-width:2px
    style G fill:#D62828,stroke:#F77F00,stroke-width:4px,color:white
    style D2 fill:#F77F00,color:white
    linkStyle default stroke:#D62828,stroke-width:2px;
`;
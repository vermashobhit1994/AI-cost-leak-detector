// tool, plan, price
// tool Cost depend on plan when user provided team size = 1
// 1. monthly spend
// 2. team size
// 3. seat count - 0, 1, 2, ......

// purpose of AI tool
// 1. coding
// 2. writing
// 3. data
// 4. research
// 5. mixed


//TODO: same plan cheapest price

// assumption - number of users = number of email id = team size
// assumption - seats count is applicable only for team plan and assumed 0
//              for individual plan and other plans
// assumption - user can have either cost on monthly plan or cost on 
//               yearly plan or both.
// assumption - API cost is calculated by giving parameters as mentioned in 
//              official documentation of that tool or giving direct cost value 

// total cost => plan cost + API cost (if applicable) for that tool

//TODO: create the below array of objects using AI-tool-company-pricing.json data 
// currently hardcoded with real data 
const AIToolCompanyPrices = [
    {
        toolName: "cursor",
        planNamesList: [
            {
                planName: "Hobby",
                priceMonthlyInDollars: 0.00,
                priceYearlyInDollars: 0.00,
                "modelsSupported": []
            },
            {
                planName: "Pro",
                priceMonthlyInDollars: 23.60,
                priceYearlyInDollars: 226.56,
                "modelsSupported": [
                    {
                        "modelName": "",
                        "purpose": ""
                    }

                ]
            },
        ],
        "APIPricing": []
    },
    {
        toolName: "Github Copilot",
        planNamesList: [
            {
                planName: "Free",
                priceMonthlyInDollars: 0.00,
                priceYearlyInDollars: 0.00,
                "modelsSupported": [

                    "Claude Haiku 4.5",
                    "GPT-4.1",
                ],
                "minUsers": 1,
            },
            {
                planName: "Pro",
                priceMonthlyInDollars: 10.00,
                priceYearlyInDollars: null,
                "modelsSupported": [
                    "Claude Haiku 4.5",
                    "GPT-4.1",
                    "GPT-5.4 mini",
                    "Claude Sonnet 4.6",
                    "Claude Sonnet 4.5",
                    "GPT-5.2",
                ]
            },
            {
                planName: "Pro+",
                priceMonthlyInDollars: 39.00,
                priceYearlyInDollars: null,
                "modelsSupported": [
                    "Claude Haiku 4.5",
                    "GPT-4.1",
                    "Claude Opus 4.7",
                    "GPT-5.5",
                    "GPT-5.4",
                    "GPT-5.3 Codex",
                ]
            },
            {
                planName: "Business",
                priceMonthlyInDollars: 39.00,
                priceYearlyInDollars: null,
                "modelsSupported": [
                    "Claude Haiku 4.5",
                    "GPT-4.1",

                ]
            },
        ],

        "APIPricing": []
    },

];

const userEstimatedAIToolsCost = [];

const AIModelDetails = [
    {
        "modelName": "GPT-5.4 mini",
        "purpose": ["coding", "reasoning"],
        "tokensCostPerMillionInDollars": []
    }
]

interface UserPriceInput {
    AItool: string;
    plan: string;
    APICost: string;
    currentMonthlyCostInDollars: string;
    currentYearlyCostInDollars: string;
    seatsCount: string;
    teamSize: string;
    purpose: string;
}

const userPricesList: UserPriceInput[] = [
    {
        "AItool": "claude",
        "plan": "Max 5x",
        "APICost": "",
        "currentMonthlyCostInDollars": "590",
        "currentYearlyCostInDollars": "",
        "seatsCount": "0",
        "teamSize": "5",
        "purpose": "coding"
    }
];

const outputAIToolsCost = [
    {
        "AItool": "",
        "savings": {
            "totalMonthlySavings": "",
            "totalAnnualSavings": "",
        },
        "savingsReasonMessage": "",
        "currentCost": "",
        "recommendedAction": "",
    },

];


// audit engine to calculate AI tool plan cost + API cost 
const auditEngine = (prices: UserPriceInput[]) => {
    // TODO: calculate plan cost using user provided prices list
    prices.forEach((userPrice) => {
        const _tool = userPrice.AItool;
        const _plan = userPrice.plan;

        AIToolCompanyPrices.forEach((_companyPrice) => {
            void _tool;
            void _plan;
            void _companyPrice;
        });
    });
};

void auditEngine;
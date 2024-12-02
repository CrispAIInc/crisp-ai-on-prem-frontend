import React, { useState } from "react";


const faqData = [
    {
        question: "What is Crisp AI?",
        answer:
            "Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content. Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content",
    },
    {
        question: "How does the pricing work?",
        answer: "We offer a subscription-based pricing model with multiple tiers depending on your needs.",
    },
    {
        question: "Can I cancel my subscription?",
        answer: "Yes, you can cancel your subscription at any time from your account settings.",
    },
    {
        question: "Is there a free trial?",
        answer: "Yes, we offer a 14-day free trial for all new users to explore the platform.",
    },
];

const Faqs = () => {
    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(index === openIndex ? null : index);
    };

    return (
        <div className="max-w-2xl p-6 mx-auto">
            <h2 className="mb-6 text-3xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqData.map((item, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 rounded-lg shadow-sm"
                    >
                        <button
                            onClick={() => toggleFAQ(index)}
                            className="flex items-center justify-between w-full p-3 text-lg font-medium text-left text-gray-700 focus:outline-none focus:ring focus:ring-blue-300"
                        >
                            <span>{item.question}</span>
                            <svg
                                className={`w-6 h-6 transform transition-transform ${openIndex === index ? "rotate-180" : ""
                                    }`}
                                fill="none"
                                stroke="#5293FD"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        <div
                            className={`overflow-hidden transition-all duration-300 ${openIndex === index ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
                                }`}
                        >
                            <div className="p-4 text-gray-600">{item.answer}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Faqs;

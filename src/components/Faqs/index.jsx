import FaqItem from '../FaqItem';


// const faqData = [
//     {
//         question: "What is Crisp AI?",
//         answer:
//             "Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content. Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content Crisp AI is a SaaS platform designed to help businesses create interactive stories by extracting factual information from multimodal content",
//     },
//     {
//         question: "How does the pricing work?",
//         answer: "We offer a subscription-based pricing model with multiple tiers depending on your needs.",
//     },
//     {
//         question: "Can I cancel my subscription?",
//         answer: "Yes, you can cancel your subscription at any time from your account settings.",
//     },
//     {
//         question: "Is there a free trial?",
//         answer: "Yes, we offer a 14-day free trial for all new users to explore the platform.",
//     },
// ];

const Faqs = ({ faqs }) => {
    // const [openIndex, setOpenIndex] = useState(null);

    // const toggleFAQ = (index) => {
    //     setOpenIndex(index === openIndex ? null : index);
    // };

    return (
        <div className="">
            <h2 className="mb-6 text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-4">
                {faqs.map((item) => (
                    <FaqItem key={item.id} item={item} isBoxed />
                ))}
            </div>
        </div>
    );
};

export default Faqs;

import FaqItem from '../FaqItem';

const Faqs = ({ heading, faqs }) => {
    return (
        <div className="">
            <h2 className="mb-6 text-2xl font-bold">{heading}</h2>
            <div className="space-y-4">
                {faqs.map((item) => (
                    <FaqItem key={item.id} item={item} isBoxed />
                ))}
            </div>
        </div>
    );
};

export default Faqs;

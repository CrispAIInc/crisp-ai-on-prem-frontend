import { useContext, useState, useRef } from 'react';
import Modal from 'react-bootstrap/Modal';
import { ThemeContext } from '../../contexts/themeContext';
import emailjs from "@emailjs/browser";

export function ContactFormModal({ show, onHide }) {

    const { theme } = useContext(ThemeContext);

    const contactFormRef = useRef(null);

    const [formData, setFormData] = useState({
        from_name: "",
        email_from: "",
        message: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    async function sendEmail() {
        // Create a new FormData object
        // const form = new FormData();
        // form.append('from_name', formData.from_name);
        // form.append('message', formData.message);
        // form.append('email_from', formData.email_from);
        // form.append('reply_to', "achraf.fawzi.a@gmail.com");

        // Pass the FormData object directly
        const res = await emailjs.sendForm(
            'service_nyf1wwq',
            'template_3z83dts',
            contactFormRef.current,
            'user_HhlI04fN5UTTBwkriZ6P2'
        );
        console.log(res);
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="relative note-modal"
        >
            <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-1/2 top-10 -z-0 blur-[160px]"></div>
            <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-35 top-40 -z-0 blur-[160px]"></div>
            <div className="w-56 h-56 bg-yellow-300 rounded-full absolute left-3/4 top-80 -z-10 blur-[160px]"></div>

            <Modal.Header closeButton className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200'}`}>
                <Modal.Title id="contained-modal-title-vcenter">
                    Contact us
                </Modal.Title>
            </Modal.Header>
            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <form className="space-y-4" ref={contactFormRef}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Full Name */}
                        <div>
                            <label htmlFor="from_name" className={`block text-sm font-medium ${theme === 'dark' && 'text-gray-300'}`}>
                                Fullname
                            </label>
                            <input
                                type="text"
                                id="from_name"
                                name="from_name"
                                value={formData.from_name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className={`block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' && 'bg-textColor-300'}`}
                                required
                            />
                        </div>
                        {/* Email */}
                        <div>
                            <label htmlFor="email_from" className={`block text-sm font-medium ${theme === 'dark' && 'text-gray-300'}`}>
                                Email
                            </label>
                            <input
                                type="email"
                                id="email_from"
                                name="email_from"
                                value={formData.email_from}
                                onChange={handleChange}
                                placeholder="Enter your email"
                                className={`block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' && 'bg-textColor-300'}`}
                                required
                            />
                        </div>
                    </div>



                    {/* Message */}
                    <div>
                        <label htmlFor="message" className={`block text-sm font-medium ${theme === 'dark' && 'text-gray-300'}`}>
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Write your message here"
                            rows={5}
                            className={`block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' && 'bg-textColor-300'}`}
                            required
                        />
                    </div>
                </form>
            </Modal.Body>
            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-10 px-2 py-2 rounded-md cursor-pointer w-fit`}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Cancel</span>
                    {/* Submit Button */}
                    <button
                        onClick={sendEmail}
                        className="w-full px-6 py-2 font-medium text-white transition duration-200 bg-blue-500 rounded-md md:w-auto hover:bg-blue-600"
                    >
                        Submit
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}

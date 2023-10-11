"use client";
import { useState, ChangeEvent, FormEvent } from "react";

interface FormData {
  message: string;
}

const ChatForm = () => {
  const [formData, setFormData] = useState<FormData>({
    message: "Qual o rendimento?",
  });

  const [processing, setProcessing] = useState(false);

  const [messages, setMessages] = useState([]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data) {
        console.log(data);
        setMessages((messages) => [...messages, data]);
        console.log("API call successful");
      } else {
        console.error("API call failed");
      }
    } catch (error) {
      console.error("API call error:", error);
    }
    setProcessing(false);
  };

  return (
    <div className="p-8 flex-col">
      <div className="justify-center items-center flex p-2">
        <form className="flex" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="message">Message:</label>
            <input
              className="bg-gray-200 shadow-inner text-black rounded-l p-2 flex-1"
              type="text"
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
            />
          </div>
          <button
            className="bg-purple-600 hover:bg-purple-700 duration-300 text-white shadow p-2 rounded-r"
            type="submit"
            disabled={processing}
          >
            {processing ? "Processing..." : "Submit"}
          </button>
        </form>
      </div>
      <div>
        {messages.map((e) => (
          <div className="m-10">
            <div>Q: {e.question}</div>
            <div className="rounded-md bg-slate-600 p-6">
              {e.completion.choices
                .map((m) => m.message.content)
                .join(". ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatForm;
